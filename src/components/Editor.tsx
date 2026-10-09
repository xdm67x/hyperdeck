import { computed, signal } from '@preact/signals'
import { useEffect, useRef } from 'preact/hooks'
import type { Deck, Slide } from '../db/schema.ts'

import { openPresentation } from '../lib/present.ts'
import { layouts } from '../lib/layouts.ts'
import {
    addSlide,
    deleteSlide,
    duplicateSlide,
    getDeck,
    getSlides,
    moveSlide,
    reorderSlides,
    touchDeck,
    updateDeck,
    updateSlide,
} from '../db/repository.ts'
import type { EditorView } from '@codemirror/view'
import { navigate } from '../state.ts'
import { SlideCanvas } from './SlideCanvas.tsx'
import { CodeEditor, type CodeLanguage } from './CodeEditor.tsx'
import { MarkdownToolbar } from './MarkdownToolbar.tsx'
import { openContextMenu } from './ContextMenu.tsx'

const deck = signal<Deck | null>(null)
const slides = signal<Slide[]>([])
const activeId = signal<string | null>(null)
const tab = signal<CodeLanguage | 'deck'>('markdown')
const status = signal<'idle' | 'dirty' | 'saving' | 'saved'>('idle')
const savedAt = signal<number | null>(null)
const editorView = signal<EditorView | null>(null)
const layoutPickerOpen = signal(false)
const dragId = signal<string | null>(null)
const dropTargetId = signal<string | null>(null)

const activeSlide = computed(() => slides.value.find((s) => s.id === activeId.value) ?? null)

const SAVE_DEBOUNCE_MS = 700

type PendingSave =
    | { kind: 'slide'; slideId: string; patch: Partial<Pick<Slide, 'markdown' | 'css' | 'name'>> }
    | { kind: 'deck'; patch: Partial<Pick<Deck, 'title' | 'globalCss'>> }

