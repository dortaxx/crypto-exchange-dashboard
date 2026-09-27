import { describe, expect, it } from 'vitest'
import { convert, priceInUsdt } from './convert'
import type { PairPrice } from './types'

const quoted = (price: number): PairPrice => ({
  price,
  startPrice: price,
  changePercent: 0,
  direction: 'flat',
  updatedAt: 1,
  history: [],
})

const prices = { BTCUSDT: quoted(84_000), ETHUSDT: quoted(2_625) }

describe('priceInUsdt', () => {
  it('reads a coin price from its USDT pair', () => {
    expect(priceInUsdt('BTC', prices)).toBe(84_000)
  })

  it('treats USDT itself as worth exactly 1', () => {
    expect(priceInUsdt('USDT', prices)).toBe(1)
  })

  it('returns undefined while a price has not arrived yet', () => {
    expect(priceInUsdt('SOL', prices)).toBeUndefined()
  })
})

describe('convert', () => {
  it('converts between two coins through USDT', () => {
    expect(convert(0.5, 84_000, 2_625)).toBeCloseTo(16)
  })

  it('converts a coin into USDT', () => {
    expect(convert(2, 84_000, 1)).toBe(168_000)
  })

  it('converts USDT into a coin', () => {
    expect(convert(168_000, 1, 84_000)).toBe(2)
  })

  it('returns the same amount when both sides are the same asset', () => {
    expect(convert(3.7, 2_625, 2_625)).toBe(3.7)
  })
})
