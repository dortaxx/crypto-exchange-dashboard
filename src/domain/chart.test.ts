import { describe, expect, it } from 'vitest'
import { buildChartPaths } from './chart'
import type { PricePoint } from './types'

const points = (...pairs: [number, number][]): PricePoint[] =>
  pairs.map(([time, price]) => ({ time, price }))

describe('buildChartPaths', () => {
  it('needs two points at different times to draw anything', () => {
    expect(buildChartPaths([])).toBeNull()
    expect(buildChartPaths(points([1000, 5]))).toBeNull()
    expect(buildChartPaths(points([1000, 5], [1000, 6]))).toBeNull()
  })

  it('runs from the left edge to the right edge, lowest price at the bottom', () => {
    expect(buildChartPaths(points([0, 100], [5000, 110], [10_000, 105]))?.line).toBe(
      'M0.00,100.00L50.00,0.00L100.00,50.00',
    )
  })

  it('closes the area along the bottom edge and reports the low and high', () => {
    expect(buildChartPaths(points([0, 1], [1000, 2]))).toMatchObject({
      area: expect.stringMatching(/L100,100L0,100Z$/) as unknown,
      low: 1,
      high: 2,
    })
  })

  it('keeps a one-cent wobble near the middle instead of stretching it to full height', () => {
    const line = buildChartPaths(points([0, 84_566.01], [1000, 84_566.02]))?.line ?? ''
    const ys = line
      .slice(1)
      .split('L')
      .map((xy) => Number(xy.split(',')[1]))
    expect(Math.abs((ys[0] ?? 0) - (ys[1] ?? 0))).toBeLessThan(5)
  })
})
