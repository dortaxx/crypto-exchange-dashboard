import { describe, expect, it } from 'vitest'
import { topMovers } from './stats'
import type { PairPrice } from './types'

const at = (changePercent: number): PairPrice => ({
  price: 100 + changePercent,
  startPrice: 100,
  changePercent,
  direction: 'flat',
  updatedAt: 1,
})

describe('topMovers', () => {
  it('finds the biggest rise and the biggest fall', () => {
    const prices = { BTCUSDT: at(0.4), ETHUSDT: at(-1.2), SOLUSDT: at(2.1), XRPUSDT: at(-0.3) }
    expect(topMovers(prices, Object.keys(prices))).toEqual({
      gainer: { symbol: 'SOLUSDT', changePercent: 2.1 },
      loser: { symbol: 'ETHUSDT', changePercent: -1.2 },
    })
  })

  it('reports no gainer when nothing has risen', () => {
    const prices = { BTCUSDT: at(-0.2), ETHUSDT: at(0) }
    expect(topMovers(prices, Object.keys(prices)).gainer).toBeNull()
  })

  it('ignores pairs that have no price yet or are not listed', () => {
    const prices = { BTCUSDT: at(0.5), SOLUSDT: at(3) }
    expect(topMovers(prices, ['BTCUSDT', 'ETHUSDT']).gainer).toEqual({
      symbol: 'BTCUSDT',
      changePercent: 0.5,
    })
  })
})
