import type { Deck, Slide } from '../db/schema.ts'
import {
    addSlide,
    createDeck,
    createBlankDeck,
    deleteDeck,
    exportDeck,
    exportDeckMarkdown,
    getDeck,
    getSlides,
    importDeck,
    importDeckMarkdown,
    listDecks,
    reorderSlides,
    touchDeck,
    updateSlide,
} from '../db/repository.ts'
import type { DeckExport } from '../db/repository.ts'
import { layouts } from './layouts.ts'
import { navigate } from '../state.ts'
import { openPresentation } from './present.ts'

/**
 * Programmable surface for AI agents, scripts and browser automation.
 *
 * Everything the UI can do is exposed here as plain async functions on
 * `window.hyperdeck`, so an agent can drive HyperDeck without touching the
 * DOM:
 *
 *     const { hyperdeck } = window
 *     const deck = await hyperdeck.createDeck('Demo')
 *     await hyperdeck.createSlide(deck.id, { markdown: '## Hello' })
 *     await hyperdeck.open(deck.id)      // -> editor view
 *     await hyperdeck.present(deck.id)   // -> stage + cockpit windows
 *     const md = await hyperdeck.exportMarkdown(deck.id)
 *
 * Deck interchange is JSON (`exportJson` / `importJson`) or a single
 * human-readable markdown file (`exportMarkdown` / `importMarkdown`).
 */
export interface HyperdeckApi {
    readonly version: 1

    /** All decks, most recently edited first. */
    decks(): Promise<Deck[]>
    /** One deck plus its slides in order. */
    deck(deckId: string): Promise<{ deck: Deck; slides: Slide[] } | null>
    /** Create a deck. `opts.blank` skips the guided starter deck. */
    createDeck(title?: string, opts?: { blank?: boolean }): Promise<Deck>
    deleteDeck(deckId: string): Promise<void>

    /** Append a slide; pass a layout id from the gallery or raw content. */
    createSlide(
        deckId: string,
        opts?: { name?: string; layoutId?: string; markdown?: string; css?: string },
    ): Promise<Slide>
    /** Patch a slide's name / markdown / css. */
    updateSlide(
        slideId: string,
        patch: Partial<Pick<Slide, 'name' | 'markdown' | 'css'>>,
    ): Promise<void>
    /** Persist a full slide order (ids in target sequence). */
    reorderSlides(deckId: string, orderedIds: string[]): Promise<void>

    /** JSON interchange — same format as the dashboard export button. */
    exportJson(deckId: string): Promise<DeckExport | undefined>
    importJson(data: DeckExport): Promise<Deck>
    /** Single-file markdown interchange (valid markdown, greppable markers). */
    exportMarkdown(deckId: string): Promise<string | undefined>
    importMarkdown(md: string): Promise<Deck>

    /** Navigate this window to the editor for a deck. */
    open(deckId: string): void
    /** Open the stage + presenter cockpit windows for a deck. */
    present(deckId: string): void
}

declare global {
    interface Window {
        hyperdeck?: HyperdeckApi
    }
}

export function installAgentApi(): HyperdeckApi {
    const api: HyperdeckApi = {
        version: 1,
        decks: () => listDecks(),
        deck: async (deckId) => {
            const deck = await getDeck(deckId)
            if (!deck) return null
            return { deck, slides: await getSlides(deckId) }
        },
        createDeck: (title, opts) =>
            opts?.blank
                ? createBlankDeck(title ?? 'Blank deck')
                : createDeck(title ?? 'Untitled deck'),
        deleteDeck,
        createSlide: async (deckId, opts) => {
            const layout = opts?.layoutId ? layouts.find((l) => l.id === opts?.layoutId) : undefined
            const slide = await addSlide(deckId, opts?.name, layout)
            const patch: Partial<Pick<Slide, 'markdown' | 'css'>> = {}
            if (opts?.markdown !== undefined) patch.markdown = opts.markdown
            if (opts?.css !== undefined) patch.css = opts.css
            if (Object.keys(patch).length > 0) {
                Object.assign(slide, patch)
                await updateSlide(slide.id, patch)
                await touchDeck(deckId)
            }
            return slide
        },
        updateSlide: (slideId, patch) => updateSlide(slideId, patch),
        reorderSlides,
        exportJson: (deckId) => exportDeck(deckId),
        importJson: (data) => importDeck(data),
        exportMarkdown: (deckId) => exportDeckMarkdown(deckId),
        importMarkdown: (md) => importDeckMarkdown(md),
        open: (deckId) => navigate({ view: 'editor', deckId }),
        present: (deckId) => openPresentation(deckId),
    }
    window.hyperdeck = api
    return api
}
