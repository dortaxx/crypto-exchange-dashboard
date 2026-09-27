import type { SortDirection, SortKey, ViewMode } from '../domain/types'

export type SavedPreferences = {
  favorites: string[]
  hidden: string[]
  view: ViewMode
  sortKey: SortKey
  sortDirection: SortDirection
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

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.find((option) => option === value) ?? fallback
}

export function sanitizePreferences(
  saved: unknown,
  defaults: SavedPreferences,
  known: ReadonlySet<string>,
): SavedPreferences {
  if (!isRecord(saved)) return defaults
  return {
    favorites: knownSymbols(saved.favorites, known),
    hidden: knownSymbols(saved.hidden, known),
    view: oneOf(saved.view, ['all', 'favorites'], defaults.view),
    sortKey: oneOf(saved.sortKey, ['name', 'price', 'change'], defaults.sortKey),
    sortDirection: oneOf(saved.sortDirection, ['asc', 'desc'], defaults.sortDirection),
  }
}
