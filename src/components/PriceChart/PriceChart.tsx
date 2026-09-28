import { useCallback, useId, useState, type PointerEvent } from 'react'
import { buildPriceChart, chartX, chartY, nearestPoint } from '../../domain/chart'
import { formatAxisPrice, formatPrice, formatShortTime, formatTime } from '../../domain/format'
import type { Direction, PricePoint } from '../../domain/types'
import styles from './PriceChart.module.css'

const MINUTE = 60_000
const TIME_LABEL_SPACING_PX = 110
const TIME_LABEL_WIDTH_PX = 64
const PRICE_LABEL_CLEARANCE = 8

type PriceChartProps = {
  points: readonly PricePoint[]
  startPrice: number
  trend: Direction
  label: string
}

export function PriceChart({ points, startPrice, trend, label }: PriceChartProps) {
  const fillId = `chart-fill-${useId().replace(/[^\w-]/g, '')}`
  const [pointer, setPointer] = useState<number | null>(null)
  const [plotWidth, setPlotWidth] = useState(0)
  const observePlot = useCallback((plot: HTMLDivElement | null) => {
    if (plot === null) return
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setPlotWidth(entry.contentRect.width)
    })
    observer.observe(plot)
    return () => {
      observer.disconnect()
    }
  }, [])

  const chart = buildPriceChart(points, Math.max(2, Math.floor(plotWidth / TIME_LABEL_SPACING_PX)))
  if (chart === null) return null

  const { frame } = chart
  const last = points.at(-1)
  const formatTick = chart.timeStep < MINUTE ? formatTime : formatShortTime
  const lastY = last === undefined ? null : chartY(frame, last.price)
  const labelWidth = plotWidth === 0 ? 100 : (TIME_LABEL_WIDTH_PX / plotWidth) * 100
  const innerTimeTicks = chart.timeTicks.filter((tick) => {
    const x = chartX(frame, tick)
    return x >= labelWidth * 1.5 && x <= 100 - labelWidth * 1.5
  })
  const priceLabels = chart.priceTicks.filter(
    (tick) => lastY === null || Math.abs(chartY(frame, tick) - lastY) > PRICE_LABEL_CLEARANCE,
  )
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
        ref={observePlot}
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
        {priceLabels.map((tick) => (
          <span key={tick} className={styles.priceLabel} style={{ top: `${chartY(frame, tick)}%` }}>
            {formatAxisPrice(tick, chart.priceStep)}
          </span>
        ))}
        {last && lastY !== null && (
          <span className={styles.lastPrice} style={{ top: `${lastY}%` }}>
            {formatPrice(last.price)}
          </span>
        )}
      </div>

      <div className={styles.timeAxis} aria-hidden="true">
        <span className={styles.timeLabel} data-edge="start">
          {formatTick(frame.start)}
        </span>
        {innerTimeTicks.map((tick) => (
          <span key={tick} className={styles.timeLabel} style={{ left: `${chartX(frame, tick)}%` }}>
            {formatTick(tick)}
          </span>
        ))}
        {labelWidth < 50 && (
          <span className={styles.timeLabel} data-edge="end">
            {formatTick(frame.end)}
          </span>
        )}
      </div>
    </div>
  )
}
