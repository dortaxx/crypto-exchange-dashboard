import { useId, useState, type PointerEvent } from 'react'
import { buildPriceChart, chartX, chartY, nearestPoint } from '../../domain/chart'
import { formatPrice, formatShortTime, formatTime } from '../../domain/format'
import type { Direction, PricePoint } from '../../domain/types'
import styles from './PriceChart.module.css'

const MINUTE = 60_000

type PriceChartProps = {
  points: readonly PricePoint[]
  startPrice: number
  trend: Direction
  label: string
}

export function PriceChart({ points, startPrice, trend, label }: PriceChartProps) {
  const fillId = `chart-fill-${useId().replace(/[^\w-]/g, '')}`
  const [pointer, setPointer] = useState<number | null>(null)
  const chart = buildPriceChart(points)
  if (chart === null) return null

  const { frame } = chart
  const last = points.at(-1)
  const formatTick = chart.timeStep < MINUTE ? formatTime : formatShortTime
  const hovered =
    pointer === null
      ? undefined
      : nearestPoint(points, frame.start + pointer * (frame.end - frame.start))
  const hover = hovered && {
    point: hovered,
    x: chartX(frame, hovered.time),
    y: chartY(frame, hovered.price),
  }

  function track(event: PointerEvent<HTMLDivElement>) {
    const box = event.currentTarget.getBoundingClientRect()
    setPointer(Math.min(1, Math.max(0, (event.clientX - box.left) / box.width)))
  }

  return (
    <div className={styles.chart} data-trend={trend} role="img" aria-label={label}>
      <div
        className={styles.plot}
        onPointerDown={track}
        onPointerMove={track}
        onPointerLeave={() => {
          setPointer(null)
        }}
      >
        {chart.priceTicks.map((tick) => (
          <span key={tick} className={styles.gridline} style={{ top: `${chartY(frame, tick)}%` }} />
        ))}
        <span className={styles.openLine} style={{ top: `${chartY(frame, startPrice)}%` }} />
        <svg
          className={styles.svg}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="currentColor" stopOpacity="0.32" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={chart.area} fill={`url(#${fillId})`} />
          <path d={chart.line} className={styles.line} />
        </svg>
        {hover && (
          <>
            <span className={styles.crosshair} style={{ left: `${hover.x}%` }} />
            <span className={styles.dot} style={{ left: `${hover.x}%`, top: `${hover.y}%` }} />
            <span
              className={styles.readout}
              style={{ left: `${hover.x}%`, transform: `translateX(-${hover.x}%)` }}
            >
              <strong>{formatPrice(hover.point.price)}</strong> {formatTime(hover.point.time)}
            </span>
          </>
        )}
      </div>

      <div className={styles.priceAxis} aria-hidden="true">
        {chart.priceTicks.map((tick) => (
          <span key={tick} className={styles.priceLabel} style={{ top: `${chartY(frame, tick)}%` }}>
            {formatPrice(tick)}
          </span>
        ))}
        {last && (
          <span className={styles.lastPrice} style={{ top: `${chartY(frame, last.price)}%` }}>
            {formatPrice(last.price)}
          </span>
        )}
      </div>

      <div className={styles.timeAxis} aria-hidden="true">
        {chart.timeTicks.map((tick) => {
          const x = chartX(frame, tick)
          return (
            <span
              key={tick}
              className={styles.timeLabel}
              style={{ left: `${x}%`, transform: `translateX(-${x}%)` }}
            >
              {formatTick(tick)}
            </span>
          )
        })}
      </div>
    </div>
  )
}
