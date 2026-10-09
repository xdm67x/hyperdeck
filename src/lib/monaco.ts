// NOTE: `?worker` imports (Vite worker syntax) are typed by
// src/types/vite-worker.d.ts as an ambient module declaration.
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

export type CodeEditorInstance = monaco.editor.IStandaloneCodeEditor

let workersConfigured = false

/**
 * One-time Monaco wiring: language-service web workers so CSS/markdown keep
 * VS Code-grade tokenization and diagnostics off the main thread.
 */
export function setupMonaco(): typeof monaco {
    if (!workersConfigured) {
        globalThis.MonacoEnvironment = {
            getWorker(_workerId, label) {
                switch (label) {
                    case 'css':
                        return new cssWorker()
                    case 'html':
                        return new htmlWorker()
                    case 'json':
                        return new jsonWorker()
                    case 'typescript':
                    case 'javascript':
                        return new tsWorker()
                    default:
                        return new editorWorker()
                }
            },
        }
        workersConfigured = true
    }
    return monaco
}

/** Match Monaco's built-in VS Code theme to the app theme. */
export function applyMonacoTheme(dark: boolean) {
    monaco.editor.setTheme(dark ? 'vs-dark' : 'vs')
}
