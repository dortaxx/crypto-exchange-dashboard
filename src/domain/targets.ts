import type { PriceTarget, TargetAlert, Ticker } from './types'

export function targetDirection(currentPrice: number, targetPrice: number): 'up' | 'down' | null {
  if (targetPrice > currentPrice) return 'up'
  if (targetPrice < currentPrice) return 'down'
  return null
}

export function isTargetReached(target: PriceTarget, price: number): boolean {
  return target.direction === 'up' ? price >= target.price : price <= target.price
}

export function reachedTargets(
  targets: readonly PriceTarget[],
  tickers: readonly Ticker[],
  now: number,
): TargetAlert[] {
  const latest = new Map(tickers.map((ticker) => [ticker.symbol, ticker.price]))
  return targets.flatMap((target): TargetAlert[] => {
    const price = latest.get(target.symbol)
    if (price === undefined || !isTargetReached(target, price)) return []
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
