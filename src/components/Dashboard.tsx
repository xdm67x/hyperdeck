import { useEffect, useState } from 'preact/hooks'
import { signal } from '@preact/signals'
import type { Deck, Slide } from '../db/schema.ts'
import {
    createDeck,
    createBlankDeck,
    deleteDeck,
    duplicateDeck,
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
import { SlideCanvas } from './SlideCanvas.tsx'

const decks = signal<Deck[]>([])
const previews = signal<Record<string, Slide | undefined>>({})
const loading = signal(true)

export function Dashboard() {
    async function refresh() {
        const all = await listDecks()
        decks.value = all
        const firsts = await Promise.all(
            all.map(async (d) => [d.id, (await getSlides(d.id))[0]] as const),
        )
        previews.value = Object.fromEntries(firsts)
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

    return (
        <div class="grain flex min-h-0 flex-1 flex-col overflow-y-auto">
            <header class="border-b border-line px-10 pb-10 pt-14">
                <div class="mx-auto w-full max-w-6xl">
                    <div class="flex items-end justify-between gap-6">
                        <div class="animate-rise">
                            <div class="chip mb-4 flex items-center gap-2 text-mute">
                                <span class="inline-block h-2 w-2 animate-pulse-dot rounded-full bg-signal" />
                                deck studio — local, no backend
                            </div>
                            <h1 class="font-serif text-6xl leading-none tracking-tight">
                                Hyper<span class="italic text-signal">Deck</span>
                            </h1>
                            <p class="mt-4 max-w-md text-[15px] leading-relaxed text-bone-dim">
                                Build presentations in plain markdown, styled with scoped CSS.
                                Animate anything, persist everything to IndexedDB, and drive a
                                two-window presenter cockpit over BroadcastChannel.
                            </p>
                        </div>
                        <div class="flex flex-col items-end gap-3 pb-1">
                            <div class="flex gap-2">
                                <button
                                    class="chip rounded-sm border border-signal bg-signal px-5 py-3 font-bold text-ink transition hover:bg-amber"
                                    onClick={() => onNewDeck(false)}
                                >
                                    New deck
                                </button>
                                <button
                                    class="chip rounded-sm border border-line-2 px-5 py-3 text-bone-dim transition hover:border-bone-dim hover:text-bone"
                                    onClick={() => onNewDeck(true)}
                                >
                                    Blank deck
                                </button>
                            </div>
                            <label class="chip cursor-pointer rounded-sm border border-dashed border-line-2 px-5 py-2 text-mute transition hover:border-signal hover:text-signal">
                                import .json
                                <input
                                    type="file"
                                    accept=".json,.md,application/json,text/markdown"
                                    class="hidden"
                                    onChange={(e) => {
                                        const f = e.currentTarget.files?.[0]
                                        if (f) onImport(f)
                                        e.currentTarget.value = ''
                                    }}
                                />
                            </label>
                        </div>
                    </div>
                </div>
            </header>

            <main class="mx-auto w-full max-w-6xl flex-1 px-10 py-10">
                {loading.value ? (
                    <p class="chip text-mute">loading decks…</p>
                ) : decks.value.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {decks.value.map((deck, i) => (
                            <DeckCard
                                key={deck.id}
                                deck={deck}
                                preview={previews.value[deck.id]}
                                index={i}
                                onOpen={() => navigate({ view: 'editor', deckId: deck.id })}
                                onPresent={() => openPresentation(deck.id)}
                                onDuplicate={() => onDuplicate(deck.id)}
                                onExport={() => onExport(deck)}
                                onExportMarkdown={() => onExportMarkdown(deck)}
                                onDelete={() => onDelete(deck)}
                            />
                        ))}
                    </div>
                )}
            </main>

            <footer class="mx-auto w-full max-w-6xl px-10 pb-10">
                <p class="chip text-mute">
                    hyperdeck mvp · deno + vite + preact · data lives in your browser
                </p>
            </footer>
        </div>
    )
}

function EmptyState() {
    return (
        <div class="dotgrid flex h-64 flex-col items-center justify-center gap-4 rounded-md border border-dashed border-line-2">
            <p class="font-serif text-2xl italic text-bone-dim">No decks yet.</p>
            <p class="chip text-mute">hit “new deck” — it comes with a guided starter</p>
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
    onExport,
    onExportMarkdown,
    onDelete,
}: {
    deck: Deck
    preview?: Slide
    index: number
    onOpen: () => void
    onPresent: () => void
    onDuplicate: () => void
    onExport: () => void
    onExportMarkdown: () => void
    onDelete: () => void
}) {
    const [confirming, setConfirming] = useState(false)
    return (
        <article
            class="group animate-rise rounded-md border border-line bg-panel transition hover:border-line-2 hover:shadow-[0_18px_44px_-18px_rgba(34,29,21,0.3)]"
            style={{ animationDelay: `${index * 60}ms` }}
        >
            <button class="block w-full" onClick={onOpen} title="Open in editor">
                {preview ? (
                    <SlideCanvas
                        scopeId={`dash_${preview.id}`}
                        markdown={preview.markdown}
                        css={preview.css}
                        globalCss={deck.globalCss}
                        className="rounded-t-md"
                    />
                ) : (
                    <div class="aspect-video rounded-t-md bg-ink-2" />
                )}
            </button>
            <div class="flex flex-col gap-3 border-t border-line p-4">
                <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <h2 class="truncate text-lg font-bold leading-tight">{deck.title}</h2>
                        <p class="chip mt-1 text-mute">
                            {new Date(deck.updatedAt).toLocaleDateString()} · edited{' '}
                            {new Date(deck.updatedAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </p>
                    </div>
                    <button
                        class="chip shrink-0 rounded-sm border border-signal-dim px-3 py-1.5 text-signal transition hover:bg-signal hover:text-ink"
                        onClick={onPresent}
                        title="Open stage + presenter cockpit"
                    >
                        present
                    </button>
                </div>
                <div class="flex items-center gap-2 opacity-70 transition group-hover:opacity-100">
                    <button
                        class="chip rounded-sm px-2 py-1 text-mute transition hover:text-bone"
                        onClick={onDuplicate}
                    >
                        duplicate
                    </button>
                    <button
                        class="chip rounded-sm px-2 py-1 text-mute transition hover:text-bone"
                        onClick={onExport}
                    >
                        json
                    </button>
                    <button
                        class="chip rounded-sm px-2 py-1 text-mute transition hover:text-bone"
                        onClick={onExportMarkdown}
                        title="Export as single markdown file"
                    >
                        md
                    </button>
                    {confirming ? (
                        <span class="ml-auto flex items-center gap-2">
                            <button
                                class="chip rounded-sm bg-signal px-2 py-1 font-bold text-ink"
                                onClick={onDelete}
                            >
                                delete?
                            </button>
                            <button
                                class="chip rounded-sm px-2 py-1 text-mute"
                                onClick={() => setConfirming(false)}
                            >
                                no
                            </button>
                        </span>
                    ) : (
                        <button
                            class="chip ml-auto rounded-sm px-2 py-1 text-mute transition hover:text-signal"
                            onClick={() => setConfirming(true)}
                        >
                            delete
                        </button>
                    )}
                </div>
            </div>
        </article>
    )
}
