import { describe, expect, it } from 'vitest'
import { percentChange } from './percentChange'

describe('percentChange', () => {
  it('is positive when the price went up', () => {
    expect(percentChange(100, 102)).toBeCloseTo(2)
  })

  it('is negative when the price went down', () => {
    expect(percentChange(100, 97)).toBeCloseTo(-3)
  })

  it('is zero when the price did not change', () => {
    expect(percentChange(84_028.01, 84_028.01)).toBe(0)
  })

  it('works for small prices too', () => {
    expect(percentChange(2.5, 2.55)).toBeCloseTo(2)
  })

  it('matches a real move: SOL from 114.85 to 117.15', () => {
    expect(percentChange(114.85, 117.15)).toBeCloseTo(2.0026, 4)
  })
})
