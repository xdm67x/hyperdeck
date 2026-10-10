<!-- hyperdeck:deck "What is HyperDeck?" -->

<!-- hyperdeck:global-css

/* Deck-wide stylesheet — applied to every slide. */

.slide {
    font-family: "Archivo", system-ui, sans-serif;
    color: #221d15;
    background: #fffdf8;
}

/* entrance — the stage remounts the canvas on every slide change,
   so entrance keyframes replay each time a slide appears */

@keyframes fade-up {
    from { opacity: 0; transform: translateY(26px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
}

/* ambient loops shared across slides */

@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

@keyframes pulse-soft {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
}

@keyframes caret {
    0%, 45% { opacity: 1; }
    50%, 95% { opacity: 0; }
}

-->

<!-- hyperdeck:slide "Cover" -->

WHAT IS HYPERDECK — A GUIDED TOUR

# HyperDeck

A native **HTML/CSS** presentation studio. Write slides in plain markdown, style them with scoped CSS, present them in the browser — *no exports, no proprietary formats, no server.*

<span class="hint">press &rarr; to advance<span class="caret"></span></span>

<aside class="notes">Meta alert: this deck is built with the very thing it explains. Every animation on screen is a plain CSS keyframe that ships inside the slide's own stylesheet — and the deck itself arrived as a single markdown file, imported from the dashboard.</aside>

<!-- hyperdeck:css

.slide {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 88px;
    background: linear-gradient(155deg, #fffdf8 0%, #f7f1e4 45%, #ffe9d8 100%);
    background-size: 180% 180%;
    animation: pan 16s ease-in-out infinite;
}

p:first-child {
    font-family: "JetBrains Mono", monospace;
    font-size: 15px;
    font-weight: 500;
    letter-spacing: 0.32em;
    color: #ff5c1f;
    margin: 0 0 30px;
    animation: fade-up 0.7s 0.05s cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

h1 {
    font-size: 148px;
    line-height: 0.98;
    font-weight: 800;
    letter-spacing: -0.04em;
    margin: 0;
    animation: fade-up 0.9s 0.2s cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

h1::after {
    content: "";
    display: block;
    width: 168px;
    height: 12px;
    margin-top: 28px;
    border-radius: 6px;
    background: #ff5c1f;
    transform-origin: left center;
    animation: grow 0.7s 0.85s cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

p:nth-of-type(2) {
    font-size: 27px;
    line-height: 1.5;
    color: #5c5342;
    max-width: 780px;
    margin: 34px 0 0;
    animation: fade-up 0.8s 0.45s cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

.hint {
    position: absolute;
    right: 88px;
    bottom: 56px;
    font-family: "JetBrains Mono", monospace;
    font-size: 14px;
    letter-spacing: 0.14em;
    color: #8d8370;
    animation: fade-in 0.8s 1.2s both;
}

.caret {
    display: inline-block;
    width: 9px;
    height: 15px;
    margin-left: 8px;
    vertical-align: -2px;
    background: #ff5c1f;
    animation: caret 1.1s steps(1) infinite;
}

@keyframes pan {
    0%, 100% { background-position: 0% 0%; }
    50% { background-position: 100% 100%; }
}

@keyframes grow {
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
}

-->

<!-- hyperdeck:slide "The idea" -->

## The idea

A HyperDeck deck is **just markdown**. Structure lives in greppable HTML comments, layout and motion live in **plain CSS** — and the browser does the rest, live.

<div class="flow">
<div class="node"><span class="tag">01</span><strong>Markdown</strong><em>content anyone can read</em></div>
<div class="arrow">&rarr;</div>
<div class="node"><span class="tag">02</span><strong>Scoped CSS</strong><em>layout, type, keyframes</em></div>
<div class="arrow">&rarr;</div>
<div class="node hot"><span class="tag">03</span><strong>Live slide</strong><em>what you style is what renders</em></div>
</div>

Every slide renders on a fixed **1280 &times; 720** stage and scales identically everywhere — dashboard thumbnail, editor, stage, cockpit.

<aside class="notes">The three cards are raw HTML inside the markdown; the pulsing arrows and the slow card float all come from this slide's own stylesheet. No build step, no proprietary format: markdown in, presentation out.</aside>

<!-- hyperdeck:css

.slide {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 80px;
    background: radial-gradient(900px 620px at 88% -12%, #ffe7d6 0%, #fffdf8 62%);
}

h2 {
    font-size: 58px;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin: 0 0 14px;
    animation: fade-up 0.7s 0.05s cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

p:nth-of-type(1) {
    font-size: 24px;
    line-height: 1.5;
    color: #5c5342;
    max-width: 920px;
    margin: 0 0 42px;
    animation: fade-up 0.7s 0.2s cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

.flow {
    display: flex;
    align-items: stretch;
    gap: 18px;
    margin: 0 0 42px;
    animation: fade-up 0.8s 0.4s cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

.node {
    flex: 1;
    background: rgba(34, 29, 21, 0.04);
    border: 1px solid #e0d5c0;
    border-radius: 18px;
    padding: 26px 26px 24px;
    animation: float 6s ease-in-out infinite;
}

.node:nth-child(3) { animation-delay: 0.8s; }
.node:nth-child(5) { animation-delay: 1.6s; }

.node.hot {
    border-color: #ff5c1f;
    background: #fff2ea;
    box-shadow: 0 18px 40px -18px rgba(255, 92, 31, 0.45);
}

.tag {
    display: inline-block;
    font-family: "JetBrains Mono", monospace;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.22em;
    color: #ff5c1f;
    margin-bottom: 14px;
}

.node strong {
    display: block;
    font-size: 26px;
    font-weight: 700;
    margin-bottom: 8px;
}

.node em {
    display: block;
    font-style: normal;
    font-size: 17px;
    line-height: 1.45;
    color: #8d8370;
}

.arrow {
    align-self: center;
    font-size: 30px;
    color: #ff5c1f;
    animation: pulse-soft 1.8s ease-in-out infinite;
}

.arrow:nth-of-type(2) { animation-delay: 0.9s; }

p:nth-of-type(2) {
    font-size: 20px;
    color: #8d8370;
    margin: 0;
    animation: fade-up 0.8s 0.65s cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

-->

<!-- hyperdeck:slide "One file, whole deck" -->

## One file, whole deck

```markdown
<!-- hyperdeck:deck "Roadmap" -->      # the deck, and its name
<!-- hyperdeck:global-css -->         # deck-wide stylesheet
.slide { color: #221d15; }

<!-- hyperdeck:slide "Opening" -->     # one slide, in markdown
# Hello, world

<!-- hyperdeck:css -->                # ...and its own stylesheet
h1 { animation: fade-up 0.6s both; }
```

<div class="chips"><span>renders in any markdown viewer</span><span>diffable in git</span><span>greppable by scripts</span><span>handable to an agent</span></div>

<aside class="notes">This is the actual interchange format — the file imported to build this deck looks exactly like the snippet. It stays valid, readable markdown everywhere, yet parses losslessly back into slides, styles and all.</aside>

<!-- hyperdeck:css

.slide {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 80px;
    background: #221d15;
    color: #f6f2ea;
}

h2 {
    font-size: 50px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #fffdf8;
    margin: 0 0 28px;
    animation: fade-up 0.7s 0.05s cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

pre {
    background: #17130e;
    border: 1px solid #3d352a;
    border-radius: 14px;
    padding: 26px 32px;
    margin: 0 0 30px;
    animation: fade-up 0.8s 0.25s cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

code {
    font-family: "JetBrains Mono", monospace;
    font-size: 17px;
    line-height: 1.75;
    color: #f6f2ea;
}

pre code .hljs-comment { color: #6f6553; font-style: italic; }
pre code .hljs-section { color: #ffc46b; }
pre code .hljs-attr,
pre code .hljs-attribute,
pre code .hljs-number { color: #ffc46b; }
pre code .hljs-string,
pre code .hljs-bullet { color: #7fdca3; }
pre code .hljs-keyword,
pre code .hljs-name,
pre code .hljs-tag { color: #ff8a50; }

.chips {
    display: flex;
    gap: 12px;
    animation: fade-up 0.8s 0.55s cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

.chips span {
    font-family: "JetBrains Mono", monospace;
    font-size: 14px;
    letter-spacing: 0.06em;
    color: #c9c0af;
    border: 1px solid #3d352a;
    border-radius: 999px;
    padding: 9px 18px;
}

.chips span:last-child {
    color: #ff8a50;
    border-color: #ff5c1f;
}

-->

<!-- hyperdeck:slide "Motion is a first-class citizen" -->

## Motion is a *first-class citizen*

Each slide carries its own **scoped stylesheet** — `@keyframes` included — so animation travels with the content, and no rule can ever leak into a sibling slide.

<div class="demo">
<span class="d-float">float</span>
<span class="d-breathe">breathe</span>
<span class="d-pulse">pulse</span>
<span class="d-rise">rise</span>
</div>

<div class="snip">@keyframes float { 50% { transform: translateY(-10px); } }</div>

<aside class="notes">The four chips are demonstrating themselves — each is named after the keyframe that animates it, straight from this slide's CSS. Breathe is a variable-font weight swing from 200 to 900 on Archivo: pure CSS, zero JavaScript.</aside>

<!-- hyperdeck:css

.slide {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 80px;
    background: linear-gradient(160deg, #fffdf8 0%, #f1e9d7 100%);
}

h2 {
    font-size: 56px;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin: 0 0 16px;
    animation: fade-up 0.7s 0.05s cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

h2 em {
    font-family: "Instrument Serif", serif;
    font-style: italic;
    font-weight: 400;
    color: #b07000;
}

p {
    font-size: 22px;
    line-height: 1.55;
    color: #5c5342;
    max-width: 960px;
    margin: 0 0 46px;
    animation: fade-up 0.7s 0.2s cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

.demo {
    display: flex;
    gap: 22px;
    margin: 0 0 34px;
    animation: fade-up 0.8s 0.45s cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

.demo span {
    font-family: "JetBrains Mono", monospace;
    font-size: 24px;
    color: #221d15;
    background: #fffdf8;
    border: 1px solid #e0d5c0;
    border-radius: 14px;
    padding: 22px 32px;
    box-shadow: 0 12px 26px -16px rgba(34, 29, 21, 0.4);
}

.d-float { animation: float 4s ease-in-out infinite; }

.d-breathe {
    font-family: "Archivo", sans-serif;
    animation: breathe 5s ease-in-out infinite;
}

.d-pulse { animation: pulse-soft 1.6s ease-in-out infinite; }

.d-rise { animation: rise-once 2.2s cubic-bezier(0.2, 0.9, 0.25, 1) infinite; }

.snip {
    font-family: "JetBrains Mono", monospace;
    font-size: 15px;
    letter-spacing: 0.02em;
    color: #8d8370;
    animation: fade-in 0.8s 0.9s both;
}

@keyframes breathe {
    0%, 100% { font-weight: 200; letter-spacing: 0.04em; }
    50% { font-weight: 900; letter-spacing: -0.01em; }
}

@keyframes rise-once {
    0% { opacity: 0; transform: translateY(22px); }
    30%, 82% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-8px); }
}

-->

<!-- hyperdeck:slide "Three views, one deck" -->

## Three views, one deck

Edit in a **Monaco** editor, render on a letterboxed stage, drive it from a **presenter cockpit** with notes and a timer.

<div class="views">
<div class="win"><div class="bar"><i></i><i></i><i></i><b>editor</b></div><div class="body ed"><span class="l w64"></span><span class="l w90"></span><span class="l w42"></span><span class="l w76"></span><span class="l w30"></span></div></div>
<div class="win"><div class="bar"><i></i><i></i><i></i><b>stage</b></div><div class="body stg"><div class="screen"><div class="mini-title"></div><div class="mini-bar"></div></div></div></div>
<div class="win"><div class="bar"><i></i><i></i><i></i><b>cockpit</b></div><div class="body cp"><span class="clock">04:12</span><span class="note n1"></span><span class="note n2"></span></div></div>
</div>

<div class="sync"><span class="rail"></span><span class="dot a"></span><span class="dot b"></span><em>hyperdeck_sync &mdash; BroadcastChannel, no server</em></div>

<aside class="notes">Presenting opens two windows: the audience-facing stage and a speaker cockpit. They stay in lockstep over a BroadcastChannel — the two dots below are the two directions of that channel, and no server is involved.</aside>

<!-- hyperdeck:css

.slide {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 80px;
    background: radial-gradient(900px 620px at 10% 115%, #ffe7d6 0%, #fffdf8 60%);
}

h2 {
    font-size: 54px;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin: 0 0 12px;
    animation: fade-up 0.7s 0.05s cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

p {
    font-size: 22px;
    color: #5c5342;
    margin: 0 0 38px;
    animation: fade-up 0.7s 0.2s cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

.views {
    display: flex;
    gap: 24px;
    margin: 0 0 34px;
    animation: fade-up 0.8s 0.35s cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

.win {
    flex: 1;
    border: 1px solid #e0d5c0;
    border-radius: 14px;
    overflow: hidden;
    background: #fffdf8;
    box-shadow: 0 16px 34px -22px rgba(34, 29, 21, 0.4);
    animation: float 7s ease-in-out infinite;
}

.win:nth-child(2) { animation-delay: 0.9s; }
.win:nth-child(3) { animation-delay: 1.8s; }

.bar {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 14px;
    border-bottom: 1px solid #e6e2d8;
    background: #f0eee8;
}

.bar i {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: #d3cec0;
}

.bar i:first-child { background: #ff5c1f; }

.bar b {
    margin-left: auto;
    font-family: "JetBrains Mono", monospace;
    font-weight: 500;
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #8d8370;
}

.body {
    height: 168px;
    padding: 16px;
    box-sizing: border-box;
}

.ed {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 13px;
}

.ed .l {
    height: 10px;
    border-radius: 5px;
    background: #d3cec0;
    animation: pulse-soft 2.4s ease-in-out infinite;
}

.ed .l:nth-child(2) { animation-delay: 0.3s; }
.ed .l:nth-child(3) { animation-delay: 0.6s; }
.ed .l:nth-child(4) { animation-delay: 0.9s; }
.ed .l:nth-child(5) { animation-delay: 1.2s; }

.w64 { width: 64%; }
.w90 { width: 90%; }
.w42 { width: 42%; }
.w76 { width: 76%; }
.w30 { width: 30%; }

.ed .l:first-child { background: #ffb689; }

.stg { display: flex; }

.screen {
    width: 100%;
    border-radius: 8px;
    background: #221d15;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 12px;
    padding: 22px;
    box-sizing: border-box;
    animation: glow 4s ease-in-out infinite;
}

.mini-title {
    width: 55%;
    height: 13px;
    border-radius: 4px;
    background: #fffdf8;
}

.mini-bar {
    width: 34%;
    height: 13px;
    border-radius: 4px;
    background: #ff6a2b;
}

.cp {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 13px;
}

.clock {
    font-family: "JetBrains Mono", monospace;
    font-size: 34px;
    font-weight: 700;
    color: #221d15;
    animation: pulse-soft 2s ease-in-out infinite;
}

.note {
    height: 8px;
    border-radius: 4px;
    background: #d3cec0;
}

.n1 { width: 88%; }
.n2 { width: 62%; }

.sync {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 30px;
    animation: fade-up 0.8s 0.7s cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

.sync em {
    font-family: "JetBrains Mono", monospace;
    font-style: normal;
    font-size: 14px;
    letter-spacing: 0.1em;
    color: #8d8370;
    background: #fffdf8;
    padding: 0 18px;
}

.rail {
    position: absolute;
    left: 18%;
    right: 18%;
    top: 38px;
    height: 2px;
    background: #e0d5c0;
}

.dot {
    position: absolute;
    top: 34px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
}

.dot.a {
    background: #ff5c1f;
    animation: travel-a 2.6s ease-in-out infinite;
}

.dot.b {
    background: #b07000;
    animation: travel-b 2.6s ease-in-out infinite;
}

@keyframes glow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(255, 92, 31, 0); }
    50% { box-shadow: 0 0 36px 3px rgba(255, 92, 31, 0.35); }
}

@keyframes travel-a {
    0% { left: 18%; opacity: 0; }
    15% { opacity: 1; }
    50% { left: 82%; opacity: 1; }
    65%, 100% { left: 82%; opacity: 0; }
}

@keyframes travel-b {
    0% { left: 82%; opacity: 0; }
    15% { opacity: 1; }
    50% { left: 18%; opacity: 1; }
    65%, 100% { left: 18%; opacity: 0; }
}

-->

<!-- hyperdeck:slide "Local-first, by design" -->

## Local-first, by design

Decks live in your browser — **IndexedDB via Dexie**. No server, no account, no lock-in. Export to the single-file markdown format (or JSON) whenever you like; import it on any machine.

<div class="store">
<span class="row">db.decks &rarr; title, globalCss</span>
<span class="row">db.slides &rarr; markdown, css, order</span>
<span class="row">location &rarr; IndexedDB, your browser</span>
<span class="row ok">backend &rarr; null</span>
</div>

<aside class="notes">The whole storage layer is two tables in the browser's IndexedDB. "backend: null" is the punchline — everything you see ran from the same origin, including this presentation.</aside>

<!-- hyperdeck:css

.slide {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 80px;
    background: #fffdf8;
}

h2 {
    font-size: 54px;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin: 0 0 14px;
    animation: fade-up 0.7s 0.05s cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

p {
    font-size: 23px;
    line-height: 1.5;
    color: #5c5342;
    max-width: 920px;
    margin: 0 0 42px;
    animation: fade-up 0.7s 0.2s cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

.store {
    background: #221d15;
    border-radius: 16px;
    padding: 32px 38px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    box-shadow: 0 24px 50px -28px rgba(34, 29, 21, 0.6);
    animation: fade-up 0.8s 0.45s cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

.row {
    font-family: "JetBrains Mono", monospace;
    font-size: 19px;
    color: #c9c0af;
    animation: fade-in 0.5s both;
}

.row:nth-child(2) { animation-delay: 0.75s; }
.row:nth-child(3) { animation-delay: 1s; }

.row.ok {
    color: #7fdca3;
    font-weight: 700;
    animation: fade-in 0.6s 1.3s both;
}

.row.ok::before {
    content: "";
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #157a48;
    margin-right: 14px;
    animation: pulse-soft 1.6s ease-in-out infinite;
}

-->

<!-- hyperdeck:slide "Agents welcome" -->

## Agents welcome

HyperDeck ships a first-class scripting surface: `window.hyperdeck`. Everything the UI can do, an agent can do — no DOM scraping required.

```js
const deck = await hyperdeck.importMarkdown(md)  // this deck arrived this way
await hyperdeck.updateSlide(id, { css: "..." })  // patch a slide, live
hyperdeck.open(deck.id)                         // editor view
hyperdeck.present(deck.id)                      // stage + cockpit, in sync
```

<div class="chips"><span>versioned API on window.hyperdeck</span><span>JSON + markdown interchange</span></div>

<aside class="notes">The agent API is versioned and documented in the source. importMarkdown is how this very deck was handed over — one file, one call, running app. Decks are data, so agents treat them like data.</aside>

<!-- hyperdeck:css

.slide {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 80px;
    background: #221d15;
    color: #f6f2ea;
}

h2 {
    font-size: 50px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #fffdf8;
    margin: 0 0 14px;
    animation: fade-up 0.7s 0.05s cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

p {
    font-size: 22px;
    color: #c9c0af;
    max-width: 880px;
    margin: 0 0 34px;
    animation: fade-up 0.7s 0.2s cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

pre {
    background: #17130e;
    border: 1px solid #3d352a;
    border-radius: 14px;
    padding: 28px 32px;
    margin: 0 0 30px;
    animation: fade-up 0.8s 0.4s cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

code {
    font-family: "JetBrains Mono", monospace;
    font-size: 18px;
    line-height: 1.8;
    color: #f6f2ea;
}

pre code .hljs-comment { color: #6f6553; font-style: italic; }
pre code .hljs-keyword { color: #ff8a50; }
pre code .hljs-title,
pre code .hljs-variable,
pre code .hljs-attr { color: #ffc46b; }
pre code .hljs-string { color: #7fdca3; }
pre code .hljs-params { color: #c9c0af; }

.chips {
    display: flex;
    gap: 12px;
    animation: fade-up 0.8s 0.65s cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

.chips span {
    font-family: "JetBrains Mono", monospace;
    font-size: 14px;
    letter-spacing: 0.06em;
    color: #c9c0af;
    border: 1px solid #3d352a;
    border-radius: 999px;
    padding: 9px 18px;
}

.chips span:last-child {
    color: #ff8a50;
    border-color: #ff5c1f;
}

-->

<!-- hyperdeck:slide "Closing" -->

> Decks are written, not exported.

## Go make something *bold*.

<span class="cta">dashboard &rarr; right-click &rarr; import deck<span class="caret"></span></span>

<aside class="notes">Close on the philosophy: a deck is a document, not a binary. Invite questions — and point out that every animation they just saw is one CSS block away in the editor.</aside>

<!-- hyperdeck:css

.slide {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 88px;
    background: linear-gradient(160deg, #fffdf8 0%, #f1e9d7 100%);
}

blockquote {
    margin: 0 0 44px;
    border-left: 4px solid #ff5c1f;
    padding: 6px 0 6px 30px;
    font-family: "Instrument Serif", serif;
    font-style: italic;
    font-size: 56px;
    line-height: 1.15;
    color: #221d15;
    animation: fade-up 0.8s 0.1s cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

h2 {
    font-size: 66px;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin: 0;
    animation: fade-up 0.8s 0.35s cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

h2 em {
    font-family: "Instrument Serif", serif;
    font-style: italic;
    font-weight: 400;
    color: #b07000;
}

.cta {
    position: absolute;
    right: 88px;
    bottom: 56px;
    font-family: "JetBrains Mono", monospace;
    font-size: 15px;
    letter-spacing: 0.1em;
    color: #8d8370;
    animation: fade-in 0.8s 1.1s both;
}

.caret {
    display: inline-block;
    width: 9px;
    height: 15px;
    margin-left: 8px;
    vertical-align: -2px;
    background: #ff5c1f;
    animation: caret 1.1s steps(1) infinite;
}

-->
