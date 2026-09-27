import type { Pair, ViewMode } from './types'

export type PairFilter = {
  hidden: readonly string[]
  favorites: readonly string[]
  view: ViewMode
}

export function visiblePairs(pairs: readonly Pair[], filter: PairFilter): Pair[] {
  const hidden = new Set(filter.hidden)
  const favorites = new Set(filter.favorites)
  return pairs.filter(
    (pair) => !hidden.has(pair.symbol) && (filter.view === 'all' || favorites.has(pair.symbol)),
  )
}
