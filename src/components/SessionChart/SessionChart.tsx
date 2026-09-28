import { formatPrice } from '../../domain/format'
import { changeTrend } from '../../domain/trend'
import type { Pair, PairPrice } from '../../domain/types'
import { CoinSelect } from '../CoinSelect/CoinSelect'
import { PercentChange } from '../PercentChange/PercentChange'
import { PriceChart } from '../PriceChart/PriceChart'
import styles from './SessionChart.module.css'

type SessionChartProps = {
  pairs: readonly Pair[]
  pair: Pair
  price: PairPrice | undefined
  unavailable: boolean
  onSelect: (base: string) => void
}

export function SessionChart({ pairs, pair, price, unavailable, onSelect }: SessionChartProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.summary}>
        <CoinSelect
          label="Coin to chart"
          value={pair.base}
          options={pairs.map((item) => ({ code: item.base, name: item.name }))}
          onChange={onSelect}
        />
        {price !== undefined && (
          <p className={styles.quote}>
            <span className={styles.price}>{formatPrice(price.price)}</span>
            <span className={styles.unit}>{pair.quote}</span>
            <PercentChange changePercent={price.changePercent} className={styles.change} />
          </p>
        )}
      </div>

      <div className={styles.plot}>
        {price !== undefined && price.history.length >= 2 ? (
          <PriceChart
            points={price.history}
            trend={changeTrend(price.changePercent)}
            label={`${pair.name} price this session`}
          />
        ) : (
          <p className={styles.waiting}>
            {unavailable ? 'No connection to Binance.' : 'Waiting for live prices…'}
          </p>
        )}
      </div>
    </div>
  )
}