export function Editor({ deckId }: { deckId: string }) {
    const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
    const pendingRef = useRef<PendingSave | null>(null)

    useEffect(() => {
        let alive = true
        ;(async () => {
            const d = await getDeck(deckId)
            const s = await getSlides(deckId)
            if (!alive || !d) return
            deck.value = d
            slides.value = s
            activeId.value = s[0]?.id ?? null
            status.value = 'idle'
        })()
        return () => {
            alive = false
            clearTimeout(timerRef.current)
            void flushSave()
        }
    }, [deckId])

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault()
                if (deck.value) openPresentation(deck.value.id)
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [])

    async function flushSave() {
        const pending = pendingRef.current
        pendingRef.current = null
        if (!pending) return
        status.value = 'saving'
        try {
            if (pending.kind === 'slide') {
                await updateSlide(pending.slideId, pending.patch)
            } else {
                await updateDeck(deckId, pending.patch)
            }
            await touchDeck(deckId)
            status.value = 'saved'
            savedAt.value = Date.now()
        } catch (err) {
            console.error('HyperDeck save failed', err)
            status.value = 'dirty'
        }
    }

    function scheduleSave(entry: PendingSave) {
        pendingRef.current = entry
        status.value = 'dirty'
        clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => void flushSave(), SAVE_DEBOUNCE_MS)
    }

    function patchSlide(slideId: string, patch: Partial<Pick<Slide, 'markdown' | 'css' | 'name'>>) {
        slides.value = slides.value.map((s) => (s.id === slideId ? { ...s, ...patch } : s))
        scheduleSave({ kind: 'slide', slideId, patch })
    }

    function patchDeck(patch: Partial<Pick<Deck, 'title' | 'globalCss'>>) {
        if (!deck.value) return
        deck.value = { ...deck.value, ...patch }
        scheduleSave({ kind: 'deck', patch })
    }

    async function reloadSlides() {
        slides.value = await getSlides(deckId)
    }

    async function onAddSlide(layoutId?: string) {
        const layout = layouts.find((l) => l.id === layoutId)
        const slide = await addSlide(deckId, layout?.name, layout)
        await reloadSlides()
        activeId.value = slide.id
        tab.value = 'markdown'
        layoutPickerOpen.value = false
    }

    async function onDropSlide(targetId: string) {
        const dragged = dragId.value
        dragId.value = null
        dropTargetId.value = null
        if (!dragged || dragged === targetId) return
        const ids = slides.value.map((s) => s.id)
        const from = ids.indexOf(dragged)
        const to = ids.indexOf(targetId)
        if (from < 0 || to < 0) return
        ids.splice(to, 0, ids.splice(from, 1)[0])
        await reorderSlides(deckId, ids)
        await reloadSlides()
    }

    async function onDuplicateSlide(slideId: string) {
        const copy = await duplicateSlide(deckId, slideId)
        await reloadSlides()
        if (copy) activeId.value = copy.id
    }

    async function onDeleteSlide(slideId: string) {
        const idx = slides.value.findIndex((s) => s.id === slideId)
        await deleteSlide(deckId, slideId)
        await reloadSlides()
        const next = slides.value[Math.max(0, idx - 1)]
        activeId.value = next?.id ?? null
    }

    async function onMoveSlide(slideId: string, dir: -1 | 1) {
        await moveSlide(deckId, slideId, dir)
        await reloadSlides()
    }

    const d = deck.value
    const current = activeSlide.value

    const editorValue =
        tab.value === 'deck'
            ? (d?.globalCss ?? '')
            : tab.value === 'css'
              ? (current?.css ?? '')
              : (current?.markdown ?? '')

    function onEditorChange(value: string) {
        if (tab.value === 'deck') {
            patchDeck({ globalCss: value })
        } else if (current && tab.value === 'markdown') {
            patchSlide(current.id, { markdown: value })
        } else if (current && tab.value === 'css') {
            patchSlide(current.id, { css: value })
        }
    }

    return (
        <div class="grain flex min-h-0 flex-1 flex-col">
            <header class="flex h-14 shrink-0 items-center gap-4 border-b border-line bg-panel px-4">
                <button
                    class="chip rounded-sm border border-line-2 px-3 py-1.5 text-bone-dim transition hover:border-bone-dim hover:text-bone"
                    onClick={() => navigate({ view: 'dashboard' })}
                >
                    &larr; decks
                </button>
                <span class="font-serif text-xl italic">
                    Hyper<span class="not-italic text-signal">Deck</span>
                </span>
                <span class="h-5 w-px bg-line" />
                {d && (
                    <input
                        class="min-w-0 flex-1 truncate rounded-sm border border-transparent bg-transparent px-2 py-1 text-[15px] font-bold outline-none transition focus:border-line-2 focus:bg-ink-2"
                        value={d.title}
                        onInput={(e) => patchDeck({ title: e.currentTarget.value })}
                        spellcheck={false}
                    />
                )}
                <SaveBadge />
                <button
                    class="chip rounded-sm border border-signal-dim px-3 py-1.5 text-signal transition hover:bg-signal hover:text-ink"
                    onClick={() => d && openPresentation(d.id)}
                    disabled={!d}
                    title="Open stage + presenter cockpit (Cmd/Ctrl+Enter)"
                >
                    present
                </button>
            </header>

            <div class="flex min-h-0 flex-1">
                {/* Slide rail */}
                <aside class="flex w-56 shrink-0 flex-col border-r border-line bg-ink-2">
                    <div class="chip flex items-center justify-between px-3 py-2 text-mute">
                        slides <span>{slides.value.length}</span>
                    </div>
                    <div class="min-h-0 flex-1 overflow-y-auto p-2">
                        {slides.value.map((s, i) => (
                            <div
                                key={s.id}
                                draggable
                                onDragStart={(e) => {
                                    dragId.value = s.id
                                    if (e.dataTransfer) {
                                        e.dataTransfer.effectAllowed = 'move'
                                        e.dataTransfer.setData('text/plain', s.id)
                                    }
                                }}
                                onDragEnd={() => {
                                    dragId.value = null
                                    dropTargetId.value = null
                                }}
                                onDragOver={(e) => {
                                    e.preventDefault()
                                    dropTargetId.value = s.id
                                }}
                                onDrop={(e) => {
                                    e.preventDefault()
                                    onDropSlide(s.id)
                                }}
                                class={`mb-2 rounded-sm border transition ${
                                    dropTargetId.value === s.id &&
                                    dragId.value &&
                                    dragId.value !== s.id
                                        ? 'border-signal ring-2 ring-signal/40'
                                        : s.id === activeId.value
                                          ? 'border-signal bg-panel'
                                          : 'border-line hover:border-line-2'
                                } ${dragId.value === s.id ? 'opacity-40' : ''}`}
                                title="Right-click for slide actions · drag to reorder"
                                onContextMenu={(e) =>
                                    openContextMenu(e, [
                                        {
                                            label: 'Duplicate slide',
                                            onSelect: () => onDuplicateSlide(s.id),
                                        },
                                        {
                                            label: 'Move up',
                                            disabled: i === 0,
                                            onSelect: () => onMoveSlide(s.id, -1),
                                        },
                                        {
                                            label: 'Move down',
                                            disabled: i === slides.value.length - 1,
                                            onSelect: () => onMoveSlide(s.id, 1),
                                        },
                                        'separator',
                                        {
                                            label: 'Delete slide',
                                            onSelect: () => onDeleteSlide(s.id),
                                            danger: true,
                                        },
                                    ])
                                }
                            >
                                <button
                                    class="block w-full"
                                    onClick={() => (activeId.value = s.id)}
                                >
                                    <SlideCanvas
                                        scopeId={`rail_${s.id}`}
                                        markdown={s.markdown}
                                        css={s.css}
                                        globalCss={d?.globalCss ?? ''}
                                        className="rounded-t-sm"
                                    />
                                </button>
                                <div class="flex items-center gap-1 px-2 py-1.5">
                                    <span class="chip w-5 shrink-0 text-mute">{i + 1}</span>
                                    {s.id === activeId.value ? (
                                        <input
                                            class="chip min-w-0 flex-1 rounded-sm bg-ink px-1.5 py-0.5 text-bone outline-none"
                                            value={s.name}
                                            onInput={(e) =>
                                                patchSlide(s.id, { name: e.currentTarget.value })
                                            }
                                            spellcheck={false}
                                        />
                                    ) : (
                                        <span class="truncate text-xs text-bone-dim">{s.name}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <button
                        class="chip m-2 rounded-sm border border-dashed border-line-2 py-2 text-bone-dim transition hover:border-signal hover:text-signal"
                        onClick={() => (layoutPickerOpen.value = !layoutPickerOpen.value)}
                    >
                        + add slide &middot; pick layout
                    </button>
                    {layoutPickerOpen.value && (
                        <div class="mx-2 mb-2 grid grid-cols-2 gap-1.5 rounded-sm border border-line bg-panel p-2">
                            {layouts.map((layout) => (
                                <button
                                    key={layout.id}
                                    class="flex flex-col rounded-sm border border-line px-2 py-2 text-left transition hover:border-signal"
                                    onClick={() => onAddSlide(layout.id)}
                                    title={`New slide from ${layout.name} layout`}
                                >
                                    <span class="text-xs font-bold">{layout.name}</span>
                                    <span class="chip text-mute">{layout.hint}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </aside>

                {/* Live canvas */}
                <section class="dotgrid relative flex min-w-0 flex-1 items-center justify-center p-8">
                    {current && d ? (
                        <div class="w-full max-w-[960px] shadow-[0_30px_70px_-24px_rgba(34,29,21,0.45)]">
                            <SlideCanvas
                                key={current.id}
                                scopeId={`canvas_${current.id}`}
                                markdown={current.markdown}
                                css={current.css}
                                globalCss={d.globalCss}
                                className="rounded-md ring-1 ring-line-2"
                            />
                        </div>
                    ) : (
                        <p class="chip text-mute">add a slide to begin</p>
                    )}
                    {current && (
                        <span class="chip absolute bottom-3 left-4 text-mute">
                            canvas · {current.name}
                        </span>
                    )}
                </section>

                {/* Code editor */}
                <section class="flex w-[38%] min-w-[420px] shrink-0 flex-col border-l border-line bg-ink-2">
                    <div class="flex h-10 shrink-0 items-stretch border-b border-line">
                        {(['markdown', 'css', 'deck'] as const).map((t) => (
                            <button
                                key={t}
                                class={`chip border-r border-line px-4 transition ${
                                    tab.value === t
                                        ? 'bg-panel text-signal'
                                        : 'text-mute hover:text-bone'
                                }`}
                                onClick={() => (tab.value = t)}
                            >
                                {t === 'deck' ? 'deck css' : t}
                            </button>
                        ))}
                    </div>
                    {tab.value === 'markdown' && <MarkdownToolbar view={editorView.value} />}
                    <div class="min-h-0 flex-1 overflow-hidden">
                        {current || tab.value === 'deck' ? (
                            <CodeEditor
                                key={`${tab.value}-${tab.value === 'deck' ? 'deck' : current?.id}`}
                                value={editorValue}
                                language={tab.value === 'deck' ? 'css' : tab.value}
                                onChange={onEditorChange}
                                onViewReady={(view) => (editorView.value = view)}
                            />
                        ) : null}
                    </div>
                    <div class="chip flex h-8 shrink-0 items-center border-t border-line px-3 text-mute">
                        <span>
                            {tab.value === 'deck'
                                ? 'global stylesheet — scoped into every slide'
                                : tab.value === 'css'
                                  ? 'slide stylesheet — scoped to this slide'
                                  : 'markdown — rendered live on the canvas'}
                        </span>
                    </div>
                </section>
            </div>
        </div>
    )
}

function SaveBadge() {
    const map = {
        idle: ['text-mute', '—'],
        dirty: ['text-signal', 'unsaved edits'],
        saving: ['text-amber', 'saving…'],
        saved: [
            'text-mint',
            savedAt.value ? `saved ${new Date(savedAt.value).toLocaleTimeString()}` : 'saved',
        ],
    } as const
    const [cls, label] = map[status.value]
    return (
        <span class={`chip flex items-center gap-1.5 px-1 ${cls}`}>
            <span
                class={`inline-block h-1.5 w-1.5 rounded-full ${
                    status.value === 'dirty' || status.value === 'saving'
                        ? 'animate-pulse-dot bg-current'
                        : 'bg-current'
                }`}
            />
            {label}
        </span>
    )
}
