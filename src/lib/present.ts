/**
 * Presenter Mode launches two synchronized windows from the same SPA:
 * the main stage (audience-facing) and the presenter cockpit (speaker-facing).
 * Both join BroadcastChannel('hyperdeck_sync') on mount.
 */
export function openPresentation(deckId: string) {
    const base = `${location.pathname}${location.search}`
    window.open(
        `${base}#/stage/${deckId}`,
        `hyperdeck_stage_${deckId}`,
        'popup=yes,width=1180,height=700',
    )
    window.open(
        `${base}#/presenter/${deckId}`,
        `hyperdeck_presenter_${deckId}`,
        'popup=yes,width=1160,height=780',
    )
}

export function formatElapsed(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
