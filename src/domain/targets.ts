import type { PriceTarget, TargetAlert } from './types'

export type PriceRange = {
  low: number
  high: number
}

const TYPO_DISTANCE = 0.5

export function targetDirection(currentPrice: number, targetPrice: number): 'up' | 'down' | null {
  if (targetPrice > currentPrice) return 'up'
  if (targetPrice < currentPrice) return 'down'
  return null
}

export function isTargetReached(target: PriceTarget, price: number): boolean {
  return target.direction === 'up' ? price >= target.price : price <= target.price
}

export function widenRange(range: PriceRange | undefined, price: number): PriceRange {
  if (range === undefined) return { low: price, high: price }
  return { low: Math.min(range.low, price), high: Math.max(range.high, price) }
}

export function reachedTargets(
  targets: readonly PriceTarget[],
  ranges: ReadonlyMap<string, PriceRange>,
  now: number,
): TargetAlert[] {
  return targets.flatMap((target): TargetAlert[] => {
    const range = ranges.get(target.symbol)
    if (range === undefined) return []
    const price = target.direction === 'up' ? range.high : range.low
    if (!isTargetReached(target, price)) return []
    return [
      {
        kind: 'target',
        id: target.id,
        symbol: target.symbol,
        direction: target.direction,
        targetPrice: target.price,
        price,
        triggeredAt: now,
      },
    ]
  })
}

export function likelyIntended(targetPrice: number, currentPrice: number): number | null {
  if (Math.abs(targetPrice - currentPrice) / currentPrice <= TYPO_DISTANCE) return null
  const shift = Math.round(Math.log10(currentPrice / targetPrice))
  if (shift === 0) return null
  const suggestion = Number((targetPrice * 10 ** shift).toPrecision(12))
  return Math.abs(suggestion - currentPrice) / currentPrice <= TYPO_DISTANCE ? suggestion : null
}
