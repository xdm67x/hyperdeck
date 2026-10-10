import { useEffect, useState } from 'preact/hooks'
import { decodeSharePayload } from '../lib/share.ts'
import { parseDeckMd } from '../lib/deck-md.ts'
import type { Deck, Slide } from '../db/schema.ts'
import { Stage, type DeckSource } from './Stage.tsx'

/**
 * Stage share links and iframe embeds render straight from the URL payload.
 * Unlike the editor share link, nothing is written to the viewer's
 * IndexedDB — watching a presentation never duplicates the deck.
 */
export function SharedStage({ payload }: { payload: string }) {
    const [source, setSource] = useState<DeckSource | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let alive = true
        ;(async () => {
            try {
                const md = await decodeSharePayload(payload)
                const parsed = parseDeckMd(md)
                const deck: Deck = {
                    id: 'shared',
                    title: parsed.title || 'Shared deck',
                    globalCss: parsed.globalCss,
                    createdAt: 0,
                    updatedAt: 0,
                }
                const slides: Slide[] = parsed.slides.map((slide, i) => ({
                    id: `shared_${i}`,
                    deckId: deck.id,
                    name: slide.name,
                    order: i,
                    markdown: slide.markdown,
                    css: slide.css,
                }))
                if (!alive) return
                setSource({ deck, slides })
            } catch (err) {
                if (!alive) return
                setError(err instanceof Error ? err.message : String(err))
            }
        })()
        return () => {
            alive = false
        }
    }, [payload])

    if (error) {
        return (
            <div class="dotgrid flex min-h-0 flex-1 flex-col items-center justify-center gap-4 p-8">
                <p class="font-serif text-3xl italic text-bone-dim">This share link is broken.</p>
                <p class="chip text-bone-dim">{error}</p>
            </div>
        )
    }

    if (!source) {
        return (
            <div class="grain flex min-h-0 flex-1 items-center justify-center bg-black">
                <p class="chip animate-flicker text-mute">loading deck…</p>
            </div>
        )
    }

    return <Stage source={source} />
}
