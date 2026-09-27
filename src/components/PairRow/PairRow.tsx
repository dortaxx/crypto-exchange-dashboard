import { roundPercent } from '../../domain/alertCheck'
import { formatPercent, formatPrice } from '../../domain/format'
import type { Pair, PairPrice } from '../../domain/types'
import { CoinIcon } from '../CoinIcon/CoinIcon'
import { Skeleton } from '../Skeleton/Skeleton'
import { TrendIcon } from '../TrendIcon/TrendIcon'
import styles from './PairRow.module.css'

type PairRowProps = {
  pair: Pair
  price: PairPrice | undefined
  loadingDelayMs: number
}

function trendOf(changePercent: number): 'up' | 'down' | 'flat' {
  const shown = roundPercent(changePercent)
  if (shown > 0) return 'up'
  if (shown < 0) return 'down'
  return 'flat'
}

export function PairRow({ pair, price, loadingDelayMs }: PairRowProps) {
  const trend = price === undefined ? 'flat' : trendOf(price.changePercent)

  return (
    <tr className={styles.row}>
      <th scope="row" className={styles.asset}>
        <span className={styles.assetInner}>
          <CoinIcon asset={pair.base} />
          <span className={styles.name}>{pair.name}</span>
          <span className={styles.base}>{pair.base}</span>
        </span>
      </th>
      <td className={styles.numeric}>
        {price === undefined ? (
          <Skeleton width="5.5rem" height="0.875rem" delayMs={loadingDelayMs} />
        ) : (
          <span key={price.price} className={styles.price} data-direction={price.direction}>
            {formatPrice(price.price)}
          </span>
        )}
      </td>
      <td className={styles.numeric}>
        {price === undefined ? (
          <Skeleton width="3.5rem" height="0.875rem" delayMs={loadingDelayMs} />
        ) : (
          <span className={styles.change} data-trend={trend}>
            {trend !== 'flat' && <TrendIcon direction={trend} />}
            {formatPercent(price.changePercent)}
          </span>
        )}
      </td>
      <td className={styles.trend}>
        <Skeleton width="5rem" height="1.5rem" delayMs={loadingDelayMs} />
      </td>
    </tr>
  )
}
