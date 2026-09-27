import { describe, expect, it } from 'vitest'
import type { Pair } from './types'
import { visiblePairs } from './visiblePairs'

const pair = (base: string, name: string): Pair => ({
  symbol: `${base}USDT`,
  base,
  quote: 'USDT',
  name,
})
const pairs = [pair('BTC', 'Bitcoin'), pair('ETH', 'Ethereum'), pair('SOL', 'Solana')]
const bases = (list: Pair[]) => list.map((p) => p.base)

describe('visiblePairs', () => {
  it('shows every pair by default', () => {
    expect(bases(visiblePairs(pairs, { hidden: [], favorites: [], view: 'all' }))).toEqual([
      'BTC',
      'ETH',
      'SOL',
    ])
  })

  it('leaves out hidden pairs', () => {
    expect(bases(visiblePairs(pairs, { hidden: ['ETHUSDT'], favorites: [], view: 'all' }))).toEqual(
      ['BTC', 'SOL'],
    )
  })

  it('shows only favorites in the favorites view', () => {
    expect(
      bases(visiblePairs(pairs, { hidden: [], favorites: ['SOLUSDT'], view: 'favorites' })),
    ).toEqual(['SOL'])
  })

  it('keeps a hidden pair hidden even when it is a favorite', () => {
    expect(
      visiblePairs(pairs, { hidden: ['SOLUSDT'], favorites: ['SOLUSDT'], view: 'favorites' }),
    ).toEqual([])
  })
})
