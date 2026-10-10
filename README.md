# HyperDeck

A native HTML/CSS presentation studio. Build decks slide by slide in markdown, style them
with plain CSS, and present them in the browser — no exports, no proprietary formats.

## Features

- **Markdown slides** — write slide content in markdown; structure is carried by
  greppable `<!-- hyperdeck:... -->` comment markers, so every deck stays valid,
  readable markdown on disk.
- **Per-slide and deck-wide CSS** — style individual slides or the whole deck with
  plain CSS. What you style is exactly what renders.
- **Editor, Stage, and Presenter views** — edit decks in a Monaco-powered editor,
  render them on a stage, or run them in a dedicated presenter view.
- **Local-first storage** — decks are stored in the browser via IndexedDB (Dexie);
  no server or account required.
- **Backendless share links** — any deck compresses into a URL fragment
  (`#share=…`), so a deck travels inside the link itself. Opening a share link
  imports the deck as a local copy; no server or account involved.
- **Light/dark theme** — respects your system preference, with a manual toggle
  and no flash of the wrong scheme on load.
- **Single-file interchange** — a deck serializes to one plain-markdown file
  (`<!-- hyperdeck:deck "..." -->`, `<!-- hyperdeck:slide "..." -->`, `<!-- hyperdeck:css -->`),
  easy to diff, script, or hand to an agent.

## Tech stack

| Layer     | Tool                                          |
| --------- | --------------------------------------------- |
| Runtime   | [Deno](https://deno.land)                     |
| Bundler   | Vite 6                                        |
| UI        | Preact + `@preact/signals`                    |
| Styling   | Tailwind CSS 4                                |
| Editor    | Monaco Editor                                 |
| Markdown  | marked + highlight.js                         |
| Storage   | Dexie (IndexedDB)                             |
| Lint/Fmt  | oxlint / oxfmt                                |

## Getting started

Requires [mise](https://mise.jdx.dev) — this repo ships a `mise.toml` that pins
Deno and defines all tasks. (With [Deno](https://deno.com) installed directly,
the equivalent `deno task <name>` commands also work.)

```sh
mise run dev     # start the dev server
```

Open the printed URL. Decks are stored in your browser's IndexedDB.

## Other tasks

```sh
mise run build       # production build to dist/
mise run preview     # preview the production build
mise run lint        # lint with oxlint
mise run fmt         # format with oxfmt (writes)
mise run fmt:check   # check formatting without writing
```

## Project layout

```
├── index.html              # entry document, theme bootstrap
├── vite.config.ts          # Vite + Preact + Tailwind config
├── deno.json               # tasks, dependency imports, compiler options
└── src
    ├── main.tsx            # mount point
    ├── app.tsx             # hash-based routing (dashboard / editor / stage / presenter)
    ├── state.ts             # signals-based app state
    ├── components          # Dashboard, Editor, Stage, Presenter, CodeEditor, ...
    ├── lib                # deck markdown format, layouts, themes, sync, templates
    ├── db                 # Dexie schema and repository
    └── styles             # global CSS
```

## Deck markdown format

A deck round-trips through a single markdown file:

```markdown
<!-- hyperdeck:deck "Deck title" -->

<!-- hyperdeck:global-css -->
...deck-wide stylesheet...

<!-- hyperdeck:slide "Slide name" -->
...slide markdown...

<!-- hyperdeck:css -->
...slide stylesheet...
```

The markers are HTML comments, so the file renders as a normal document in any
markdown viewer while remaining trivially parseable by scripts.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow, commit
message conventions, and pull request guidelines.
