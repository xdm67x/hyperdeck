import { signal } from '@preact/signals'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'hyperdeck-theme'

function initialTheme(): Theme {
    // the pre-paint script in index.html already resolved stored/system
    // preference onto <html data-theme>; read it back
    return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

export const theme = signal<Theme>(initialTheme())

export function setTheme(next: Theme) {
    theme.value = next
    document.documentElement.dataset.theme = next
    document.documentElement.style.colorScheme = next
    try {
        localStorage.setItem(STORAGE_KEY, next)
    } catch {
        /* storage unavailable — theme still applies for this session */
    }
}

export function toggleTheme() {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
}
