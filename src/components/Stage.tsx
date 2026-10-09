import { signal } from '@preact/signals'
import { useEffect, useRef } from 'preact/hooks'
import type { Deck, Slide } from '../db/schema.ts'
import { getDeck, getSlides } from '../db/repository.ts'
import { connectSync, emitSlideChange, type SyncHandle } from '../lib/sync.ts'
import { SlideCanvas } from './SlideCanvas.tsx'

const deck = signal<Deck | null>(null)
const slides = signal<Slide[]>([])
const index = signal(0)

/**
 * Main Stage — the audience-facing window of Presenter Mode.
 * Renders slides letterboxed at 16:9, navigates by keyboard/click, and
 * follows HYPERDECK_SLIDE_CHANGE events broadcast by the presenter cockpit.
 */
export function Stage({ deckId }: { deckId: string }) {
    const handleRef = useRef<SyncHandle | null>(null)

    useEffect(() => {
        let alive = true
        ;(async () => {
            const d = await getDeck(deckId)
            const s = await getSlides(deckId)
            if (!alive || !d) return
            deck.value = d
            slides.value = s
        })()
        return () => {
            alive = false
        }
    }, [deckId])

    useEffect(() => {
        const handle = connectSync((msg) => {
            if (
                msg.type === 'HYPERDECK_SLIDE_CHANGE' &&
                msg.deckId === deckId &&
                msg.index !== index.value &&
                msg.index >= 0 &&
                msg.index < slides.value.length
            ) {
                index.value = msg.index
            }
        })
        if (!handle) return
        handleRef.current = handle
        // announce current position so a late-joining cockpit can catch up
        emitSlideChange(handle, deckId, index.value)
        const onKey = (e: KeyboardEvent) => {
            if (
                e.key === 'ArrowRight' ||
                e.key === 'ArrowDown' ||
                e.key === ' ' ||
                e.key === 'PageDown'
            ) {
                e.preventDefault()
                go(1)
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
                e.preventDefault()
                go(-1)
            } else if (e.key === 'Home') {
                setIndex(0)
            } else if (e.key === 'End') {
                setIndex(slides.value.length - 1)
            } else if (e.key.toLowerCase() === 'f') {
                if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
                else document.documentElement.requestFullscreen().catch(() => {})
            }
        }
        window.addEventListener('keydown', onKey)
        return () => {
            window.removeEventListener('keydown', onKey)
            handleRef.current = null
            handle.close()
        }
    }, [deckId])

    function setIndex(next: number) {
        if (next < 0 || next >= slides.value.length || next === index.value) return
        index.value = next
        emitSlideChange(handleRef.current, deckId, next)
    }

    function go(dir: -1 | 1) {
        setIndex(index.value + dir)
    }

    const d = deck.value
    const list = slides.value
    const current = list[index.value]

    return (
        <div class="grain relative flex min-h-0 flex-1 items-center justify-center bg-black">
            {list.length === 0 || !current ? (
                <p class="chip animate-flicker text-mute">
                    {d ? 'this deck has no slides' : 'loading deck…'}
                </p>
            ) : (
                <div
                    class="w-full max-w-full"
                    style={{
                        aspectRatio: '16 / 9',
                        maxHeight: '100dvh',
                        maxWidth: 'calc(100dvh * 16 / 9)',
                    }}
                >
                    <SlideCanvas
                        key={current.id}
                        scopeId={`stage_${current.id}`}
                        markdown={current.markdown}
                        css={current.css}
                        globalCss={d?.globalCss ?? ''}
                        className="h-full w-full animate-rise"
                    />
                </div>
            )}

            {/* click zones */}
            {list.length > 0 && (
                <>
                    <button
                        class="group absolute inset-y-0 left-0 w-[18%] cursor-w-resize"
                        onClick={() => go(-1)}
                        title="Previous slide"
                        aria-label="Previous slide"
                    />
                    <button
                        class="group absolute inset-y-0 right-0 w-[18%] cursor-e-resize"
                        onClick={() => go(1)}
                        title="Next slide"
                        aria-label="Next slide"
                    />
                </>
            )}

            {/* transient chrome */}
            <div class="chip absolute bottom-4 right-4 rounded-sm border border-line bg-ink/70 px-3 py-1.5 text-bone-dim opacity-40 transition hover:opacity-100">
                {index.value + 1} / {list.length} — arrows navigate · f fullscreen
            </div>
        </div>
    )
}
