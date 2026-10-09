import { theme, toggleTheme } from '../lib/theme.ts'

/**
 * Floating bottom-right cluster: logotype, "Made with <3", theme switch —
 * the only persistent chrome outside the views, hidden on the stage where
 * nothing may distract from the slides.
 */
export function ThemeToggle() {
    const dark = theme.value === 'dark'
    return (
        <div class="fixed bottom-4 right-4 z-40 flex items-center gap-3">
            <span class="select-none font-serif text-lg leading-none" title="HyperDeck">
                Hyper<span class="italic text-signal">Deck</span>
            </span>
            <span class="chip flex select-none items-center gap-1 text-bone-dim">
                Made with
                <svg viewBox="0 0 24 24" class="h-2.5 w-2.5 fill-signal" aria-hidden="true">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
            </span>
            <button
                type="button"
                class="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-panel/80 text-bone-dim shadow-[0_6px_18px_-8px_rgba(34,29,21,0.35)] backdrop-blur transition hover:border-line-2 hover:text-bone"
                onClick={toggleTheme}
                title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-label="Toggle dark mode"
            >
                {dark ? (
                    <svg
                        viewBox="0 0 24 24"
                        class="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                    >
                        <circle cx="12" cy="12" r="4" />
                        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                    </svg>
                ) : (
                    <svg
                        viewBox="0 0 24 24"
                        class="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />
                    </svg>
                )}
            </button>
        </div>
    )
}
