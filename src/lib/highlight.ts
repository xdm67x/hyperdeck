import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import css from 'highlight.js/lib/languages/css'
import diff from 'highlight.js/lib/languages/diff'
import go from 'highlight.js/lib/languages/go'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import markdown from 'highlight.js/lib/languages/markdown'
import python from 'highlight.js/lib/languages/python'
import rust from 'highlight.js/lib/languages/rust'
import scss from 'highlight.js/lib/languages/scss'
import sql from 'highlight.js/lib/languages/sql'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import yaml from 'highlight.js/lib/languages/yaml'

for (const lang of [
    bash,
    css,
    diff,
    go,
    java,
    javascript,
    json,
    markdown,
    python,
    rust,
    scss,
    sql,
    typescript,
    xml,
    yaml,
]) {
    hljs.registerLanguage(lang.name, lang)
}

function escapeHtml(text: string): string {
    return text
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
}

/**
 * Highlight a fenced code block for slide rendering. Returns HTML with
 * `hljs-*` token classes (styled globally in styles/global.css); falls back
 * to escaped plain text for unknown or missing languages.
 */
export function highlightCode(code: string, lang?: string): string {
    const name = lang?.trim().split(/\s+/)[0]?.toLowerCase() ?? ''
    if (name && hljs.getLanguage(name)) {
        try {
            return hljs.highlight(code, { language: name, ignoreIllegals: true }).value
        } catch {
            /* fall through to plain text */
        }
    }
    return escapeHtml(code)
}
