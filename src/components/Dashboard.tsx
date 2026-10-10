import { useEffect, useRef, useState } from 'preact/hooks'
import { signal } from '@preact/signals'
import type { Deck, Slide } from '../db/schema.ts'
import {
    createDeck,
    createBlankDeck,
    deleteDeck,
    duplicateDeck,
    updateDeck,
    exportDeck,
    exportDeckMarkdown,
    importDeck,
    importDeckMarkdown,
    listDecks,
    getSlides,
    type DeckExport,
} from '../db/repository.ts'
import { navigate } from '../state.ts'
import { openPresentation } from '../lib/present.ts'
import { buildShareUrl, type ShareMode } from '../lib/share.ts'
import { theme, toggleTheme } from '../lib/theme.ts'
import { SlideCanvas } from './SlideCanvas.tsx'
import { openContextMenu } from './ContextMenu.tsx'

/** How many slides of each deck are rendered live on the dashboard. */
const PREVIEW_SLIDES = 5

interface DeckPreview {
    /** First slide + up to PREVIEW_SLIDES - 1 followers. */
    slides: Slide[]
    total: number
}

const decks = signal<Deck[]>([])
const previews = signal<Record<string, DeckPreview | undefined>>({})
const loading = signal(true)

export function Dashboard() {
    const importRef = useRef<HTMLInputElement>(null)

    async function refresh() {
        const all = await listDecks()
        decks.value = all
        const entries = await Promise.all(
            all.map(async (d) => {
                const slides = await getSlides(d.id)
                return [
                    d.id,
                    { slides: slides.slice(0, PREVIEW_SLIDES), total: slides.length },
                ] as const
            }),
        )
        previews.value = Object.fromEntries(entries)
        loading.value = false
    }

    useEffect(() => {
        refresh()
    }, [])

    async function onNewDeck(blank: boolean) {
        const deck = blank ? await createBlankDeck('Blank deck') : await createDeck('Untitled deck')
        navigate({ view: 'editor', deckId: deck.id })
    }

    async function onImport(file: File) {
        try {
            const text = await file.text()
            // markdown interchange files carry greppable hyperdeck markers;
            // everything else is treated as a JSON export
            if (text.includes('<!-- hyperdeck:slide')) {
                await importDeckMarkdown(text)
            } else {
                await importDeck(JSON.parse(text) as DeckExport)
            }
            await refresh()
        } catch (err) {
            alert(`Import failed: ${err instanceof Error ? err.message : String(err)}`)
        }
    }

    async function onDuplicate(deckId: string) {
        await duplicateDeck(deckId)
        await refresh()
    }

    async function onRename(deck: Deck, title: string) {
        const next = title.trim()
        if (next && next !== deck.title) {
            await updateDeck(deck.id, { title: next })
            await refresh()
        }
    }

    async function onDelete(deck: Deck) {
        if (!confirm(`Delete "${deck.title}"? This cannot be undone.`)) return
        await deleteDeck(deck.id)
        await refresh()
    }

    function download(name: string, text: string, type: string) {
        const blob = new Blob([text], { type })
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = name
        a.click()
        URL.revokeObjectURL(a.href)
    }

    const slug = (deck: Deck) => deck.title.replace(/[^\w-]+/g, '_').toLowerCase()

    async function onExport(deck: Deck) {
        const data = await exportDeck(deck.id)
        if (!data) return
        download(`${slug(deck)}.hyperdeck.json`, JSON.stringify(data, null, 2), 'application/json')
    }

    async function onExportMarkdown(deck: Deck) {
        const md = await exportDeckMarkdown(deck.id)
        if (!md) return
        download(`${slug(deck)}.hyperdeck.md`, md, 'text/markdown')
    }

    async function onShare(deck: Deck, mode: ShareMode) {
        const md = await exportDeckMarkdown(deck.id)
        if (!md) return
        const url = await buildShareUrl(md, mode)
        try {
            await navigator.clipboard.writeText(url)
            alert(
                mode === 'stage'
                    ? `Stage link copied to clipboard.\n\nAnyone who opens it watches the deck presented straight from the link — it imports as their own local copy.`
                    : `Share link copied to clipboard.\n\nThe deck travels inside the link itself — anyone who opens it gets their own local copy.`,
            )
        } catch {
            // clipboard API unavailable (permission denied / insecure context)
            prompt('Copy this link to share the deck:', url)
        }
    }

    // deck cards stop propagation on their own right-click, so this only
    // fires on the empty canvas — the app's global menu
    function onBackgroundMenu(e: Parameters<typeof openContextMenu>[0]) {
        openContextMenu(e, [
            { label: 'New deck — guided starter', onSelect: () => onNewDeck(false) },
            { label: 'Blank deck', onSelect: () => onNewDeck(true) },
            'separator',
            { label: 'Import deck (.json / .md)…', onSelect: () => importRef.current?.click() },
            'separator',
            {
                label: theme.value === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
                onSelect: () => toggleTheme(),
            },
        ])
    }

    return (
        <div
            class="grain flex min-h-0 flex-1 flex-col overflow-y-auto"
            onContextMenu={onBackgroundMenu}
        >
            <input
                ref={importRef}
                type="file"
                accept=".json,.md,application/json,text/markdown"
                class="hidden"
                onChange={(e) => {
                    const f = e.currentTarget.files?.[0]
                    if (f) onImport(f)
                    e.currentTarget.value = ''
                }}
            />

            <main
                class={
                    loading.value || decks.value.length > 0
                        ? 'flex-1 px-6 pb-10 pt-8 lg:px-10'
                        : 'dotgrid flex flex-1 flex-col items-center justify-center'
                }
            >
                {loading.value ? (
                    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>
                ) : decks.value.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                        {decks.value.map((deck, i) => (
                            <DeckCard
                                key={deck.id}
                                deck={deck}
                                preview={previews.value[deck.id]}
                                index={i}
                                onOpen={() => navigate({ view: 'editor', deckId: deck.id })}
                                onPresent={() => openPresentation(deck.id)}
                                onDuplicate={() => onDuplicate(deck.id)}
                                onRename={(title) => onRename(deck, title)}
                                onExport={() => onExport(deck)}
                                onExportMarkdown={() => onExportMarkdown(deck)}
                                onShare={(mode) => onShare(deck, mode)}
                                onDelete={() => onDelete(deck)}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

function EmptyState() {
    return (
        <div class="flex flex-col items-center gap-4">
            <p class="font-serif text-3xl italic text-bone-dim">Nothing here yet.</p>
            <p class="chip text-bone-dim">
                right-click anywhere to create a deck · import a .json or .md file
            </p>
        </div>
    )
}

function SkeletonCard() {
    return (
        <div class="animate-pulse">
            <div class="aspect-video rounded-md border border-line bg-ink-2" />
            <div class="mt-4 h-3 w-2/3 rounded-sm bg-ink-2" />
            <div class="mt-2 h-2 w-1/3 rounded-sm bg-ink-2" />
        </div>
    )
}

function DeckCard({
    deck,
    preview,
    index,
    onOpen,
    onPresent,
    onDuplicate,
    onRename,
    onExport,
    onExportMarkdown,
    onShare,
    onDelete,
}: {
    deck: Deck
    preview?: DeckPreview
    index: number
    onOpen: () => void
    onPresent: () => void
    onDuplicate: () => void
    onRename: (title: string) => void
    onExport: () => void
    onExportMarkdown: () => void
    onShare: (mode: ShareMode) => void
    onDelete: () => void
}) {
    const first = preview?.slides[0]
    const rest = preview?.slides.slice(1) ?? []
    const total = preview?.total ?? 0
    const overflow = Math.max(0, total - (preview?.slides.length ?? 0))
    const [renaming, setRenaming] = useState(false)
    const [draft, setDraft] = useState(deck.title)
    // guards the unmount blur + Escape paths against double commits
    const renameActiveRef = useRef(false)
    const renameInputRef = useRef<HTMLInputElement>(null)

    // focus/select once when the field mounts — an inline ref callback would
    // re-run every render and select-all after each keystroke
    useEffect(() => {
        if (renaming) {
            const el = renameInputRef.current
            if (el) {
                el.focus()
                el.select()
            }
        }
    }, [renaming])

    function startRename() {
        renameActiveRef.current = true
        setDraft(deck.title)
        setRenaming(true)
    }

    function commitRename() {
        if (!renameActiveRef.current) return
        renameActiveRef.current = false
        const next = draft.trim()
        setRenaming(false)
        if (next && next !== deck.title) onRename(next)
    }

    function cancelRename() {
        renameActiveRef.current = false
        setRenaming(false)
    }

    return (
        <article
            class="group animate-rise rounded-md border border-line bg-panel transition hover:border-signal/60 hover:-translate-y-0.5"
            style={{ animationDelay: `${index * 50}ms` }}
            title="Right-click for deck actions"
            onContextMenu={(e) =>
                openContextMenu(e, [
                    { label: 'Open in editor', onSelect: onOpen },
                    { label: 'Present', onSelect: onPresent },
                    { label: 'Rename deck…', onSelect: startRename },
                    'separator',
                    { label: 'Duplicate deck', onSelect: onDuplicate },
                    { label: 'Copy share link', onSelect: () => onShare('edit') },
                    { label: 'Copy stage link', onSelect: () => onShare('stage') },
                    { label: 'Export .json', onSelect: onExport },
                    { label: 'Export .md', onSelect: onExportMarkdown },
                    'separator',
                    { label: 'Delete deck', onSelect: onDelete, danger: true },
                ])
            }
        >
            {/* Live slide — the card's whole point */}
            <div class="relative overflow-hidden rounded-t-md">
                {first ? (
                    <SlideCanvas
                        scopeId={`dash_${first.id}`}
                        markdown={first.markdown}
                        css={first.css}
                        globalCss={deck.globalCss}
                        className="rounded-t-md"
                    />
                ) : (
                    <div class="dotgrid aspect-video bg-ink-2" />
                )}

                <button
                    class="absolute inset-0 h-full w-full cursor-pointer"
                    onClick={onOpen}
                    title={`Open “${deck.title}” in the editor`}
                    aria-label={`Open ${deck.title} in the editor`}
                />

                {total > 0 && (
                    <span class="chip pointer-events-none absolute left-3 top-3 rounded-sm bg-ink/75 px-2 py-1 text-bone tabular-nums backdrop-blur-sm">
                        {total} slide{total === 1 ? '' : 's'}
                    </span>
                )}

                {/* hover / focus actions over the slide */}
                <div class="pointer-events-none absolute inset-0 flex items-end justify-end gap-2 bg-gradient-to-t from-ink/70 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
                    <button
                        class="chip pointer-events-auto rounded-sm bg-signal px-4 py-1.5 font-bold text-ink transition hover:bg-amber"
                        onClick={(e) => {
                            e.stopPropagation()
                            onPresent()
                        }}
                        title="Open stage + presenter cockpit"
                    >
                        present
                    </button>
                    <button
                        class="chip pointer-events-auto rounded-sm bg-bone px-4 py-1.5 font-bold text-ink transition hover:opacity-90"
                        onClick={(e) => {
                            e.stopPropagation()
                            onOpen()
                        }}
                    >
                        open
                    </button>
                </div>
            </div>

            {/* The rest of the deck, at a glance */}
            {(rest.length > 0 || overflow > 0) && (
                <div class="flex gap-1.5 border-b border-line px-3 py-2.5">
                    {rest.map((slide) => (
                        <button
                            key={slide.id}
                            class="min-w-0 flex-1 overflow-hidden rounded-sm border border-line transition hover:border-signal/60"
                            onClick={onOpen}
                            title={`Open at “${slide.name}”`}
                        >
                            <SlideCanvas
                                scopeId={`dashmini_${slide.id}`}
                                markdown={slide.markdown}
                                css={slide.css}
                                globalCss={deck.globalCss}
                                className="rounded-sm"
                            />
                        </button>
                    ))}
                    {overflow > 0 && (
                        <span class="chip flex aspect-video flex-1 items-center justify-center rounded-sm border border-dashed border-line-2 text-mute tabular-nums">
                            +{overflow}
                        </span>
                    )}
                </div>
            )}

            {/* Meta */}
            <div class="flex items-center gap-3 px-4 py-3">
                <div class="min-w-0 flex-1">
                    {renaming ? (
                        <input
                            class="deck-title w-full rounded-sm border border-signal bg-ink px-2 py-1 text-[15px] font-bold outline-none"
                            value={draft}
                            spellcheck={false}
                            ref={renameInputRef}
                            onInput={(e) => setDraft(e.currentTarget.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') commitRename()
                                else if (e.key === 'Escape') cancelRename()
                            }}
                            onBlur={commitRename}
                        />
                    ) : (
                        <h3 class="deck-title truncate text-[15px] font-bold leading-tight">
                            {deck.title}
                        </h3>
                    )}
                    <p class="chip mt-0.5 text-bone-dim">
                        edited{' '}
                        {new Date(deck.updatedAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                        })}
                        ,{' '}
                        {new Date(deck.updatedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </p>
                </div>
            </div>
        </article>
    )
}
