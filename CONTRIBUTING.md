# Contributing to HyperDeck

Thanks for contributing. This document covers the development workflow, the
commit message convention, and how to open a pull request.

## Prerequisites

- [mise](https://mise.jdx.dev) — the repo's toolchain runs entirely through
  `mise run <task>`, and `mise.toml` pins the Bun version. (With
  [Bun](https://bun.com) installed directly, the equivalent
  `bun run <name>` commands also work.)
- Dependencies are declared in `package.json` and pinned by `bun.lock`.

## Development workflow

```sh
bun install         # install dependencies
mise run dev        # start the dev server with HMR
mise run lint       # oxlint
mise run fmt        # oxfmt (writes)
mise run fmt:check  # oxfmt (check only)
mise run build      # production build
mise run preview    # preview the production build
```

Before opening a PR, make sure all of these pass:

```sh
mise run lint
mise run fmt:check
mise run build
```

## Code organization

- `src/components/` — Preact components (Dashboard, Editor, Stage, Presenter).
- `src/lib/` — deck markdown format, layouts, markdown rendering, themes, sync.
- `src/db/` — Dexie (IndexedDB) schema and repository.
- `src/state.ts` — signals-based state; routing is hash-based.

Style notes:

- Format with oxfmt (`mise run fmt`) — do not hand-align code.
- Keep files focused; prefer adding to an existing module when the
  functionality belongs there.

## Conventional Commits

This project uses the [Conventional Commits](https://www.conventionalcommits.org/)
specification. Every commit message must match:

```
<type>[optional scope]: <short imperative summary>

[optional body]

[optional footer(s)]
```

### Types

| Type       | Purpose                                                 |
| ---------- | ------------------------------------------------------- |
| `feat`     | New feature (correlates with a minor version bump)      |
| `fix`      | Bug fix (correlates with a patch bump)                  |
| `docs`     | Documentation only                                      |
| `style`    | Formatting, whitespace, naming — no logic change        |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf`     | Performance improvement                                 |
| `test`     | Adding or correcting tests                              |
| `build`    | Build system or external dependency changes             |
| `ci`       | CI configuration changes                                |
| `chore`    | Maintenance that doesn't touch src or tests             |
| `revert`   | Reverting a previous commit                             |

### Rules

- Subject line: lowercase, imperative mood, no trailing period, max ~72 characters.
    - Good: `feat: add slide reordering in editor`
    - Bad: `Added slide reordering`
- Use a scope when it clarifies the area touched: `fix(editor): keep caret inside CSS block`.
- Breaking changes: add `!` after the type/scope (`feat!:`) or describe the change
  in a `BREAKING CHANGE:` footer.
- Commits with a `feat`/`fix` type should describe the user-facing change, not
  the implementation detail.

### Examples

```
feat(presenter): show next-slide preview
fix(stage): clamp slide scale on short viewports
docs: add README and CONTRIBUTING
refactor(db): extract deck queries into repository
```

## Opening a pull request

1. **Fork and branch.** Create a branch from the default branch, named after
   the change:

    ```
    git switch -c feat/slide-thumbnails
    git switch -c fix/104-presenter-timer-drift
    ```

2. **Keep it small.** One logical change per PR. If you find yourself writing
   "and also", consider splitting it.

3. **Commit with conventional messages** (see above). Squash noisy WIP commits
   before requesting review so the history reads cleanly.

4. **Verify locally:**

    ```sh
    mise run lint
    mise run fmt:check
    mise run build
    ```

5. **Push and open the PR:**

    ```sh
    git push -u origin <branch-name>
    ```

    Then open the PR against the default branch with:
    - a title in conventional-commit form (`feat: ...`, `fix(scope): ...`);
    - a description covering **what** changed, **why**, and **how to test it**;
    - linked issues (`Closes #123`) where applicable;
    - screenshots or short clips for anything visual — HyperDeck is a UI-heavy
      project, so before/after images speed up review a lot.

6. **Review.** Respond to feedback with new commits, not force-pushes that
   hide the history, unless the reviewer asks for a rebase. Once approved and
   CI is green, a maintainer will merge (squash by default, using the PR title
   as the commit message).

## Reporting bugs

Open an issue with: the browser and OS you're on, what you did, what you
expected, and what happened instead. If it involves deck content, include the
deck markdown if possible — decks are plain markdown and paste cleanly into
a code block.
