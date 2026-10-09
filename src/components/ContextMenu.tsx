import { useEffect } from 'preact/hooks'
import { signal } from '@preact/signals'

/**
 * Shared right-click context menu. Targets call `openContextMenu` with their
 * items; a single `ContextMenuHost` renders the menu app-wide.
 */

export type MenuItem =
    | {
          label: string
          onSelect: () => void
          danger?: boolean
          disabled?: boolean
      }
    | 'separator'

const menuState = signal<{ x: number; y: number; items: MenuItem[] } | null>(null)

export function openContextMenu(
    e: {
        preventDefault: () => void
        stopPropagation: () => void
        clientX: number
        clientY: number
    },
    items: MenuItem[],
) {
    e.preventDefault()
    e.stopPropagation()
    if (items.length === 0) return
    menuState.value = { x: e.clientX, y: e.clientY, items }
}

export function closeContextMenu() {
    menuState.value = null
}

export function ContextMenuHost() {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeContextMenu()
        }
        const onDismiss = () => closeContextMenu()
        window.addEventListener('click', onDismiss)
        window.addEventListener('blur', onDismiss)
        window.addEventListener('resize', onDismiss)
        window.addEventListener('keydown', onKey)
        return () => {
            window.removeEventListener('click', onDismiss)
            window.removeEventListener('blur', onDismiss)
            window.removeEventListener('resize', onDismiss)
            window.removeEventListener('keydown', onKey)
        }
    }, [])

    const menu = menuState.value
    if (!menu) return null

    const width = 210
    const rowH = 34
    const rows = menu.items.reduce((n, item) => n + (item === 'separator' ? 0.5 : 1), 0)
    const left = Math.max(8, Math.min(menu.x, window.innerWidth - width - 8))
    const top = Math.max(8, Math.min(menu.y, window.innerHeight - rows * rowH - 16))

    return (
        <div
            class="fixed z-[80] min-w-[210px] overflow-hidden rounded-md border border-line-2 bg-panel py-1 shadow-[0_16px_40px_-12px_rgba(34,29,21,0.35)]"
            style={{ left, top, width }}
            role="menu"
        >
            {menu.items.map((item, i) =>
                item === 'separator' ? (
                    <div key={i} class="my-1 h-px bg-line" />
                ) : (
                    <button
                        key={i}
                        type="button"
                        role="menuitem"
                        disabled={item.disabled}
                        class={`flex w-full items-center px-3 py-1.5 text-left text-[13px] transition ${
                            item.danger
                                ? 'text-signal hover:bg-signal/10'
                                : 'text-bone hover:bg-ink-2'
                        } disabled:cursor-default disabled:text-line-2 disabled:hover:bg-transparent`}
                        onClick={() => {
                            closeContextMenu()
                            if (!item.disabled) item.onSelect()
                        }}
                    >
                        {item.label}
                    </button>
                ),
            )}
        </div>
    )
}
