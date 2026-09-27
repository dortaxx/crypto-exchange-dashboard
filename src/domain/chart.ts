import type { PricePoint } from './types'

const MIN_SPAN_RATIO = 0.0005
const PADDING_RATIO = 0.15
const PRICE_TICK_TARGET = 4
const SECOND = 1000
const TIME_STEPS = [1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600, 7200].map(
  (seconds) => seconds * SECOND,
)
const LONGEST_TIME_STEP = 6 * 3600 * SECOND

export type ChartFrame = {
  start: number
  end: number
  bottom: number
  top: number
}

export type PriceChartModel = {
  frame: ChartFrame
  line: string
  area: string
  priceTicks: number[]
  timeTicks: number[]
  timeStep: number
}

export function chartX(frame: ChartFrame, time: number): number {
  return ((time - frame.start) / (frame.end - frame.start)) * 100
}

export function chartY(frame: ChartFrame, price: number): number {
  return (1 - (price - frame.bottom) / (frame.top - frame.bottom)) * 100
}

export function buildPriceChart(
  points: readonly PricePoint[],
  timeTickTarget = 4,
): PriceChartModel | null {
  const first = points[0]
  const last = points.at(-1)
  if (first === undefined || last === undefined || last.time <= first.time) return null

  const prices = points.map((point) => point.price)
  const low = Math.min(...prices)
  const high = Math.max(...prices)
  const middle = (low + high) / 2
  const span = Math.max(high - low, Math.abs(middle) * MIN_SPAN_RATIO) || 1
  const padding = span * PADDING_RATIO
  const frame: ChartFrame = {
    start: first.time,
    end: last.time,
    bottom: middle - span / 2 - padding,
    top: middle + span / 2 + padding,
  }

  const line = points
    .map((point, index) => {
      const x = chartX(frame, point.time).toFixed(2)
      const y = chartY(frame, point.price).toFixed(2)
      return `${index === 0 ? 'M' : 'L'}${x},${y}`
    })
    .join('')
  const timeStep =
    TIME_STEPS.find((step) => (frame.end - frame.start) / step <= timeTickTarget) ??
    LONGEST_TIME_STEP

  return {
    frame,
    line,
    area: `${line}L100,100L0,100Z`,
    priceTicks: ticksBetween(frame.bottom, frame.top, niceStep(frame.top - frame.bottom)),
    timeTicks: ticksBetween(frame.start, frame.end, timeStep),
    timeStep,
  }
}

export function nearestPoint(points: readonly PricePoint[], time: number): PricePoint | undefined {
  let low = 0
  let high = points.length - 1
  while (low < high) {
    const middle = Math.floor((low + high) / 2)
    const point = points[middle]
    if (point !== undefined && point.time < time) low = middle + 1
    else high = middle
  }
  const after = points[low]
  const before = points[low - 1]
  if (after === undefined || before === undefined) return after ?? before
  return time - before.time <= after.time - time ? before : after
}

function niceStep(span: number): number {
  const raw = span / PRICE_TICK_TARGET
  const magnitude = 10 ** Math.floor(Math.log10(raw))
  const scaled = raw / magnitude
  const nice = scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 5 ? 5 : 10
  return nice * magnitude
}

function ticksBetween(from: number, to: number, step: number): number[] {
  const ticks: number[] = []
  for (let value = Math.ceil(from / step) * step; value <= to; value += step) {
    ticks.push(Number(value.toPrecision(12)))
  }
  return ticks
}
