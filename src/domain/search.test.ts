import { describe, expect, it } from 'vitest'
import { matchesSearch } from './search'
import type { Pair } from './types'

const bitcoinCash: Pair = { symbol: 'BCHUSDT', base: 'BCH', quote: 'USDT', name: 'Bitcoin Cash' }

describe('matchesSearch', () => {
  it('matches everything when the search is empty or only spaces', () => {
    expect(matchesSearch(bitcoinCash, '')).toBe(true)
    expect(matchesSearch(bitcoinCash, '   ')).toBe(true)
  })

  it('matches part of the name, ignoring case and spaces', () => {
    expect(matchesSearch(bitcoinCash, 'bitcoin')).toBe(true)
    expect(matchesSearch(bitcoinCash, 'COIN CA')).toBe(true)
    expect(matchesSearch(bitcoinCash, 'bitcoincash')).toBe(true)
  })

  it('matches the symbol with or without the quote and slash', () => {
    expect(matchesSearch(bitcoinCash, 'bch')).toBe(true)
    expect(matchesSearch(bitcoinCash, 'BCH/USDT')).toBe(true)
    expect(matchesSearch(bitcoinCash, 'bchusdt')).toBe(true)
  })

  it('rejects text that appears nowhere', () => {
    expect(matchesSearch(bitcoinCash, 'eth')).toBe(false)
  })
})
