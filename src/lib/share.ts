/**
 * Serverless deck sharing over the URL.
 *
 * A deck serializes to its single-file markdown interchange format, is
 * deflate-compressed with the native CompressionStream API and base64url
 * encoded into the location hash. The hash never leaves the browser, so this
 * works on any static host (GitHub Pages) with no backend at all. Opening a
 * share link imports the deck into the viewer's IndexedDB as a local copy.
 *
 * Hash format: `#share=<version><payload>` where version is
 * `z` (deflate-compressed, base64url) or `r` (raw, encodeURIComponent).
 * An optional `&stage` suffix opens the deck directly in Stage mode.
 */

const SHARE_PREFIX = '#share='

/** How a share link opens after import: editor or straight to Stage. */
export type ShareMode = 'edit' | 'stage'

const MODE_SUFFIX: Record<ShareMode, string> = { edit: '', stage: '&stage' }

export interface ShareHash {
    payload: string
    mode: ShareMode
}

type ShareVersion = 'z' | 'r'

function bytesToBase64Url(bytes: Uint8Array): string {
    let binary = ''
    const CHUNK = 0x8000
    for (let i = 0; i < bytes.length; i += CHUNK) {
        binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlToBytes(value: string): Uint8Array {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
    const binary = atob(padded)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return bytes
}

async function deflate(text: string): Promise<Uint8Array> {
    const stream = new Blob([text]).stream().pipeThrough(new CompressionStream('deflate'))
    const buffer = await new Response(stream).arrayBuffer()
    return new Uint8Array(buffer)
}

async function inflate(bytes: Uint8Array): Promise<string> {
    const stream = new Blob([bytes as BlobPart])
        .stream()
        .pipeThrough(new DecompressionStream('deflate'))
    return await new Response(stream).text()
}

/** Extract the shared payload and open mode from a location hash, if any. */
export function parseShareHash(hash: string): ShareHash | null {
    if (!hash.startsWith(SHARE_PREFIX)) return null
    let rest = hash.slice(SHARE_PREFIX.length)
    let mode: ShareMode = 'edit'
    if (rest.endsWith('&stage')) {
        mode = 'stage'
        rest = rest.slice(0, -'&stage'.length)
    }
    return rest ? { payload: rest, mode } : null
}

/** Encode deck markdown into the `#share=` payload string. */
export async function encodeSharePayload(md: string): Promise<string> {
    if (typeof CompressionStream !== 'undefined') {
        return `${'z' satisfies ShareVersion}${bytesToBase64Url(await deflate(md))}`
    }
    // pre-CompressionStream browsers: uncompressed fallback
    return `${'r' satisfies ShareVersion}${encodeURIComponent(md)}`
}

/** Decode a `#share=` payload string back into deck markdown. */
export async function decodeSharePayload(payload: string): Promise<string> {
    const version = payload[0] as ShareVersion
    const data = payload.slice(1)
    if (version === 'z') return await inflate(base64UrlToBytes(data))
    if (version === 'r') return decodeURIComponent(data)
    throw new Error('Unknown share link version')
}

/** Build a full shareable URL for a deck's markdown. */
export async function buildShareUrl(md: string, mode: ShareMode = 'edit'): Promise<string> {
    const payload = await encodeSharePayload(md)
    return `${location.origin}${location.pathname}${SHARE_PREFIX}${payload}${MODE_SUFFIX[mode]}`
}
