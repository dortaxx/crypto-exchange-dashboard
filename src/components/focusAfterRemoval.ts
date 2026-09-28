export function refocus(target: HTMLElement | null): void {
  requestAnimationFrame(() => {
    if (focusIsLost()) target?.focus()
  })
}

export function focusAfterRemoval(
  list: HTMLElement | null,
  selector: string,
  index: number,
  fallback: HTMLElement | null = null,
): void {
  requestAnimationFrame(() => {
    if (!focusIsLost()) return
    const targets = list?.isConnected ? [...list.querySelectorAll<HTMLElement>(selector)] : []
    const target = targets[Math.min(index, targets.length - 1)] ?? fallback
    target?.focus()
  })
}

function focusIsLost(): boolean {
  return document.activeElement === null || document.activeElement === document.body
}
