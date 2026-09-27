import { formatPercent, formatPrice } from '../../domain/format'
import { changeTrend } from '../../domain/trend'
import type { Pair, PairPrice } from '../../domain/types'
import { PairSwitcher } from '../PairSwitcher/PairSwitcher'
import { PriceChart } from '../PriceChart/PriceChart'
import { Skeleton } from '../Skeleton/Skeleton'
import { TrendIcon } from '../TrendIcon/TrendIcon'
import styles from './SessionChart.module.css'

type SessionChartProps = {
  pairs: readonly Pair[]
  pair: Pair
  price: PairPrice | undefined
  unavailable: boolean
  onSelect: (symbol: string) => void
}

export function SessionChart({ pairs, pair, price, unavailable, onSelect }: SessionChartProps) {
  const trend = price === undefined ? 'flat' : changeTrend(price.changePercent)

  return (
    <div className={styles.panel}>
      <PairSwitcher pairs={pairs} selected={pair.symbol} onSelect={onSelect} />

      <div className={styles.summary}>
        <div>
          <p className={styles.pair}>
            {pair.name} <span className={styles.symbol}>{`${pair.base}/${pair.quote}`}</span>
          </p>
          {price === undefined && unavailable && <p className={styles.unavailable}>—</p>}
          {price === undefined && !unavailable && <Skeleton width="11rem" height="1.75rem" />}
          {price !== undefined && (
            <p className={styles.quote}>
              <span className={styles.price}>{formatPrice(price.price)}</span>
              <span className={styles.unit}>{pair.quote}</span>
              <span className={styles.change} data-trend={trend}>
                {trend !== 'flat' && <TrendIcon direction={trend} />}
                {formatPercent(price.changePercent)}
              </span>
            </p>
          )}
        </div>
        {price !== undefined && <p className={styles.open}>Open {formatPrice(price.startPrice)}</p>}
      </div>

      <div className={styles.plot}>
        {price !== undefined && price.history.length >= 2 ? (
          <PriceChart
            points={price.history}
            startPrice={price.startPrice}
            trend={trend}
            label={`${pair.name} price this session: opened at ${formatPrice(price.startPrice)}, now ${formatPrice(price.price)} ${pair.quote}`}
          />
        ) : (
          <p className={styles.waiting}>
            {unavailable
              ? 'Couldn’t load prices from Binance. The chart starts once prices arrive.'
              : 'Waiting for live prices to draw the chart…'}
          </p>
        )}
      </div>
    </div>
  )
}
