import type { LoadStatus, Pair, PairPrice } from '../../domain/types'
import { PairRow } from '../PairRow/PairRow'
import styles from './PairTable.module.css'

type PairTableProps = {
  pairs: readonly Pair[]
  prices: Readonly<Record<string, PairPrice>>
  status: LoadStatus
  favorites: ReadonlySet<string>
  onToggleFavorite: (symbol: string) => void
  onHide: (symbol: string) => void
}

export function PairTable({
  pairs,
  prices,
  status,
  favorites,
  onToggleFavorite,
  onHide,
}: PairTableProps) {
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
            <th scope="col" className={styles.actions}>
              <span className="visually-hidden">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {pairs.map((pair, index) => (
            <PairRow
              key={pair.symbol}
              pair={pair}
              price={prices[pair.symbol]}
              isFavorite={favorites.has(pair.symbol)}
              loadingDelayMs={index * 120}
              onToggleFavorite={onToggleFavorite}
              onHide={onHide}
            />
          ))}
        </tbody>
      </table>
    </>
  )
}
