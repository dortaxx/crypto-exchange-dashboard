import { sparklinePoints, sparklineTrend } from '../../domain/sparkline'
import styles from './Sparkline.module.css'

const WIDTH = 96
const HEIGHT = 28

type SparklineProps = {
  values: readonly number[]
  label: string
}

export function Sparkline({ values, label }: SparklineProps) {
  const points = sparklinePoints(values, WIDTH, HEIGHT)
  const trend = sparklineTrend(values)
  const last = points.split(' ').at(-1)?.split(',')

  return (
    <svg
      className={styles.sparkline}
      data-trend={trend}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={label}
    >
      <polyline points={points} />
      {last && <circle cx={last[0]} cy={last[1]} r="2" />}
    </svg>
  )
}
