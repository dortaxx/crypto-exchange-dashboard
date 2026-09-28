import { formatPercent } from '../../domain/format'
import { changeTrend } from '../../domain/trend'
import { TrendIcon } from '../TrendIcon/TrendIcon'
import styles from './PercentChange.module.css'

type PercentChangeProps = {
  changePercent: number
  className?: string
}

export function PercentChange({ changePercent, className }: PercentChangeProps) {
  const trend = changeTrend(changePercent)

  return (
    <span
      className={className ? `${styles.change} ${className}` : styles.change}
      data-trend={trend}
    >
      {trend !== 'flat' && <TrendIcon direction={trend} />}
      {formatPercent(changePercent)}
    </span>
  )
}
