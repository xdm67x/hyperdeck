import type { EditorView } from '@codemirror/view'

/** Wrap (or unwrap) the selection with a marker pair like `**` or `` ` ``. */
function wrapSelection(view: EditorView, mark: string, close = mark) {
    const { state } = view
    const range = state.selection.main
    const text = state.sliceDoc(range.from, range.to)
    const before = state.sliceDoc(Math.max(0, range.from - mark.length), range.from)
    const after = state.sliceDoc(range.to, Math.min(state.doc.length, range.to + close.length))
    if (before === mark && after === close) {
        view.dispatch({
            changes: [
                { from: range.to, to: range.to + close.length },
                { from: range.from - mark.length, to: range.from },
            ],
            selection: { anchor: range.from - mark.length },
        })
    } else if (
        text.startsWith(mark) &&
        text.endsWith(close) &&
        text.length >= mark.length + close.length
    ) {
        const inner = text.slice(mark.length, -close.length)
        view.dispatch({
            changes: { from: range.from, to: range.to, insert: inner },
            selection: { anchor: range.from, head: range.from + inner.length },
        })
    } else {
        view.dispatch({
            changes: { from: range.from, to: range.to, insert: mark + text + close },
            selection: {
                anchor: range.from + mark.length,
                head: range.from + mark.length + text.length,
            },
        })
    }
}

/** Toggle a line prefix (`## `, `- `, `> `) on every touched line. */
function toggleLinePrefix(view: EditorView, prefix: string) {
    const { state } = view
    const range = state.selection.main
    const first = state.doc.lineAt(range.from).number
    const last = state.doc.lineAt(range.to).number
    let allHave = true
    for (let l = first; l <= last; l++) {
        if (!state.doc.line(l).text.startsWith(prefix)) {
            allHave = false
            break
        }
    }
    const changes: { from: number; to?: number; insert?: string }[] = []
    for (let l = first; l <= last; l++) {
        const line = state.doc.line(l)
        if (allHave) {
            changes.push({ from: line.from, to: line.from + prefix.length })
        } else if (!line.text.startsWith(prefix)) {
            changes.push({ from: line.from, insert: prefix })
        }
    }
    view.dispatch({ changes })
}

/** Insert a block on its own lines after the cursor's line. */
function insertBlock(view: EditorView, block: string) {
    const { state } = view
    const line = state.doc.lineAt(state.selection.main.from)
    const insert = `\n${block}\n`
    view.dispatch({
        changes: { from: line.to, insert },
        selection: { anchor: line.to + insert.length },
    })
}

interface Tool {
    id: string
    label: string
    title: string
    apply: (view: EditorView) => void
}

const TOOLS: Tool[] = [
    { id: 'h', label: 'H', title: 'Heading', apply: (v) => toggleLinePrefix(v, '## ') },
    { id: 'bold', label: 'B', title: 'Bold', apply: (v) => wrapSelection(v, '**') },
    { id: 'italic', label: 'I', title: 'Italic', apply: (v) => wrapSelection(v, '*') },
    { id: 'code', label: '</>', title: 'Inline code', apply: (v) => wrapSelection(v, '`') },
    {
        id: 'bullet',
        label: '\u2022\u2014',
        title: 'Bullet list',
        apply: (v) => toggleLinePrefix(v, '- '),
    },
    {
        id: 'numbered',
        label: '1.',
        title: 'Numbered list',
        apply: (v) => toggleLinePrefix(v, '1. '),
    },
    { id: 'quote', label: '\u201D', title: 'Quote', apply: (v) => toggleLinePrefix(v, '> ') },
    {
        id: 'link',
        label: '\u2197',
        title: 'Link',
        apply: (v) => wrapSelection(v, '[', '](https://)'),
    },
    {
        id: 'image',
        label: '\u25A1',
        title: 'Image',
        apply: (v) => wrapSelection(v, '![', '](https://)'),
    },
    {
        id: 'table',
        label: '\u229E',
        title: 'Table',
        apply: (v) => insertBlock(v, '| Column | Column |\n| --- | --- |\n| Cell | Cell |'),
    },
    {
        id: 'notes',
        label: 'N\u2020',
        title: 'Speaker notes block',
        apply: (v) => insertBlock(v, '<aside class="notes">\nNotes for the presenter.\n</aside>'),
    },
]

export function MarkdownToolbar({ view }: { view: EditorView | null }) {
    return (
        <div class="flex shrink-0 flex-wrap items-center gap-0.5 border-b border-line bg-panel px-2 py-1.5">
            {TOOLS.map((tool) => (
                <button
                    key={tool.id}
                    type="button"
                    title={tool.title}
                    disabled={!view}
                    class="chip min-w-8 rounded-sm border border-transparent px-2 py-1 font-mono text-bone-dim transition hover:border-line-2 hover:bg-ink-2 hover:text-ink disabled:opacity-30"
                    onClick={() => view && tool.apply(view)}
                >
                    {tool.label}
                </button>
            ))}
        </div>
    )
}
