import { formatPrice } from '../../domain/format'
import type { Pair, Ticker } from '../../domain/types'
import { CoinIcon } from '../CoinIcon/CoinIcon'
import { Skeleton } from '../Skeleton/Skeleton'
import styles from './PairRow.module.css'

type PairRowProps = {
  pair: Pair
  ticker: Ticker | undefined
  loadingDelayMs: number
}

export function PairRow({ pair, ticker, loadingDelayMs }: PairRowProps) {
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
        {ticker === undefined ? (
          <Skeleton width="5.5rem" height="0.875rem" delayMs={loadingDelayMs} />
        ) : (
          <span className={styles.price}>{formatPrice(ticker.price)}</span>
        )}
      </td>
      <td className={styles.numeric}>
        <Skeleton width="3.5rem" height="0.875rem" delayMs={loadingDelayMs} />
      </td>
      <td className={styles.trend}>
        <Skeleton width="5rem" height="1.5rem" delayMs={loadingDelayMs} />
      </td>
    </tr>
  )
}
