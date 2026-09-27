import { describe, expect, it } from 'vitest'
import { isTargetReached, reachedTargets, targetDirection } from './targets'
import type { PriceTarget, Ticker } from './types'

const target = (price: number, direction: 'up' | 'down', symbol = 'BTCUSDT'): PriceTarget => ({
  id: `${symbol}-${direction}-${price}`,
  symbol,
  price,
  direction,
  createdAt: 0,
})
const ticker = (symbol: string, price: number): Ticker => ({ symbol, price, updatedAt: 1 })

describe('targetDirection', () => {
  it('waits for a rise when the target is above the current price, and a fall when below', () => {
    expect(targetDirection(100, 110)).toBe('up')
    expect(targetDirection(100, 90)).toBe('down')
  })

  it('refuses a target equal to the current price', () => {
    expect(targetDirection(100, 100)).toBeNull()
  })
})

describe('isTargetReached', () => {
  it('counts touching the target as reaching it', () => {
    expect(isTargetReached(target(110, 'up'), 110)).toBe(true)
    expect(isTargetReached(target(90, 'down'), 90)).toBe(true)
  })

  it('only fires on the side the target was set for', () => {
    expect(isTargetReached(target(110, 'up'), 109.99)).toBe(false)
    expect(isTargetReached(target(110, 'up'), 50)).toBe(false)
    expect(isTargetReached(target(90, 'down'), 150)).toBe(false)
  })
})

describe('reachedTargets', () => {
  it('turns every reached target into an alert that keeps the target id', () => {
    const targets = [target(110, 'up'), target(90, 'down'), target(3000, 'up', 'ETHUSDT')]
    const alerts = reachedTargets(targets, [ticker('BTCUSDT', 111), ticker('ETHUSDT', 2900)], 5)

    expect(alerts).toEqual([
      {
        kind: 'target',
        id: 'BTCUSDT-up-110',
        symbol: 'BTCUSDT',
        direction: 'up',
        targetPrice: 110,
        price: 111,
        triggeredAt: 5,
      },
    ])
  })

  it('ignores targets whose pair has no new price in this batch', () => {
    expect(reachedTargets([target(110, 'up')], [ticker('ETHUSDT', 5000)], 5)).toEqual([])
  })
})
