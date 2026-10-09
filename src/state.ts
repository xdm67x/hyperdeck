import { signal, computed } from '@preact/signals'

export type Route =
    | { view: 'dashboard' }
    | { view: 'editor'; deckId: string }
    | { view: 'stage'; deckId: string }
    | { view: 'presenter'; deckId: string }

export const route = signal<Route>({ view: 'dashboard' })

/** Global save indicator driven by the editor. */
export const saveState = signal<'idle' | 'saving' | 'saved'>('idle')

export function parseHash(hash: string): Route {
    const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
    const [view, deckId] = parts
    if (view === 'editor' && deckId) return { view: 'editor', deckId }
    if (view === 'stage' && deckId) return { view: 'stage', deckId }
    if (view === 'presenter' && deckId) return { view: 'presenter', deckId }
    return { view: 'dashboard' }
}

export function navigate(to: Route) {
    const parts = [to.view, to.view === 'dashboard' ? null : to.deckId].filter(Boolean) as string[]
    const hash = `#/${parts.join('/')}`
    if (location.hash === hash) {
        route.value = to
    } else {
        location.hash = hash
    }
}

window.addEventListener('hashchange', () => {
    route.value = parseHash(location.hash)
})

export const routeTitle = computed(() => route.value.view.toUpperCase())
