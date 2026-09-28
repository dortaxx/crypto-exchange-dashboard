import type { PricePoint } from './types'

const MIN_SPAN_RATIO = 0.0005

export type ChartPaths = {
  line: string
  area: string
  low: number
  high: number
}

export function buildChartPaths(points: readonly PricePoint[]): ChartPaths | null {
  const first = points[0]
  const last = points.at(-1)
  if (first === undefined || last === undefined || last.time <= first.time) return null

  const prices = points.map((point) => point.price)
  const low = Math.min(...prices)
  const high = Math.max(...prices)
  const middle = (low + high) / 2
  const span = Math.max(high - low, middle * MIN_SPAN_RATIO)
  const bottom = middle - span / 2

  const line = points
    .map((point, index) => {
      const x = ((point.time - first.time) / (last.time - first.time)) * 100
      const y = (1 - (point.price - bottom) / span) * 100
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join('')

  return { line, area: `${line}L100,100L0,100Z`, low, high }
}
