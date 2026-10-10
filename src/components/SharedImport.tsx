import { useEffect, useState } from 'preact/hooks'
import { decodeSharePayload } from '../lib/share.ts'
import { importDeckMarkdown } from '../db/repository.ts'
import { navigate } from '../state.ts'

/**
 * Landing view for `#share=...` links. The deck markdown travels inside the
 * URL hash; this view decodes it, imports it as a local copy, and opens the
 * editor. The shared deck becomes the viewer's own — edits never propagate
 * back to the sender.
 */
export function SharedImport({ payload }: { payload: string }) {
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let alive = true
        ;(async () => {
            try {
                const md = await decodeSharePayload(payload)
                const deck = await importDeckMarkdown(md)
                if (!alive) return
                navigate({ view: 'editor', deckId: deck.id })
            } catch (err) {
                if (!alive) return
                setError(err instanceof Error ? err.message : String(err))
            }
        })()
        return () => {
            alive = false
        }
    }, [payload])

    return (
        <div class="dotgrid flex min-h-0 flex-1 flex-col items-center justify-center gap-4 p-8">
            {error ? (
                <>
                    <p class="font-serif text-3xl italic text-bone-dim">
                        This share link is broken.
                    </p>
                    <p class="chip text-bone-dim">{error}</p>
                    <button
                        class="chip rounded-sm bg-signal px-4 py-1.5 font-bold text-ink transition hover:bg-amber"
                        onClick={() => navigate({ view: 'dashboard' })}
                    >
                        back to your decks
                    </button>
                </>
            ) : (
                <p class="chip text-bone-dim">Importing shared deck…</p>
            )}
        </div>
    )
}
