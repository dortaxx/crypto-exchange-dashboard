import type { Pair } from '../../domain/types'
import { PairRow } from '../PairRow/PairRow'
import styles from './PairTable.module.css'

type PairTableProps = {
  pairs: readonly Pair[]
}

export function PairTable({ pairs }: PairTableProps) {
  return (
    <>
      <p className="visually-hidden" role="status">
        Waiting for prices from Binance
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
            <PairRow key={pair.symbol} pair={pair} loadingDelayMs={index * 120} />
          ))}
        </tbody>
      </table>
    </>
  )
}
