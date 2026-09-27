import { roundPercent } from './alertCheck'
import type { PairPrice } from './types'

export type Mover = {
  symbol: string
  changePercent: number
}

export function topMovers(
  prices: Readonly<Record<string, PairPrice>>,
  symbols: readonly string[],
): { gainer: Mover | null; loser: Mover | null } {
  let gainer: Mover | null = null
  let loser: Mover | null = null

  for (const symbol of symbols) {
    const price = prices[symbol]
    if (price === undefined) continue
    const changePercent = roundPercent(price.changePercent)
    if (changePercent > 0 && (gainer === null || changePercent > gainer.changePercent)) {
      gainer = { symbol, changePercent }
    }
    if (changePercent < 0 && (loser === null || changePercent < loser.changePercent)) {
      loser = { symbol, changePercent }
    }
  }

  return { gainer, loser }
}
