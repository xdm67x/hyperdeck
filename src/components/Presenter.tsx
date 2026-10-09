import { computed, signal } from '@preact/signals'
import { useEffect, useRef, useState } from 'preact/hooks'
import type { Deck, Slide } from '../db/schema.ts'
import { getDeck, getSlides } from '../db/repository.ts'
import { connectSync, emitSlideChange, type SyncHandle } from '../lib/sync.ts'
import { extractNotes } from '../lib/markdown.ts'
import { formatElapsed } from '../lib/present.ts'
import { SlideCanvas } from './SlideCanvas.tsx'

const deck = signal<Deck | null>(null)
const slides = signal<Slide[]>([])
const index = signal(0)

const currentSlide = computed(() => slides.value[index.value] ?? null)
const nextSlide = computed(() => slides.value[index.value + 1] ?? null)
const notes = computed(() => {
    const slide = currentSlide.value
    return slide ? extractNotes(slide.markdown) : ''
})

/**
 * Presenter Cockpit — the speaker-facing window of Presenter Mode.
 * Timer, speaker notes extracted from <aside class="notes"> blocks, a next
 * slide preview, and nav controls whose every change is broadcast to the
 * main stage as a HYPERDECK_SLIDE_CHANGE event.
 */
export function Presenter({ deckId }: { deckId: string }) {
    const handleRef = useRef<SyncHandle | null>(null)
    const [elapsed, setElapsed] = useState(0)
    const [running, setRunning] = useState(true)

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
        // drive the stage to wherever this cockpit is
        emitSlideChange(handle, deckId, index.value)
        return () => {
            handleRef.current = null
            handle.close()
        }
    }, [deckId])

    useEffect(() => {
        if (!running) return
        const id = setInterval(() => setElapsed((e) => e + 1), 1000)
        return () => clearInterval(id)
    }, [running])

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === 'PageDown') {
                e.preventDefault()
                go(1)
            } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
                e.preventDefault()
                go(-1)
            } else if (e.key.toLowerCase() === 't') {
                setRunning((r) => !r)
            } else if (e.key.toLowerCase() === 'r') {
                setElapsed(0)
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [])

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
    const current = currentSlide.value
    const next = nextSlide.value
    const progress = list.length > 0 ? (index.value + 1) / list.length : 0

    return (
        <div class="grain flex min-h-0 flex-1 flex-col bg-ink">
            <header class="flex h-12 shrink-0 items-center gap-4 border-b border-line bg-panel px-4">
                <span class="chip flex items-center gap-2 text-mute">
                    <span class="inline-block h-2 w-2 animate-pulse-dot rounded-full bg-signal" />
                    presenter cockpit
                </span>
                <span class="truncate text-sm font-bold">{d?.title ?? '…'}</span>
                <span class="chip ml-auto text-mute">
                    {index.value + 1} / {list.length}
                </span>
                <button
                    class="chip rounded-sm border border-line-2 px-2 py-1 text-mute transition hover:text-bone"
                    onClick={() => window.close()}
                >
                    close
                </button>
            </header>

            <div class="h-0.5 shrink-0 bg-line">
                <div
                    class="h-full bg-signal transition-all duration-300"
                    style={{ width: `${progress * 100}%` }}
                />
            </div>

            <div class="flex min-h-0 flex-1 flex-col lg:flex-row">
                {/* Current slide */}
                <section class="flex min-h-0 flex-1 flex-col p-5">
                    <div class="chip mb-3 flex items-center justify-between text-mute">
                        <span>on stage</span>
                    </div>
                    <div class="flex min-h-0 flex-1 items-center justify-center">
                        {current ? (
                            <SlideCanvas
                                key={current.id}
                                scopeId={`cockpit_${current.id}`}
                                markdown={current.markdown}
                                css={current.css}
                                globalCss={d?.globalCss ?? ''}
                                className="max-h-full w-full rounded-md ring-1 ring-line-2"
                            />
                        ) : (
                            <p class="chip text-mute">no slides</p>
                        )}
                    </div>
                    <div class="mt-4 flex items-center justify-center gap-3">
                        <button
                            class="chip rounded-sm border border-line-2 px-6 py-2.5 text-bone transition enabled:hover:border-signal enabled:hover:text-signal disabled:opacity-30"
                            onClick={() => go(-1)}
                            disabled={index.value <= 0}
                        >
                            &larr; prev
                        </button>
                        <button
                            class="chip rounded-sm bg-signal px-8 py-2.5 font-bold text-ink transition enabled:hover:bg-amber disabled:opacity-30"
                            onClick={() => go(1)}
                            disabled={index.value >= list.length - 1}
                        >
                            next &rarr;
                        </button>
                    </div>
                </section>

                {/* Side column */}
                <section class="flex w-full shrink-0 flex-col gap-5 border-t border-line bg-ink-2 p-5 lg:w-[380px] lg:border-t-0 lg:border-l">
                    {/* Timer */}
                    <div class="flex items-center justify-between rounded-md border border-line bg-panel px-4 py-3">
                        <div>
                            <div class="chip text-mute">elapsed</div>
                            <div class="font-mono text-3xl font-bold tabular-nums">
                                {formatElapsed(elapsed)}
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button
                                class="chip rounded-sm border border-line-2 px-3 py-1.5 text-bone-dim transition hover:border-bone-dim hover:text-bone"
                                onClick={() => setRunning((r) => !r)}
                            >
                                {running ? 'pause' : 'resume'}
                            </button>
                            <button
                                class="chip rounded-sm border border-line-2 px-3 py-1.5 text-bone-dim transition hover:border-signal hover:text-signal"
                                onClick={() => setElapsed(0)}
                            >
                                reset
                            </button>
                        </div>
                    </div>

                    {/* Next slide preview */}
                    <div class="flex min-h-0 flex-shrink-0 flex-col gap-3">
                        <div class="chip text-mute">next up</div>
                        {next ? (
                            <button
                                class="block rounded-md border border-line transition hover:border-line-2"
                                onClick={() => setIndex(index.value + 1)}
                            >
                                <SlideCanvas
                                    scopeId={`cockpit_next_${next.id}`}
                                    markdown={next.markdown}
                                    css={next.css}
                                    globalCss={d?.globalCss ?? ''}
                                    className="rounded-md"
                                />
                            </button>
                        ) : (
                            <div class="dotgrid flex aspect-video items-center justify-center rounded-md border border-dashed border-line-2">
                                <span class="chip text-mute">end of deck</span>
                            </div>
                        )}
                    </div>

                    {/* Speaker notes */}
                    <div class="flex min-h-0 flex-1 flex-col gap-3">
                        <div class="chip text-mute">speaker notes</div>
                        <div class="min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap rounded-md border border-line bg-panel p-4 text-[15px] leading-relaxed text-bone-dim">
                            {notes.value || (
                                <span class="italic text-mute">
                                    No notes on this slide — embed an{' '}
                                    <code class="text-signal">{`<aside class="notes">`}</code> block
                                    in the slide HTML.
                                </span>
                            )}
                        </div>
                    </div>
                </section>
            </div>

            <footer class="chip flex h-8 shrink-0 items-center justify-center border-t border-line text-mute">
                &larr; &rarr; navigate · t pause timer · r reset timer · stage follows this window
            </footer>
        </div>
    )
}
