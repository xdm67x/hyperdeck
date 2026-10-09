import type { Deck, Slide } from './schema.ts'
import { db } from './schema.ts'
import { starterSlides } from '../lib/template.ts'
import type { SlideLayout } from '../lib/layouts.ts'
import { parseDeckMd, serializeDeckMd } from '../lib/deck-md.ts'

export function uid(prefix: string): string {
    const rand =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID().slice(0, 8)
            : Math.random().toString(36).slice(2, 10)
    return `${prefix}_${Date.now().toString(36)}_${rand}`
}

export interface DeckExport {
    kind: 'hyperdeck'
    version: number
    deck: Omit<Deck, 'id'>
    /** `html` is only present in exports from the pre-markdown app version. */
    slides: Array<Omit<Slide, 'deckId'> & { html?: string }>
}

export async function listDecks(): Promise<Deck[]> {
    const decks = await db.decks.orderBy('updatedAt').reverse().toArray()
    return decks
}

export async function countSlides(deckId: string): Promise<number> {
    return db.slides.where('deckId').equals(deckId).count()
}

export async function getDeck(deckId: string): Promise<Deck | undefined> {
    return db.decks.get(deckId)
}

export async function createDeck(title: string): Promise<Deck> {
    const now = Date.now()
    const deck: Deck = {
        id: uid('deck'),
        title: title.trim() || 'Untitled deck',
        globalCss: starterGlobalCss,
        createdAt: now,
        updatedAt: now,
    }
    await db.decks.add(deck)
    await db.slides.bulkAdd(
        starterSlides.map((s, i) => ({
            ...s,
            id: uid('slide'),
            deckId: deck.id,
            order: i,
        })),
    )
    return deck
}

export async function createBlankDeck(title: string): Promise<Deck> {
    const now = Date.now()
    const deck: Deck = {
        id: uid('deck'),
        title: title.trim() || 'Untitled deck',
        globalCss: '',
        createdAt: now,
        updatedAt: now,
    }
    await db.decks.add(deck)
    await addSlide(deck.id, 'Slide 1')
    return deck
}

export async function touchDeck(deckId: string) {
    await db.decks.update(deckId, { updatedAt: Date.now() })
}

export async function updateDeck(
    deckId: string,
    patch: Partial<Pick<Deck, 'title' | 'globalCss' | 'updatedAt'>>,
) {
    await db.decks.update(deckId, { ...patch, updatedAt: Date.now() })
}

export async function deleteDeck(deckId: string) {
    await db.transaction('rw', db.decks, db.slides, async () => {
        await db.slides.where('deckId').equals(deckId).delete()
        await db.decks.delete(deckId)
    })
}

export async function duplicateDeck(deckId: string): Promise<Deck | undefined> {
    const deck = await db.decks.get(deckId)
    if (!deck) return undefined
    const slides = await getSlides(deckId)
    const now = Date.now()
    const copy: Deck = {
        ...deck,
        id: uid('deck'),
        title: `${deck.title} (copy)`,
        createdAt: now,
        updatedAt: now,
    }
    await db.transaction('rw', db.decks, db.slides, async () => {
        await db.decks.add(copy)
        await db.slides.bulkAdd(slides.map((s) => ({ ...s, id: uid('slide'), deckId: copy.id })))
    })
    return copy
}

export async function getSlides(deckId: string): Promise<Slide[]> {
    const slides = await db.slides.where('deckId').equals(deckId).toArray()
    slides.sort((a, b) => a.order - b.order)
    return slides
}

export async function addSlide(
    deckId: string,
    name?: string,
    layout?: SlideLayout,
): Promise<Slide> {
    const count = await countSlides(deckId)
    const slide: Slide = {
        id: uid('slide'),
        deckId,
        name: name ?? layout?.name ?? `Slide ${count + 1}`,
        order: count,
        markdown: layout?.markdown ?? blankSlideMarkdown,
        css: layout?.css ?? blankSlideCss,
    }
    await db.transaction('rw', db.slides, db.decks, async () => {
        await db.slides.add(slide)
        await touchDeck(deckId)
    })
    return slide
}

export async function duplicateSlide(deckId: string, slideId: string): Promise<Slide | undefined> {
    const slide = await db.slides.get(slideId)
    if (!slide) return undefined
    const all = await getSlides(deckId)
    const idx = all.findIndex((s) => s.id === slideId)
    // shift the orders after the source slide
    const moving = all.slice(idx + 1).map((s) => ({ ...s, order: s.order + 1 }))
    const copy: Slide = { ...slide, id: uid('slide'), order: slide.order + 1 }
    await db.transaction('rw', db.slides, db.decks, async () => {
        await db.slides.bulkPut(moving)
        await db.slides.add(copy)
        await touchDeck(deckId)
    })
    return copy
}

export async function updateSlide(
    slideId: string,
    patch: Partial<Pick<Slide, 'markdown' | 'css' | 'name'>>,
) {
    await db.slides.update(slideId, patch)
}

