/**
 * Minimal CSS scoper: rewrites every rule in a slide stylesheet so its
 * selectors only match inside the slide's own container.
 *
 * - plain rules       -> selectors are prefixed with the scope attribute
 * - @media/@supports  -> body is scoped recursively
 * - @keyframes/@font-face and other at-rules -> left untouched
 *
 * Comments and strings containing braces are skipped. Good enough for
 * hand-authored slide CSS; not a full CSS parser.
 */
export function scopeCss(css: string, scope: string): string {
    let out = ''
    let i = 0
    const n = css.length

    while (i < n) {
        const braceIdx = findBrace(css, i)
        if (braceIdx === -1) {
            out += css.slice(i)
            break
        }
        const selector = stripComments(css.slice(i, braceIdx)).trim()
        const { body, next } = readBlock(css, braceIdx)
        out += scopeRule(selector, body, scope)
        i = next
    }
    return out
}

/** Index of the next real `{`, skipping comments and strings. */
function findBrace(css: string, from: number): number {
    let inString: string | null = null
    let inComment = false
    for (let j = from; j < css.length; j++) {
        const ch = css[j]
        if (inComment) {
            if (ch === '/' && css[j - 1] === '*') inComment = false
            continue
        }
        if (inString) {
            if (ch === inString && css[j - 1] !== '\\') inString = null
            continue
        }
        if (ch === '/' && css[j + 1] === '*') {
            inComment = true
            continue
        }
        if (ch === '"' || ch === "'") {
            inString = ch
            continue
        }
        if (ch === '{') return j
    }
    return -1
}

function stripComments(s: string): string {
    return s.replace(/\/\*[\s\S]*?\*\//g, '')
}

function readBlock(css: string, openIdx: number): { body: string; next: number } {
    let depth = 0
    let j = openIdx
    let inString: string | null = null
    let inComment = false
    for (; j < css.length; j++) {
        const ch = css[j]
        const prev = css[j - 1]
        if (inComment) {
            if (ch === '/' && prev === '*') inComment = false
            continue
        }
        if (inString) {
            if (ch === inString && prev !== '\\') inString = null
            continue
        }
        if (ch === '/' && css[j + 1] === '*') {
            inComment = true
            continue
        }
        if (ch === '"' || ch === "'") {
            inString = ch
            continue
        }
        if (ch === '{') depth++
        else if (ch === '}') {
            depth--
            if (depth === 0) {
                return { body: css.slice(openIdx + 1, j), next: j + 1 }
            }
        }
    }
    return { body: css.slice(openIdx + 1), next: css.length }
}

function scopeRule(selector: string, body: string, scope: string): string {
    if (selector.startsWith('@keyframes') || selector.startsWith('@-')) {
        return `${selector}{${body}}`
    }
    if (
        selector.startsWith('@media') ||
        selector.startsWith('@supports') ||
        selector.startsWith('@container') ||
        selector.startsWith('@layer')
    ) {
        return `${selector}{${scopeCss(body, scope)}}`
    }
    if (selector.startsWith('@')) {
        return `${selector}{${body}}`
    }
    if (!selector) {
        return `{${body}}`
    }
    const scoped = selector
        .split(',')
        .map((sel) => {
            const trimmed = sel.trim()
            if (!trimmed) return trimmed
            if (trimmed.startsWith(':root')) {
                return trimmed.replace(/^:root/, scope)
            }
            return `${scope} ${trimmed}`
        })
        .join(', ')
    return `${scoped}{${body}}`
}
