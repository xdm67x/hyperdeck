/**
 * Cross-window sync protocol for Presenter Mode.
 *
 * The presenter cockpit and the main stage live in separate windows of the
 * same SPA. Navigation is broadcast over `BroadcastChannel('hyperdeck_sync')`
 * as HYPERDECK_SLIDE_CHANGE events; every window applies events from other
 * senders and ignores its own echoes.
 */

export const SYNC_CHANNEL = 'hyperdeck_sync'

export type SyncMessage =
    | {
          type: 'HYPERDECK_SLIDE_CHANGE'
          deckId: string
          index: number
          senderId: string
          timestamp: number
      }
    | {
          type: 'HYPERDECK_DECK_REQUEST'
          deckId: string
          senderId: string
          timestamp: number
      }

export interface SyncHandle {
    senderId: string
    send: (msg: SyncMessage) => void
    close: () => void
}

export function connectSync(onMessage: (msg: SyncMessage) => void): SyncHandle | null {
    if (typeof BroadcastChannel === 'undefined') return null
    const senderId = `hd_${Math.random().toString(36).slice(2, 10)}`
    const channel = new BroadcastChannel(SYNC_CHANNEL)
    channel.onmessage = (event: MessageEvent) => {
        const msg = event.data as SyncMessage
        if (!msg || typeof msg.type !== 'string') return
        if (msg.type === 'HYPERDECK_SLIDE_CHANGE' && msg.senderId === senderId) {
            return
        }
        onMessage(msg)
    }
    return {
        senderId,
        send: (msg: SyncMessage) => channel.postMessage(msg),
        close: () => channel.close(),
    }
}

export function emitSlideChange(handle: SyncHandle | null, deckId: string, index: number): void {
    handle?.send({
        type: 'HYPERDECK_SLIDE_CHANGE',
        deckId,
        index,
        senderId: handle.senderId,
        timestamp: Date.now(),
    })
}
