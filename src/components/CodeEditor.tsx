import { useEffect, useRef } from 'preact/hooks'
import { basicSetup } from 'codemirror'
import { EditorView } from '@codemirror/view'
import { Compartment, EditorState } from '@codemirror/state'
import { markdown } from '@codemirror/lang-markdown'
import { css } from '@codemirror/lang-css'

export type CodeLanguage = 'markdown' | 'css'

interface CodeEditorProps {
    value: string
    language: CodeLanguage
    onChange: (value: string) => void
    /** Notified once with the live EditorView, so toolbars can act on it. */
    onViewReady?: (view: EditorView | null) => void
}

/**
 * CodeMirror 6 wrapper. Emits debounced-free change events; persistence
 * debouncing is owned by the Editor (single save pipeline per keystroke).
 */
export function CodeEditor({ value, language, onChange, onViewReady }: CodeEditorProps) {
    const hostRef = useRef<HTMLDivElement>(null)
    const viewRef = useRef<EditorView | null>(null)
    const langComp = useRef(new Compartment())
    const onChangeRef = useRef(onChange)
    onChangeRef.current = onChange

    useEffect(() => {
        const host = hostRef.current
        if (!host) return

        const view = new EditorView({
            parent: host,
            state: EditorState.create({
                doc: value,
                extensions: [
                    basicSetup,
                    langComp.current.of(language === 'markdown' ? markdown() : css()),
                    EditorView.theme({
                        '&': { height: '100%', backgroundColor: 'transparent' },
                        '.cm-content': {
                            caretColor: '#ff5c1f',
                            fontFamily: '"JetBrains Mono", monospace',
                        },
                        '.cm-gutters': { backgroundColor: 'transparent' },
                    }),
                    EditorView.updateListener.of((update) => {
                        if (update.docChanged) {
                            onChangeRef.current(update.state.doc.toString())
                        }
                    }),
                ],
            }),
        })
        viewRef.current = view
        // Expose the view for integration tests, mirroring CodeMirror's dev-mode convention.
        ;(view.dom as HTMLElement & { CodeMirror?: EditorView }).CodeMirror = view
        onViewReady?.(view)
        return () => {
            view.destroy()
            viewRef.current = null
            onViewReady?.(null)
        }
    }, [])

    // Slide switch or tab switch: replace the doc and reconfigure the language.
    useEffect(() => {
        const view = viewRef.current
        if (!view) return
        if (view.state.doc.toString() === value) return
        view.dispatch({
            changes: { from: 0, to: view.state.doc.length, insert: value },
            effects: langComp.current.reconfigure(language === 'markdown' ? markdown() : css()),
        })
    }, [value, language])

    return <div ref={hostRef} class="h-full min-h-0 overflow-hidden" />
}
