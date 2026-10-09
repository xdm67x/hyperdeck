import { marked } from 'marked'
import { highlightCode } from './highlight.ts'

marked.use({
    gfm: true,
    breaks: true,
    renderer: {
        // fenced code blocks are syntax-highlighted (hljs-* token classes,
        // themed in styles/global.css) instead of rendered as plain text
        code({ text, lang }) {
            return `<pre><code class="hljs">${highlightCode(text, lang)}</code></pre>\n`
        },
    },
})

/**
 * Render slide markdown to HTML. Raw HTML blocks (like the speaker-notes
 * `<aside class="notes">`) pass through untouched, so slides stay fully
 * expressive while the authoring format stays simple markdown.
 */
export function renderMarkdown(md: string): string {
    if (!md) return ''
    try {
        return marked.parse(md, { async: false })
    } catch {
        return ''
    }
}

/**
 * Extract speaker notes from `<aside class="notes">` blocks embedded in the
 * slide markdown. Inner HTML tags are stripped; the text is returned as-is.
 */
export function extractNotes(md: string): string {
    const notes: string[] = []
    const re = /<aside[^>]*class=["'][^"']*notes[^"']*["'][^>]*>([\s\S]*?)<\/aside>/gi
    let match: RegExpExecArray | null
    while ((match = re.exec(md)) !== null) {
        const text = match[1]
            .replace(/<[^>]+>/g, '')
            .replace(/\n{3,}/g, '\n\n')
            .trim()
        if (text) notes.push(text)
    }
    return notes.join('\n\n')
}
