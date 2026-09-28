import { describe, expect, it } from 'vitest'
import {
  isTargetReached,
  likelyIntended,
  reachedTargets,
  targetDirection,
  widenRange,
  type PriceRange,
} from './targets'
import type { PriceTarget } from './types'

const target = (
  price: number,
  direction: 'up' | 'down',
  symbol = 'BTCUSDT',
  createdAt = 0,
): PriceTarget => ({
  id: `${symbol}-${direction}-${price}`,
  symbol,
  price,
  direction,
  createdAt,
})
const range = (low: number, high: number, last = high): PriceRange => ({ low, high, last })
const ranges = (entries: Record<string, PriceRange>) => new Map(Object.entries(entries))

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

describe('widenRange', () => {
  it('tracks the lowest and highest price seen', () => {
    const seen = [100, 97, 103, 101].reduce<PriceRange | undefined>(widenRange, undefined)
    expect(seen).toEqual({ low: 97, high: 103, last: 101 })
  })
})

describe('reachedTargets', () => {
  it('turns every reached target into an alert that keeps the target id', () => {
    const targets = [target(110, 'up'), target(90, 'down'), target(3000, 'up', 'ETHUSDT')]
    const alerts = reachedTargets(
      targets,
      ranges({ BTCUSDT: range(100, 111), ETHUSDT: range(2900, 2950) }),
      1,
      5,
    )

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

  it('catches a dip that touched the target even if the price is back above it', () => {
    const alerts = reachedTargets(
      [target(82_970, 'down')],
      ranges({ BTCUSDT: range(82_960, 83_010) }),
      1,
      5,
    )
    expect(alerts).toEqual([expect.objectContaining({ direction: 'down', price: 82_960 })])
  })

  it('ignores targets whose pair has no new price in this batch', () => {
    expect(reachedTargets([target(110, 'up')], ranges({ ETHUSDT: range(1, 9) }), 1, 5)).toEqual([])
  })

  it('ignores prices from before the target was created, using only the latest one', () => {
    const fresh = target(82_970, 'down', 'BTCUSDT', 10)
    expect(
      reachedTargets([fresh], ranges({ BTCUSDT: range(82_900, 83_100, 83_050) }), 5, 20),
    ).toEqual([])
    expect(
      reachedTargets([fresh], ranges({ BTCUSDT: range(82_900, 83_100, 82_960) }), 5, 20),
    ).toEqual([expect.objectContaining({ price: 82_960 })])
  })
})

describe('likelyIntended', () => {
  it('suggests the price with the right number of digits when a zero is missing or extra', () => {
    expect(likelyIntended(8_300, 82_984)).toBe(83_000)
    expect(likelyIntended(830_000, 82_984)).toBe(83_000)
    expect(likelyIntended(0.25, 2.4)).toBe(2.5)
  })

  it('stays quiet for targets that are plausible, even far ones', () => {
    expect(likelyIntended(83_990, 82_984)).toBeNull()
    expect(likelyIntended(150_000, 82_984)).toBeNull()
    expect(likelyIntended(30_000, 82_984)).toBeNull()
  })
})
