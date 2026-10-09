export interface TemplateSlide {
    name: string
    markdown: string
    css: string
}

/**
 * Starter deck handed to every newly created deck. Slides are authored in
 * plain markdown — headings, lists, quotes — while each slide's stylesheet
 * (scoped automatically) carries the layout, typography and animation.
 */
export const starterSlides: TemplateSlide[] = [
    {
        name: 'Title',
        markdown: `HYPERDECK — MARKDOWN DECK STUDIO

# Motion is a
## *first-class citizen.*

Every slide here is plain markdown, rendered live with its own scoped stylesheet.

<aside class="notes">Welcome the audience. Point out that everything they see is just markdown plus CSS — no special format, no backend. Mention the presenter cockpit (present button, two windows, BroadcastChannel sync).</aside>
`,
        css: `.slide {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 88px;
    background: linear-gradient(160deg, #fffdf8 0%, #f7f1e4 100%);
}

p:first-child {
    font-family: "JetBrains Mono", monospace;
    font-size: 14px;
    letter-spacing: 0.32em;
    color: #ff5c1f;
    animation: fade-up 0.7s 0.1s cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

h1 {
    font-family: "Archivo", sans-serif;
    font-size: 96px;
    line-height: 1.02;
    font-weight: 800;
    letter-spacing: -0.03em;
    margin: 26px 0 0;
    animation: fade-up 0.8s 0.25s cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

h2 {
    font-family: "Instrument Serif", serif;
    font-style: italic;
    font-weight: 400;
    font-size: 96px;
    line-height: 1.02;
    color: #b07000;
    margin: 0;
    animation: fade-up 0.8s 0.25s cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

p:last-of-type {
    font-size: 26px;
    color: #5c5342;
    margin: 30px 0 0;
    max-width: 620px;
    animation: fade-up 0.8s 0.45s cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

@keyframes fade-up {
    from {
        opacity: 0;
        transform: translateY(26px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
`,
    },
    {
        name: 'Features',
        markdown: `## Three ways to win the room

- **Scoped styles** — every slide carries its own keyframes and rules, isolated from the rest of the deck.
- **Markdown native** — headings, lists and quotes layout themselves; CSS only adds the polish.
- **Local-first** — everything persists to IndexedDB in your browser. No backend, no accounts.

<aside class="notes">Feature slide. The three cards are just a markdown bullet list — the CSS grid and float animation come from this slide's stylesheet. Each card floats on its own delay.</aside>
`,
        css: `.slide {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 80px;
    background: radial-gradient(900px 600px at 85% -10%, #ffe7d6 0%, #fffdf8 60%);
}

h2 {
    font-size: 56px;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin: 0 0 44px;
}

ul {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 28px;
    list-style: none;
    margin: 0;
    padding: 0;
}

li {
    background: rgba(34, 29, 21, 0.04);
    border: 1px solid #e0d5c0;
    border-radius: 18px;
    padding: 30px 28px;
    font-size: 17px;
    line-height: 1.55;
    color: #5c5342;
    animation: float 5s ease-in-out infinite;
}

li:nth-child(2) { animation-delay: 0.6s; }
li:nth-child(3) { animation-delay: 1.2s; }

strong {
    display: block;
    font-size: 22px;
    color: #221d15;
    margin-bottom: 10px;
}

@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}
`,
    },
    {
        name: 'Typography',
        markdown: `# Display

## Headline

### Overline

Body copy carries the sentence — the heading scale does the performing. Variable fonts animate weight like any other property.

<aside class="notes">Typography scale slide. Archivo is a variable font: the display heading breathes between weight 200 and 900 with a pure CSS keyframe. No JavaScript involved.</aside>
`,
        css: `.slide {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 80px;
    background: #221d15;
    color: #f6f2ea;
}

h1 {
    font-size: 108px;
    margin: 0;
    line-height: 1.05;
    letter-spacing: -0.03em;
    color: #fffdf8;
    animation: breathe 6s ease-in-out infinite;
}

h2 {
    font-size: 72px;
    margin: 0;
    line-height: 1.1;
    font-weight: 300;
    color: #c9c0af;
}

h3 {
    font-family: "JetBrains Mono", monospace;
    font-size: 16px;
    font-weight: 500;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    margin: 0 0 18px;
    color: #ff5c1f;
}

p {
    font-size: 22px;
    line-height: 1.5;
    color: #8d8370;
    margin: 28px 0 0;
    max-width: 560px;
}

@keyframes breathe {
    0%, 100% { font-weight: 200; letter-spacing: 0.01em; }
    50% { font-weight: 900; letter-spacing: -0.04em; }
}
`,
    },
    {
        name: 'Closing',
        markdown: `> Unforgettable decks are written, not exported.

## Go make something **bold**.

<aside class="notes">Closing slide. The pull quote is a markdown blockquote; the big serif italic treatment is CSS. Invite questions.</aside>
`,
        css: `.slide {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 80px;
    background: linear-gradient(160deg, #fffdf8 0%, #f1e9d7 100%);
}

blockquote {
    margin: 0 0 40px;
    border-left: 4px solid #ff5c1f;
    padding: 6px 0 6px 28px;
    font-family: "Instrument Serif", serif;
    font-style: italic;
    font-size: 52px;
    line-height: 1.2;
    color: #221d15;
    animation: fade-up 0.7s 0.1s cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

h2 {
    font-size: 64px;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin: 0;
    animation: fade-up 0.7s 0.3s cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

strong {
    color: #ff5c1f;
}

@keyframes fade-up {
    from {
        opacity: 0;
        transform: translateY(26px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
`,
    },
]
