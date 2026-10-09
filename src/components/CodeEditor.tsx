import { useEffect, useRef, useState } from 'preact/hooks'
import { effect } from '@preact/signals'
import { theme } from '../lib/theme.ts'
import type { CodeEditorInstance } from '../lib/monaco.ts'

export type CodeLanguage = 'markdown' | 'css'

interface CodeEditorProps {
    value: string
    language: CodeLanguage
    onChange: (value: string) => void
}

/**
 * Monaco (the VS Code editor) wrapper. Monaco is heavy, so it is loaded
 * lazily — the main bundle only carries this shell. Theme switches follow
 * the app signal and map onto Monaco's built-in VS Code themes (vs/vs-dark).
 */
export function CodeEditor({ value, language, onChange }: CodeEditorProps) {
    const hostRef = useRef<HTMLDivElement>(null)
    const editorRef = useRef<CodeEditorInstance | null>(null)
    const onChangeRef = useRef(onChange)
    onChangeRef.current = onChange
    const [ready, setReady] = useState(false)

    useEffect(() => {
        let disposed = false
        let editor: CodeEditorInstance | null = null
        void import('../lib/monaco.ts').then(({ setupMonaco, applyMonacoTheme }) => {
            const monaco = setupMonaco()
            if (disposed || !hostRef.current) return
            applyMonacoTheme(theme.value === 'dark')
            editor = monaco.editor.create(hostRef.current, {
                value,
                language,
                automaticLayout: true,
                fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                fontSize: 13,
                lineHeight: 21,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                padding: { top: 12, bottom: 12 },
                renderLineHighlight: 'all',
                smoothScrolling: true,
                scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
                overviewRulerLanes: 0,
                hideCursorInOverviewRuler: true,
            })
            editorRef.current = editor
            // Expose the instance for integration tests, attached to the DOM.
            ;(editor.getDomNode() as HTMLElement & { Monaco?: CodeEditorInstance }).Monaco = editor
            editor.onDidChangeModelContent(() => onChangeRef.current(editor!.getValue()))
            setReady(true)
        })
        return () => {
            disposed = true
            editor?.dispose()
            editorRef.current = null
        }
    }, [])

    // Follow light/dark mode toggle with Monaco's VS Code themes.
    useEffect(() => {
        if (!ready) return
        let disposer = () => {}
        void import('../lib/monaco.ts').then(({ applyMonacoTheme }) => {
            disposer = effect(() => applyMonacoTheme(theme.value === 'dark'))
        })
        return () => disposer()
    }, [ready])

    // External doc replacement (slide switch without a remount).
    useEffect(() => {
        const editor = editorRef.current
        if (!editor || editor.getValue() === value) return
        const sel = editor.getSelection()
        editor.setValue(value)
        if (sel) editor.setSelection(sel)
    }, [value])

    return (
        <div ref={hostRef} class="h-full min-h-0 overflow-hidden">
            {!ready && (
                <div class="chip flex h-full items-center justify-center text-mute">
                    loading editor…
                </div>
            )}
        </div>
    )
}
