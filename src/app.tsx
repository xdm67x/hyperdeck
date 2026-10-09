import { useEffect } from 'preact/hooks'
import { route, parseHash } from './state.ts'
import { Dashboard } from './components/Dashboard.tsx'
import { Editor } from './components/Editor.tsx'
import { Stage } from './components/Stage.tsx'
import { Presenter } from './components/Presenter.tsx'
import { ContextMenuHost } from './components/ContextMenu.tsx'
import { ThemeToggle } from './components/ThemeToggle.tsx'

export function App() {
    useEffect(() => {
        route.value = parseHash(location.hash)
    }, [])

    const r = route.value

    return (
        <>
            {r.view === 'editor' ? (
                <Editor key={r.deckId} deckId={r.deckId} />
            ) : r.view === 'stage' ? (
                <Stage key={r.deckId} deckId={r.deckId} />
            ) : r.view === 'presenter' ? (
                <Presenter key={r.deckId} deckId={r.deckId} />
            ) : (
                <Dashboard />
            )}
            {r.view !== 'stage' && <ThemeToggle />}
            <ContextMenuHost />
        </>
    )
}
