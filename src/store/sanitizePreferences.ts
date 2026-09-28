import {
  SORT_DIRECTIONS,
  SORT_KEYS,
  THEME_CHOICES,
  VIEW_MODES,
  type PriceTarget,
  type SortDirection,
  type SortKey,
  type ThemeChoice,
  type ViewMode,
} from '../domain/types'
import { isRecord } from '../domain/guards'

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
    view: oneOf(saved.view, VIEW_MODES, defaults.view),
    sortKey: oneOf(saved.sortKey, SORT_KEYS, defaults.sortKey),
    sortDirection: oneOf(saved.sortDirection, SORT_DIRECTIONS, defaults.sortDirection),
    targets: savedTargets(saved.targets, tracked),
    theme: oneOf(saved.theme, THEME_CHOICES, defaults.theme),
  }
}
