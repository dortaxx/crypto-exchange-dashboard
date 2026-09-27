import { describe, expect, it } from 'vitest'
import { sparklinePoints, sparklineTrend } from './sparkline'

describe('sparklinePoints', () => {
  it('needs at least two points to draw a line', () => {
    expect(sparklinePoints([], 80, 24)).toBe('')
    expect(sparklinePoints([5], 80, 24)).toBe('')
  })

  it('spreads points across the width, lowest value at the bottom and highest at the top', () => {
    expect(sparklinePoints([10, 20, 15], 80, 24, 2)).toBe('0.00,22.00 40.00,2.00 80.00,12.00')
  })

  it('draws a flat line through the middle when the price never changed', () => {
    expect(sparklinePoints([7, 7, 7], 80, 24)).toBe('0.00,12.00 40.00,12.00 80.00,12.00')
  })

  it('keeps a one-cent wobble on a large price almost flat instead of stretching it', () => {
    const ys = sparklinePoints([84_566.01, 84_566.02, 84_566.01], 80, 24)
      .split(' ')
      .map((point) => Number(point.split(',')[1]))
    expect(Math.max(...ys) - Math.min(...ys)).toBeLessThan(1)
  })
})

describe('sparklineTrend', () => {
  it('compares the last point with the first', () => {
    expect(sparklineTrend([1, 3, 2])).toBe('up')
    expect(sparklineTrend([3, 1, 2])).toBe('down')
    expect(sparklineTrend([2, 5, 2])).toBe('flat')
    expect(sparklineTrend([])).toBe('flat')
  })
})
