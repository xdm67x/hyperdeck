import { useEffect } from 'preact/hooks'
import { signal } from '@preact/signals'

/**
 * Shared right-click context menu. Targets call `openContextMenu` with their
 * items; a single `ContextMenuHost` renders the menu app-wide. Items may
 * carry a `submenu` (rendered as a flyout on hover).
 */

export type MenuAction = {
    label: string
    onSelect?: () => void
    submenu?: MenuItem[]
    danger?: boolean
    disabled?: boolean
}

export type MenuItem = MenuAction | 'separator'

const menuState = signal<{ x: number; y: number; items: MenuItem[] } | null>(null)
const submenuIndex = signal<number | null>(null)

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
    submenuIndex.value = null
    menuState.value = { x: e.clientX, y: e.clientY, items }
}

export function closeContextMenu() {
    menuState.value = null
    submenuIndex.value = null
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
    // flip the flyout to the left when there is no room to the right
    const flip = left + width + width + 12 > window.innerWidth

    const itemClass = (item: MenuAction) =>
        `flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] transition ${
            item.danger ? 'text-signal hover:bg-signal/10' : 'text-bone hover:bg-ink-2'
        } disabled:cursor-default disabled:text-line-2 disabled:hover:bg-transparent`

    // position: [menu-row offsets] clamped so the flyout stays on screen
    const rowTop = (index: number) =>
        menu.items.slice(0, index).reduce((n, it) => n + (it === 'separator' ? 0.5 : 1), 0) * rowH +
        4
    const flyoutRows = (items: MenuItem[]) =>
        items.reduce((n, it) => n + (it === 'separator' ? 0.5 : 1), 0)

    const renderItems = (items: MenuItem[], depth: 0 | 1) =>
        items.map((item, i) =>
            item === 'separator' ? (
                <div key={i} class="my-1 h-px bg-line" />
            ) : item.submenu && item.submenu.length > 0 ? (
                <div key={i} class="relative">
                    <button
                        type="button"
                        role="menuitem"
                        aria-haspopup="menu"
                        disabled={item.disabled}
                        class={itemClass(item)}
                        onMouseEnter={() => {
                            if (depth === 0) submenuIndex.value = i
                        }}
                        onClick={() => (submenuIndex.value = submenuIndex.value === i ? null : i)}
                    >
                        {item.label}
                        <span class="ml-auto text-mute">&#9656;</span>
                    </button>
                    {submenuIndex.value === i && (
                        <div
                            class={`absolute z-[81] min-w-[210px] overflow-y-auto rounded-md border border-line-2 bg-panel py-1 shadow-[0_16px_40px_-12px_rgba(34,29,21,0.35)] ${
                                flip ? 'right-full' : 'left-full'
                            }`}
                            style={{
                                top: Math.min(
                                    rowTop(i),
                                    window.innerHeight -
                                        top -
                                        flyoutRows(item.submenu) * rowH -
                                        12,
                                ),
                                maxHeight: 'calc(100dvh - 16px)',
                            }}
                            role="menu"
                        >
                            {renderItems(item.submenu, 1)}
                        </div>
                    )}
                </div>
            ) : (
                <button
                    key={i}
                    type="button"
                    role="menuitem"
                    disabled={item.disabled}
                    class={itemClass(item)}
                    onMouseEnter={() => {
                        if (depth === 0) submenuIndex.value = null
                    }}
                    onClick={() => {
                        closeContextMenu()
                        if (!item.disabled) item.onSelect?.()
                    }}
                >
                    {item.label}
                </button>
            ),
        )

    return (
        <div
            class="fixed z-[80] min-w-[210px] rounded-md border border-line-2 bg-panel py-1 shadow-[0_16px_40px_-12px_rgba(34,29,21,0.35)]"
            style={{ left, top, width }}
            role="menu"
        >
            {renderItems(menu.items, 0)}
        </div>
    )
}
