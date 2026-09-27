import { describe, expect, it } from 'vitest'
import { checkAlert, roundPercent } from './alertCheck'
import type { AlertZone } from './alerts'
import { nextPairPrice } from './pairPrice'
import type { PairPrice } from './types'

function priceMove(startPrice: number, price: number): PairPrice {
  const start = nextPairPrice(undefined, { symbol: 'BTCUSDT', price: startPrice, updatedAt: 1 })
  const next = start && nextPairPrice(start, { symbol: 'BTCUSDT', price, updatedAt: 2 })
  if (!next) throw new Error('unexpected: price was ignored')
  return next
}

describe('roundPercent', () => {
  it('rounds to the two decimals shown on screen', () => {
    expect(roundPercent(1.9999999999999927)).toBe(2)
    expect(roundPercent(2.1449)).toBe(2.14)
  })
})

describe('checkAlert', () => {
  it('creates an alert with everything the brief asks for when a coin crosses +2%', () => {
    expect(checkAlert('BTCUSDT', 'calm', priceMove(100, 102.14), 1000)).toEqual({
      zone: 'up',
      alert: {
        kind: 'move',
        id: 'BTCUSDT-1000',
        symbol: 'BTCUSDT',
        direction: 'up',
        startPrice: 100,
        price: 102.14,
        changePercent: 2.14,
        triggeredAt: 1000,
      },
    })
  })

  it('does not repeat the alert while the coin stays up', () => {
    expect(checkAlert('BTCUSDT', 'up', priceMove(100, 103), 2000)).toEqual({
      zone: 'up',
      alert: null,
    })
  })

  it('counts an exact 2% move even when the maths gives 1.9999999…', () => {
    const tiny = priceMove(2.5, 2.55)
    expect(tiny.changePercent).toBeLessThan(2)
    expect(checkAlert('XRPUSDT', 'calm', tiny, 1000).alert?.direction).toBe('up')
  })

  it('alerts again after the coin calmed down and crossed again', () => {
    let zone: AlertZone = 'calm'
    const fired: string[] = []
    for (const price of [102, 103, 101, 102.5]) {
      const result = checkAlert('BTCUSDT', zone, priceMove(100, price), price)
      zone = result.zone
      if (result.alert) fired.push(`${result.alert.direction} at ${price}`)
    }
    expect(fired).toEqual(['up at 102', 'up at 102.5'])
  })
})
