import { describe, expect, it } from 'vitest'
import { backoffDelay } from './backoff'

const alwaysMax = () => 1
const alwaysHalf = () => 0.5
const alwaysZero = () => 0

describe('backoffDelay', () => {
  it('doubles the longest possible wait with every attempt', () => {
    expect([1, 2, 3, 4, 5].map((attempt) => backoffDelay(attempt, alwaysMax))).toEqual([
      1_000, 2_000, 4_000, 8_000, 16_000,
    ])
  })

  it('never waits longer than 30 seconds', () => {
    expect(backoffDelay(6, alwaysMax)).toBe(30_000)
    expect(backoffDelay(50, alwaysMax)).toBe(30_000)
  })

  it('picks a random wait between zero and the ceiling (jitter)', () => {
    expect(backoffDelay(3, alwaysHalf)).toBe(2_000)
    expect(backoffDelay(3, alwaysZero)).toBe(0)
  })
})
