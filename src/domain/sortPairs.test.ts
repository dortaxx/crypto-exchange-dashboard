import { describe, expect, it } from 'vitest'
import { keepOrder, sortPairs } from './sortPairs'
import type { Pair, PairPrice } from './types'

const pair = (base: string, name: string): Pair => ({
  symbol: `${base}USDT`,
  base,
  quote: 'USDT',
  name,
})
const quote = (price: number, changePercent: number): PairPrice => ({
  price,
  startPrice: price,
  changePercent,
  direction: 'flat',
  updatedAt: 0,
  history: [],
})

const pairs = [pair('SOL', 'Solana'), pair('BTC', 'Bitcoin'), pair('ETH', 'Ethereum')]
const prices = {
  BTCUSDT: quote(84_000, -1.2),
  ETHUSDT: quote(2_700, 3.4),
  SOLUSDT: quote(120, 0.5),
}
const bases = (list: Pair[]) => list.map((p) => p.base)

describe('sortPairs', () => {
  it('sorts by name A to Z and back', () => {
    expect(bases(sortPairs(pairs, prices, 'name', 'asc'))).toEqual(['BTC', 'ETH', 'SOL'])
    expect(bases(sortPairs(pairs, prices, 'name', 'desc'))).toEqual(['SOL', 'ETH', 'BTC'])
  })

  it('sorts by current price', () => {
    expect(bases(sortPairs(pairs, prices, 'price', 'desc'))).toEqual(['BTC', 'ETH', 'SOL'])
    expect(bases(sortPairs(pairs, prices, 'price', 'asc'))).toEqual(['SOL', 'ETH', 'BTC'])
  })

  it('sorts by change since the page was opened', () => {
    expect(bases(sortPairs(pairs, prices, 'change', 'desc'))).toEqual(['ETH', 'SOL', 'BTC'])
    expect(bases(sortPairs(pairs, prices, 'change', 'asc'))).toEqual(['BTC', 'SOL', 'ETH'])
  })

  it('puts pairs without a price last in both directions, in name order', () => {
    const partial = { SOLUSDT: quote(120, 0.5) }
    expect(bases(sortPairs(pairs, partial, 'price', 'desc'))).toEqual(['SOL', 'BTC', 'ETH'])
    expect(bases(sortPairs(pairs, partial, 'price', 'asc'))).toEqual(['SOL', 'BTC', 'ETH'])
  })

  it('breaks ties by name and leaves the input untouched', () => {
    const tied = { BTCUSDT: quote(1, 0), ETHUSDT: quote(1, 0), SOLUSDT: quote(1, 0) }
    expect(bases(sortPairs(pairs, tied, 'change', 'desc'))).toEqual(['BTC', 'ETH', 'SOL'])
    expect(bases(pairs)).toEqual(['SOL', 'BTC', 'ETH'])
  })
})

describe('keepOrder', () => {
  it('keeps a remembered order, dropping pairs that left and adding new ones at the end', () => {
    const btc = pair('BTC', 'Bitcoin')
    const eth = pair('ETH', 'Ethereum')
    const sol = pair('SOL', 'Solana')
    expect(bases(keepOrder([btc, eth, sol], ['SOLUSDT', 'BTCUSDT']))).toEqual(['SOL', 'BTC', 'ETH'])
    expect(bases(keepOrder([eth, btc], ['SOLUSDT', 'BTCUSDT', 'ETHUSDT']))).toEqual(['BTC', 'ETH'])
  })
})
