import { signal, computed } from '@preact/signals'
import { parseShareHash } from './lib/share.ts'

export type Route =
    | { view: 'dashboard' }
    | { view: 'editor'; deckId: string }
    | { view: 'stage'; deckId: string }
    | { view: 'presenter'; deckId: string }
    | { view: 'shared'; payload: string }

export const route = signal<Route>({ view: 'dashboard' })

/** Global save indicator driven by the editor. */
export const saveState = signal<'idle' | 'saving' | 'saved'>('idle')

export function parseHash(hash: string): Route {
    const shared = parseShareHash(hash)
    if (shared !== null) return { view: 'shared', payload: shared }
    const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
    const [view, deckId] = parts
    if (view === 'editor' && deckId) return { view: 'editor', deckId }
    if (view === 'stage' && deckId) return { view: 'stage', deckId }
    if (view === 'presenter' && deckId) return { view: 'presenter', deckId }
    return { view: 'dashboard' }
}

/** Navigable views — `shared` is only ever reached from an external link. */
type NavigateRoute = Exclude<Route, { view: 'shared' }>

export function navigate(to: NavigateRoute) {
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
