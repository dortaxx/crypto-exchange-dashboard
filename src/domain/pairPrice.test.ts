import { describe, expect, it } from 'vitest'
import { HISTORY_LENGTH, nextPairPrice } from './pairPrice'
import type { PairPrice, Ticker } from './types'

const ticker = (price: number, updatedAt: number): Ticker => ({
  symbol: 'BTCUSDT',
  price,
  updatedAt,
})

function replay(prices: [number, number][]): PairPrice | undefined {
  let state: PairPrice | undefined
  for (const [price, time] of prices) state = nextPairPrice(state, ticker(price, time)) ?? state
  return state
}

describe('nextPairPrice', () => {
  it('makes the first price the starting price', () => {
    expect(nextPairPrice(undefined, ticker(100, 1))).toEqual({
      price: 100,
      startPrice: 100,
      changePercent: 0,
      direction: 'flat',
      updatedAt: 1,
      history: [{ time: 1, price: 100 }],
    })
  })

  it('keeps the starting price and measures the change since then', () => {
    expect(
      replay([
        [100, 1],
        [102, 2],
      ]),
    ).toMatchObject({ startPrice: 100, changePercent: 2 })
  })

  it('points up when the price rises and down when it falls', () => {
    expect(
      replay([
        [100, 1],
        [102, 2],
      ])?.direction,
    ).toBe('up')
    expect(
      replay([
        [100, 1],
        [99, 2],
      ])?.direction,
    ).toBe('down')
  })

  it('keeps the last direction when the price repeats', () => {
    expect(
      replay([
        [100, 1],
        [102, 2],
        [102, 3],
      ])?.direction,
    ).toBe('up')
  })

  it('ignores a price that is older than the one it already has', () => {
    const current = replay([
      [100, 1],
      [101, 5],
    ])
    expect(current && nextPairPrice(current, ticker(50, 3))).toBeNull()
  })

  it('keeps the whole session in a bounded history by thinning it out when full', () => {
    const prices: [number, number][] = Array.from({ length: HISTORY_LENGTH + 1 }, (_, i) => [
      100 + i,
      i + 1,
    ])
    const history = replay(prices)?.history ?? []
    expect(history.length).toBeLessThanOrEqual(HISTORY_LENGTH)
    expect(history[0]).toEqual({ time: 1, price: 100 })
    expect(history.at(-1)).toEqual({ time: HISTORY_LENGTH + 1, price: 100 + HISTORY_LENGTH })
  })
})
