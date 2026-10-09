/**
 * Slide layout gallery — the developer/agent equivalent of the Google Slides
 * "new slide" layout picker. Every layout is plain markdown plus a scoped
 * stylesheet, so anything created here stays fully editable in code.
 */
export interface SlideLayout {
    id: string
    name: string
    hint: string
    markdown: string
    css: string
}

export const layouts: SlideLayout[] = [
    {
        id: 'blank',
        name: 'Blank',
        hint: 'empty canvas',
        markdown: '## New slide\n\nWrite in **markdown**.\n',
        css: `.slide {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 24px;
    padding: 72px;
}

h2 {
    font-size: 84px;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin: 0;
}

p {
    font-size: 28px;
    color: #5c5342;
    margin: 0;
}
`,
    },
    {
        id: 'title',
        name: 'Title',
        hint: 'big opener',
        markdown: `TAGLINE OR CONTEXT

# Title of the talk

A one-line subtitle that says why anyone should care.

<aside class="notes">Opening line and what to promise the audience.</aside>
`,
        css: `.slide {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 88px;
    background: linear-gradient(160deg, #fffdf8 0%, #f2ead8 100%);
}

p:first-child {
    font-family: "JetBrains Mono", monospace;
    font-size: 14px;
    letter-spacing: 0.32em;
    color: #ff5c1f;
    margin: 0 0 26px;
}

h1 {
    font-size: 92px;
    line-height: 1.02;
    font-weight: 800;
    letter-spacing: -0.03em;
    margin: 0;
}

p:last-of-type {
    font-size: 26px;
    color: #5c5342;
    margin: 28px 0 0;
    max-width: 640px;
}
`,
    },
    {
        id: 'title-body',
        name: 'Title + body',
        hint: 'section with points',
        markdown: `## Heading

Supporting point that explains the idea.

- First argument, stated plainly.
- Second argument, with the evidence inline.
- Third argument, the one they will remember.

<aside class="notes">Keep it to three points.</aside>
`,
        css: `.slide {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 88px;
}

h2 {
    font-size: 60px;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin: 0 0 18px;
}

p {
    font-size: 24px;
    color: #5c5342;
    margin: 0 0 32px;
}

ul {
    font-size: 24px;
    line-height: 1.6;
    margin: 0;
    padding-left: 28px;
}

li {
    margin: 12px 0;
}

li::marker {
    color: #ff5c1f;
}
`,
    },
    {
        id: 'two-col',
        name: 'Two columns',
        hint: 'compare or pair',
        markdown: `## Before &rarr; After

**Before**

Old way of doing it, with all its friction spelled out.

**After**

The new way — same goal, a tenth of the effort.

<aside class="notes">Contrast the two columns explicitly.</aside>
`,
        css: `.slide {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 80px;
}

h2 {
    font-size: 54px;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin: 0 0 40px;
}

p {
    display: inline-block;
    width: calc(50% - 20px);
    vertical-align: top;
    box-sizing: border-box;
    background: rgba(34, 29, 21, 0.04);
    border: 1px solid #e0d5c0;
    border-radius: 16px;
    padding: 32px 30px;
    font-size: 20px;
    line-height: 1.55;
    color: #5c5342;
    margin: 0 20px 0 0;
}

p:nth-of-type(2) {
    margin-right: 0;
    border-color: #ff5c1f;
    background: #fff2ea;
}

strong {
    display: block;
    font-size: 24px;
    color: #221d15;
    margin-bottom: 12px;
}
`,
    },
    {
        id: 'code',
        name: 'Code sample',
        hint: 'syntax spotlight',
        markdown: `## The whole trick

\`\`\`ts
export function mount(el: HTMLElement) {
    render(<Slide markdown={source} />, el)
}
\`\`\`

One sentence on what to notice in the snippet.

<aside class="notes">Walk the audience through the highlighted line.</aside>
`,
        css: `.slide {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 80px;
    background: #221d15;
    color: #f6f2ea;
}

h2 {
    font-size: 44px;
    font-weight: 700;
    letter-spacing: -0.01em;
    margin: 0 0 28px;
    color: #fffdf8;
}

pre {
    background: #17130e;
    border: 1px solid #3d352a;
    border-radius: 14px;
    padding: 30px 34px;
    margin: 0;
    overflow: hidden;
}

code {
    font-family: "JetBrains Mono", monospace;
    font-size: 20px;
    line-height: 1.6;
    color: #f6f2ea;
}

p:last-of-type {
    font-size: 22px;
    color: #8d8370;
    margin: 26px 0 0;
}
`,
    },
    {
        id: 'quote',
        name: 'Pull quote',
        hint: 'big statement',
        markdown: `> Something worth repeating appears here.

**Attribution — Role, Company**

<aside class="notes">Pause after reading the quote.</aside>
`,
        css: `.slide {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 80px;
    background: linear-gradient(160deg, #fffdf8 0%, #f1e9d7 100%);
}

blockquote {
    margin: 0 0 36px;
    border-left: 4px solid #ff5c1f;
    padding: 6px 0 6px 28px;
    font-family: "Instrument Serif", serif;
    font-style: italic;
    font-size: 54px;
    line-height: 1.2;
    color: #221d15;
}

p {
    font-family: "JetBrains Mono", monospace;
    font-size: 18px;
    letter-spacing: 0.08em;
    color: #8d8370;
    margin: 0;
}

strong {
    color: #ff5c1f;
}
`,
    },
    {
        id: 'section-break',
        name: 'Section break',
        hint: 'chapter divider',
        markdown: `## 02

# Part two: shipping it

<aside class="notes">Short breath before the next section.</aside>
`,
        css: `.slide {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 88px;
    background: #221d15;
    color: #f6f2ea;
}

h2 {
    font-family: "JetBrains Mono", monospace;
    font-size: 22px;
    font-weight: 500;
    letter-spacing: 0.3em;
    color: #ff5c1f;
    margin: 0 0 24px;
}

h1 {
    font-size: 88px;
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1.05;
    color: #fffdf8;
    margin: 0;
}
`,
    },
]
