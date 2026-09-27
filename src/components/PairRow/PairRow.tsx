import { formatPercent, formatPrice } from '../../domain/format'
import type { Pair, PairPrice } from '../../domain/types'
import { CoinIcon } from '../CoinIcon/CoinIcon'
import { Skeleton } from '../Skeleton/Skeleton'
import styles from './PairRow.module.css'

type PairRowProps = {
  pair: Pair
  price: PairPrice | undefined
  loadingDelayMs: number
}

function trendOf(changePercent: number): 'up' | 'down' | 'flat' {
  if (changePercent > 0) return 'up'
  if (changePercent < 0) return 'down'
  return 'flat'
}

export function PairRow({ pair, price, loadingDelayMs }: PairRowProps) {
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
          <span className={styles.figure}>{formatPrice(price.price)}</span>
        )}
      </td>
      <td className={styles.numeric}>
        {price === undefined ? (
          <Skeleton width="3.5rem" height="0.875rem" delayMs={loadingDelayMs} />
        ) : (
          <span className={styles.figure} data-trend={trendOf(price.changePercent)}>
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
