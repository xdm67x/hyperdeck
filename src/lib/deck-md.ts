import type { Deck, Slide } from '../db/schema.ts'

/**
 * Single-file markdown interchange format.
 *
 * A deck serializes to plain markdown that renders as a readable document.
 * Structure is carried by greppable HTML-comment markers, so the file stays
 * valid markdown AND is trivially parsable by agents and scripts:
 *
 *     <!-- hyperdeck:deck "Deck title" -->
 *
 *     <!-- hyperdeck:global-css -->
 *
 *     ...deck-wide stylesheet...
 *
 *     <!-- hyperdeck:slide "Slide name" -->
 *
 *     ...slide markdown...
 *
 *     <!-- hyperdeck:css -->
 *
 *     ...slide stylesheet...
 */

export interface DeckMdSlide {
    name: string
    markdown: string
    css: string
}

export interface DeckMd {
    title: string
    globalCss: string
    slides: DeckMdSlide[]
}

const DECK_RE = /^<!--\s*hyperdeck:deck\s+"(.*)"\s*-->$/
const SLIDE_RE = /^<!--\s*hyperdeck:slide\s+"(.*)"\s*-->$/
const GLOBAL_CSS_RE = /^<!--\s*hyperdeck:global-css\s*$/
const CSS_RE = /^<!--\s*hyperdeck:css\s*$/

function escapeAttr(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function unescapeAttr(value: string): string {
    return value.replace(/\\"/g, '"').replace(/\\\\/g, '\\')
}

export function serializeDeckMd(deck: Deck, slides: Slide[]): string {
    const out: string[] = [`<!-- hyperdeck:deck "${escapeAttr(deck.title)}" -->`, '']
    if (deck.globalCss.trim()) {
        out.push('<!-- hyperdeck:global-css', '', deck.globalCss.trimEnd(), '', '-->')
    }
    for (const slide of slides) {
        out.push(`<!-- hyperdeck:slide "${escapeAttr(slide.name)}" -->`, '')
        out.push(slide.markdown.trim())
        if (slide.css.trim()) {
            out.push('', '<!-- hyperdeck:css', '', slide.css.trim(), '', '-->')
        }
        out.push('')
    }
    // collapse triple blank lines produced by joins
    return out.join('\n').replace(/\n{3,}/g, '\n\n') + '\n'
}

export function parseDeckMd(md: string): DeckMd {
    const result: DeckMd = { title: 'Imported deck', globalCss: '', slides: [] }
    let buffer: string[] = []
    // css targets the last slide; global-css before any slide targets the deck
    let target: 'deck' | 'global' | 'slide' | 'slide-css' = 'deck'

    const flush = () => {
        const text = buffer.join('\n').trim()
        buffer = []
        if (!text) return
        if (target === 'global') {
            result.globalCss = text
        } else if (target === 'slide-css') {
            if (result.slides.length > 0) result.slides[result.slides.length - 1].css = text
        } else if (target === 'slide') {
            if (result.slides.length > 0) result.slides[result.slides.length - 1].markdown = text
        }
        // target 'deck': deck-level markdown has no structural meaning; drop it
    }

    for (const rawLine of md.split(/\r?\n/)) {
        const line = rawLine.trim()
        if (DECK_RE.test(line)) {
            flush()
            result.title = unescapeAttr(DECK_RE.exec(line)![1]) || result.title
            continue
        }
        if (SLIDE_RE.test(line)) {
            flush()
            result.slides.push({
                name: unescapeAttr(SLIDE_RE.exec(line)![1]) || `Slide ${result.slides.length + 1}`,
                markdown: '',
                css: '',
            })
            target = 'slide'
            continue
        }
        if (GLOBAL_CSS_RE.test(line)) {
            flush()
            target = 'global'
            continue
        }
        if (CSS_RE.test(line)) {
            flush()
            target = 'slide-css'
            continue
        }
        if (line === '-->') {
            flush()
            target = 'deck'
            continue
        }
        buffer.push(rawLine)
    }
    flush()

    if (result.slides.length === 0) {
        throw new Error('No <!-- hyperdeck:slide "..." --> sections found')
    }
    return result
}
