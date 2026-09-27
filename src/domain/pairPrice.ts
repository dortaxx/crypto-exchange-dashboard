import { percentChange } from './percentChange'
import type { Direction, PairPrice, Ticker } from './types'

export const HISTORY_LENGTH = 120

export function nextPairPrice(previous: PairPrice | undefined, ticker: Ticker): PairPrice | null {
  if (previous === undefined) {
    return {
      price: ticker.price,
      startPrice: ticker.price,
      changePercent: 0,
      direction: 'flat',
      updatedAt: ticker.updatedAt,
      history: [ticker.price],
    }
  }
  if (ticker.updatedAt < previous.updatedAt) return null

  return {
    price: ticker.price,
    startPrice: previous.startPrice,
    changePercent: percentChange(previous.startPrice, ticker.price),
    direction: directionOf(previous, ticker.price),
    updatedAt: ticker.updatedAt,
    history: [...previous.history.slice(-(HISTORY_LENGTH - 1)), ticker.price],
  }
}

function directionOf(previous: PairPrice, price: number): Direction {
  if (price > previous.price) return 'up'
  if (price < previous.price) return 'down'
  return previous.direction
}
