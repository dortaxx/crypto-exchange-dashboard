import type { LoadStatus, Pair, Ticker } from '../../domain/types'
import { PairRow } from '../PairRow/PairRow'
import styles from './PairTable.module.css'

type PairTableProps = {
  pairs: readonly Pair[]
  tickers: Readonly<Record<string, Ticker>>
  status: LoadStatus
}

export function PairTable({ pairs, tickers, status }: PairTableProps) {
  return (
    <>
      <p className={status === 'error' ? styles.error : 'visually-hidden'} role="status">
        {status === 'loading' && 'Loading prices from Binance'}
        {status === 'error' && 'Couldn’t load prices from Binance. Check your connection.'}
      </p>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col" className={styles.asset}>
              Asset
            </th>
            <th scope="col" className={styles.numeric}>
              Price
            </th>
            <th scope="col" className={styles.numeric}>
              Since open
            </th>
            <th scope="col" className={styles.trend}>
              Trend
            </th>
          </tr>
        </thead>
        <tbody>
          {pairs.map((pair, index) => (
            <PairRow
              key={pair.symbol}
              pair={pair}
              ticker={tickers[pair.symbol]}
              loadingDelayMs={index * 120}
            />
          ))}
        </tbody>
      </table>
    </>
  )
}
