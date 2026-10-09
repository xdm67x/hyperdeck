import { useEffect, useRef, useState } from 'preact/hooks'
import { scopeCss } from '../lib/scope.ts'
import { renderMarkdown } from '../lib/markdown.ts'

export const STAGE_W = 1280
export const STAGE_H = 720

interface SlideCanvasProps {
    /** Unique scope key — typically the slide id. Must be unique per canvas. */
    scopeId: string
    /** Slide content in markdown; rendered to HTML live. */
    markdown: string
    css: string
    /** Deck-level stylesheet, also scoped to this canvas. */
    globalCss?: string
    className?: string
}

/**
 * Live DOM slide renderer. Markdown is rendered to HTML and wrapped in a
 * `.slide` root (unless the content already ships one) so per-slide CSS can
 * target the slide itself. The slide is authored against a fixed 1280x720
 * stage and scaled to fit its container, so typography and layout behave
 * identically in thumbnails, canvas, stage and cockpit.
 */
export function SlideCanvas({
    scopeId,
    markdown,
    css,
    globalCss = '',
    className = '',
}: SlideCanvasProps) {
    const outerRef = useRef<HTMLDivElement>(null)
    const [fit, setFit] = useState({ scale: 1, x: 0, y: 0 })

    useEffect(() => {
        const el = outerRef.current
        if (!el) return
        // letterbox: the whole 1280x720 stage is always visible and centered,
        // whatever aspect ratio the container has (stage window, cockpit,
        // rail thumbnails) — so every surface shows the true slide
        const measure = () => {
            const scale = Math.min(el.clientWidth / STAGE_W, el.clientHeight / STAGE_H)
            setFit({
                scale,
                x: (el.clientWidth - STAGE_W * scale) / 2,
                y: (el.clientHeight - STAGE_H * scale) / 2,
            })
        }
        measure()
        const ro = new ResizeObserver(measure)
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    // brackets are required — a bare `data-slide-scope="x"` fragment is not
    // a valid selector and the whole stylesheet gets dropped by the parser
    const attr = `[data-slide-scope="${scopeId}"]`
    const scoped = `${scopeCss(globalCss, attr)}\n${scopeCss(css, attr)}`
    const html = renderMarkdown(markdown)
    // Content that predates markdown (or opts into raw HTML) may already
    // carry its own `.slide` root — don't double-wrap it.
    const hasOwnRoot = /class=["'][^"']*\bslide\b[^"']*["']/i.test(html)

    return (
        <div
            ref={outerRef}
            className={`relative overflow-hidden bg-ink-2 ${className}`}
            style={{ aspectRatio: `${STAGE_W} / ${STAGE_H}` }}
        >
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: STAGE_W,
                    height: STAGE_H,
                    transform: `translate(${fit.x}px, ${fit.y}px) scale(${fit.scale})`,
                    transformOrigin: 'top left',
                }}
            >
                <style dangerouslySetInnerHTML={{ __html: scoped }} />
                <div data-slide-scope={scopeId} class="slide-host">
                    {hasOwnRoot ? (
                        <div dangerouslySetInnerHTML={{ __html: html }} />
                    ) : (
                        <div class="slide" dangerouslySetInnerHTML={{ __html: html }} />
                    )}
                </div>
            </div>
        </div>
    )
}
