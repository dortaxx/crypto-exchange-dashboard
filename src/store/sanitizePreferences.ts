import type { PriceTarget, SortDirection, SortKey, ThemeChoice, ViewMode } from '../domain/types'

export type SavedPreferences = {
  pairs: string[]
  favorites: string[]
  hidden: string[]
  view: ViewMode
  sortKey: SortKey
  sortDirection: SortDirection
  targets: PriceTarget[]
  theme: ThemeChoice
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function knownSymbols(value: unknown, known: ReadonlySet<string>): string[] {
  if (!Array.isArray(value)) return []
  const items: unknown[] = value
  return [
    ...new Set(items.filter((item): item is string => typeof item === 'string' && known.has(item))),
  ]
}

function savedTargets(value: unknown, tracked: ReadonlySet<string>): PriceTarget[] {
  if (!Array.isArray(value)) return []
  const items: unknown[] = value
  return items.flatMap((item): PriceTarget[] => {
    if (!isRecord(item)) return []
    const { id, symbol, price, direction, createdAt } = item
    if (typeof id !== 'string' || typeof symbol !== 'string' || !tracked.has(symbol)) return []
    if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) return []
    if ((direction !== 'up' && direction !== 'down') || typeof createdAt !== 'number') return []
    return [{ id, symbol, price, direction, createdAt }]
  })
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.find((option) => option === value) ?? fallback
}

export function sanitizePreferences(
  saved: unknown,
  defaults: SavedPreferences,
  known: ReadonlySet<string>,
): SavedPreferences {
  if (!isRecord(saved)) return defaults
  const savedPairs = knownSymbols(saved.pairs, known)
  const pairs = savedPairs.length > 0 ? savedPairs : defaults.pairs
  const tracked = new Set(pairs)
  return {
    pairs,
    favorites: knownSymbols(saved.favorites, tracked),
    hidden: knownSymbols(saved.hidden, tracked),
    view: oneOf(saved.view, ['all', 'favorites'], defaults.view),
    sortKey: oneOf(saved.sortKey, ['name', 'price', 'change'], defaults.sortKey),
    sortDirection: oneOf(saved.sortDirection, ['asc', 'desc'], defaults.sortDirection),
    targets: savedTargets(saved.targets, tracked),
    theme: oneOf(saved.theme, ['system', 'light', 'dark'], defaults.theme),
  }
}
