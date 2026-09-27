import { describe, expect, it } from 'vitest'
import { changeTrend } from './trend'

describe('changeTrend', () => {
  it('follows the sign of the change as it is shown, rounded to two decimals', () => {
    expect(changeTrend(0.5)).toBe('up')
    expect(changeTrend(-0.5)).toBe('down')
    expect(changeTrend(0.004)).toBe('flat')
    expect(changeTrend(-0.004)).toBe('flat')
  })
})
