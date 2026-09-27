import type { Pair, PairPrice, SortDirection, SortKey } from './types'

export function sortPairs(
  pairs: readonly Pair[],
  prices: Readonly<Record<string, PairPrice>>,
  key: SortKey,
  direction: SortDirection,
): Pair[] {
  const sign = direction === 'asc' ? 1 : -1
  const valueOf = (pair: Pair): number | undefined => {
    const price = prices[pair.symbol]
    if (price === undefined) return undefined
    return key === 'price' ? price.price : price.changePercent
  }

  return [...pairs].sort((a, b) => {
    const byName = a.name.localeCompare(b.name)
    if (key === 'name') return sign * byName

    const left = valueOf(a)
    const right = valueOf(b)
    if (left === undefined || right === undefined) {
      if (left === right) return byName
      return left === undefined ? 1 : -1
    }
    return sign * (left - right) || byName
  })
}

export function keepOrder(pairs: readonly Pair[], order: readonly string[]): Pair[] {
  const rank = new Map(order.map((symbol, index) => [symbol, index]))
  return [...pairs].sort(
    (a, b) => (rank.get(a.symbol) ?? order.length) - (rank.get(b.symbol) ?? order.length),
  )
}
