import { percentChange } from './percentChange'
import type { Direction, PairPrice, PricePoint, Ticker } from './types'

export const HISTORY_LENGTH = 600

export function nextPairPrice(previous: PairPrice | undefined, ticker: Ticker): PairPrice | null {
  if (previous === undefined) {
    return {
      price: ticker.price,
      startPrice: ticker.price,
      changePercent: 0,
      direction: 'flat',
      updatedAt: ticker.updatedAt,
      history: [{ time: ticker.updatedAt, price: ticker.price }],
    }
  }
  if (ticker.updatedAt < previous.updatedAt) return null

  return {
    price: ticker.price,
    startPrice: previous.startPrice,
    changePercent: percentChange(previous.startPrice, ticker.price),
    direction: directionOf(previous, ticker.price),
    updatedAt: ticker.updatedAt,
    history: withPoint(previous.history, { time: ticker.updatedAt, price: ticker.price }),
  }
}

function withPoint(history: readonly PricePoint[], point: PricePoint): readonly PricePoint[] {
  const next = [...history, point]
  if (next.length <= HISTORY_LENGTH) return next
  return next.filter((_, index) => index % 2 === 0 || index === next.length - 1)
}

function directionOf(previous: PairPrice, price: number): Direction {
  if (price > previous.price) return 'up'
  if (price < previous.price) return 'down'
  return previous.direction
}
