import { useId } from 'react'
import { buildChartPaths } from '../../domain/chart'
import { formatPrice } from '../../domain/format'
import type { Direction, PricePoint } from '../../domain/types'
import styles from './PriceChart.module.css'

type PriceChartProps = {
  points: readonly PricePoint[]
  trend: Direction
  label: string
}

export function PriceChart({ points, trend, label }: PriceChartProps) {
  const fillId = `chart-fill-${useId().replace(/[^\w-]/g, '')}`
  const chart = buildChartPaths(points)
  if (chart === null) return null

  return (
    <figure className={styles.chart} data-trend={trend}>
      <svg
        className={styles.svg}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        role="img"
        aria-label={label}
      >
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.3" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={chart.area} fill={`url(#${fillId})`} />
        <path d={chart.line} className={styles.line} />
      </svg>
      <figcaption className={styles.range}>
        <span>Low {formatPrice(chart.low)}</span>
        <span>High {formatPrice(chart.high)}</span>
      </figcaption>
    </figure>
  )
}
