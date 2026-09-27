import { describe, expect, it } from 'vitest'
import { buildPriceChart, chartY, nearestPoint } from './chart'
import type { PricePoint } from './types'

const points = (...pairs: [number, number][]): PricePoint[] =>
  pairs.map(([time, price]) => ({ time, price }))

describe('buildPriceChart', () => {
  it('needs two points at different times to draw anything', () => {
    expect(buildPriceChart([])).toBeNull()
    expect(buildPriceChart(points([1000, 5]))).toBeNull()
    expect(buildPriceChart(points([1000, 5], [1000, 6]))).toBeNull()
  })

  it('runs the line from the left edge to the right edge, higher prices nearer the top', () => {
    const chart = buildPriceChart(points([0, 100], [5000, 110], [10_000, 105]))
    expect(chart?.line).toMatch(/^M0\.00,\d+\.\d+L50\.00,\d+\.\d+L100\.00,\d+\.\d+$/)
    const [start, peak] = (chart?.line ?? '')
      .slice(1)
      .split('L')
      .map((xy) => Number(xy.split(',')[1]))
    expect(peak).toBeLessThan(start ?? 0)
  })

  it('closes the area along the bottom edge', () => {
    expect(buildPriceChart(points([0, 1], [1000, 2]))?.area).toMatch(/L100,100L0,100Z$/)
  })

  it('keeps a one-cent wobble near the middle instead of stretching it to full height', () => {
    const chart = buildPriceChart(points([0, 84_566.01], [1000, 84_566.02], [2000, 84_566.01]))
    if (!chart) throw new Error('expected a chart')
    const top = chartY(chart.frame, 84_566.02)
    const bottom = chartY(chart.frame, 84_566.01)
    expect(bottom - top).toBeLessThan(5)
  })

  it('labels the price axis with round numbers inside the visible range', () => {
    const chart = buildPriceChart(points([0, 100], [1000, 110]))
    expect(chart?.priceTicks).toEqual([100, 105, 110])
  })

  it('labels the time axis on whole clock steps that grow with the session', () => {
    const short = buildPriceChart(points([1_000, 1], [21_000, 2]))
    expect(short?.timeStep).toBe(5_000)
    expect(short?.timeTicks).toEqual([5_000, 10_000, 15_000, 20_000])

    const long = buildPriceChart(points([0, 1], [3_600_000, 2]))
    expect(long?.timeStep).toBe(900_000)
  })
})

describe('nearestPoint', () => {
  const series = points([0, 1], [1000, 2], [2000, 3])

  it('finds the point closest in time', () => {
    expect(nearestPoint(series, 400)).toEqual({ time: 0, price: 1 })
    expect(nearestPoint(series, 600)).toEqual({ time: 1000, price: 2 })
    expect(nearestPoint(series, 9999)).toEqual({ time: 2000, price: 3 })
    expect(nearestPoint(series, -50)).toEqual({ time: 0, price: 1 })
  })

  it('returns nothing for an empty series', () => {
    expect(nearestPoint([], 5)).toBeUndefined()
  })
})
