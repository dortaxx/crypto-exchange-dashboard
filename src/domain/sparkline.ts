const MIN_RANGE_RATIO = 0.0005

export function sparklinePoints(
  values: readonly number[],
  width: number,
  height: number,
  padding = 2,
): string {
  if (values.length < 2) return ''

  const low = Math.min(...values)
  const high = Math.max(...values)
  const middle = (low + high) / 2
  const range = Math.max(high - low, Math.abs(middle) * MIN_RANGE_RATIO)
  const bottom = middle - range / 2
  const usableHeight = height - padding * 2
  const step = width / (values.length - 1)

  return values
    .map((value, index) => {
      const x = index * step
      const y = padding + (1 - (value - bottom) / range) * usableHeight
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')
}

export function sparklineTrend(values: readonly number[]): 'up' | 'down' | 'flat' {
  const first = values[0]
  const last = values.at(-1)
  if (first === undefined || last === undefined || first === last) return 'flat'
  return last > first ? 'up' : 'down'
}
