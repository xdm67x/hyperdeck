import { useEffect } from 'preact/hooks'
import { route, parseHash } from './state.ts'
import { Dashboard } from './components/Dashboard.tsx'
import { Editor } from './components/Editor.tsx'
import { Stage } from './components/Stage.tsx'
import { Presenter } from './components/Presenter.tsx'

export function App() {
    useEffect(() => {
        route.value = parseHash(location.hash)
    }, [])

    const r = route.value

    switch (r.view) {
        case 'editor':
            return <Editor key={r.deckId} deckId={r.deckId} />
        case 'stage':
            return <Stage key={r.deckId} deckId={r.deckId} />
        case 'presenter':
            return <Presenter key={r.deckId} deckId={r.deckId} />
        default:
            return <Dashboard />
    }
}