export async function deleteSlide(deckId: string, slideId: string) {
    await db.transaction('rw', db.slides, db.decks, async () => {
        const slide = await db.slides.get(slideId)
        if (!slide) return
        await db.slides.delete(slideId)
        const after = await db.slides
            .where('deckId')
            .equals(deckId)
            .filter((s) => s.order > slide.order)
            .toArray()
        await db.slides.bulkPut(after.map((s) => ({ ...s, order: s.order - 1 })))
        await touchDeck(deckId)
    })
}

export async function moveSlide(deckId: string, slideId: string, dir: -1 | 1) {
    const all = await getSlides(deckId)
    const idx = all.findIndex((s) => s.id === slideId)
    const swapIdx = idx + dir
    if (idx < 0 || swapIdx < 0 || swapIdx >= all.length) return
    const a = { ...all[idx], order: all[swapIdx].order }
    const b = { ...all[swapIdx], order: all[idx].order }
    await db.transaction('rw', db.slides, db.decks, async () => {
        await db.slides.bulkPut([a, b])
        await touchDeck(deckId)
    })
}

/** Persist a full new order for a deck's slides (ids in target sequence). */
export async function reorderSlides(deckId: string, orderedIds: string[]): Promise<void> {
    await db.transaction('rw', db.slides, db.decks, async () => {
        for (const [i, id] of orderedIds.entries()) {
            await db.slides.update(id, { order: i })
        }
        await touchDeck(deckId)
    })
}

/** Serialize a deck to the single-file markdown interchange format. */
export async function exportDeckMarkdown(deckId: string): Promise<string | undefined> {
    const deck = await db.decks.get(deckId)
    if (!deck) return undefined
    const slides = await getSlides(deckId)
    return serializeDeckMd(deck, slides)
}

/** Create a deck from the single-file markdown interchange format. */
export async function importDeckMarkdown(md: string): Promise<Deck> {
    const parsed = parseDeckMd(md)
    const now = Date.now()
    const deck: Deck = {
        id: uid('deck'),
        title: parsed.title || 'Imported deck',
        globalCss: parsed.globalCss,
        createdAt: now,
        updatedAt: now,
    }
    const slides: Slide[] = parsed.slides.map((slide, i) => ({
        id: uid('slide'),
        deckId: deck.id,
        name: slide.name,
        order: i,
        markdown: slide.markdown,
        css: slide.css,
    }))
    await db.transaction('rw', db.decks, db.slides, async () => {
        await db.decks.add(deck)
        await db.slides.bulkAdd(slides)
    })
    return deck
}

export async function exportDeck(deckId: string): Promise<DeckExport | undefined> {
    const deck = await db.decks.get(deckId)
    if (!deck) return undefined
    const slides = await getSlides(deckId)
    const { id: _d, ...deckMeta } = deck
    return {
        kind: 'hyperdeck',
        version: 2,
        deck: deckMeta,
        slides: slides.map(({ deckId: _s, ...rest }) => rest),
    }
}

export async function importDeck(json: DeckExport): Promise<Deck> {
    if (json?.kind !== 'hyperdeck' || !json.deck || !Array.isArray(json.slides)) {
        throw new Error('Not a HyperDeck export file')
    }
    const now = Date.now()
    const deck: Deck = {
        ...json.deck,
        id: uid('deck'),
        title: json.deck.title || 'Imported deck',
        createdAt: now,
        updatedAt: now,
    }
    const slides: Slide[] = json.slides
        .filter((s) => typeof s.markdown === 'string' || typeof s.html === 'string')
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((s, i) => ({
            id: uid('slide'),
            deckId: deck.id,
            name: s.name || `Slide ${i + 1}`,
            order: i,
            markdown: s.markdown ?? s.html ?? '',
            css: s.css ?? '',
        }))
    if (slides.length === 0) {
        slides.push({
            id: uid('slide'),
            deckId: deck.id,
            name: 'Slide 1',
            order: 0,
            markdown: blankSlideMarkdown,
            css: blankSlideCss,
        })
    }
    await db.transaction('rw', db.decks, db.slides, async () => {
        await db.decks.add(deck)
        await db.slides.bulkAdd(slides)
    })
    return deck
}

const starterGlobalCss = `/* Global deck stylesheet — applied to every slide. */

.slide {
  font-family: "Archivo", system-ui, sans-serif;
  color: #221d15;
  background: #fffdf8;
}
`

const blankSlideMarkdown = `## New slide

Start writing in **markdown** — headings, lists, quotes and links all render live.

<aside class="notes">Speaker notes go here.</aside>
`

const blankSlideCss = `.slide {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 24px;
    padding: 72px;
}

h2 {
    font-size: 84px;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin: 0;
}

p {
    font-size: 28px;
    color: #5c5342;
    margin: 0;
}
`
