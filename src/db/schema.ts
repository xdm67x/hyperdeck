import { Dexie, type EntityTable } from 'dexie'

export interface Deck {
    id: string
    title: string
    globalCss: string
    createdAt: number
    updatedAt: number
}

export interface Slide {
    id: string
    deckId: string
    name: string
    order: number
    /** Slide content authored in markdown; rendered to HTML on the canvas. */
    markdown: string
    css: string
}

export const db = new Dexie('hyperdeck') as Dexie & {
    decks: EntityTable<Deck, 'id'>
    slides: EntityTable<Slide, 'id'>
}

db.version(1).stores({
    decks: 'id, title, updatedAt',
    slides: 'id, deckId, [deckId+order]',
})
