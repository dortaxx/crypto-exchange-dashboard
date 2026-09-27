import { formatPercent, formatPrice } from '../../domain/format'
import { changeTrend } from '../../domain/trend'
import type { Pair, PairPrice } from '../../domain/types'
import { CoinIcon } from '../CoinIcon/CoinIcon'
import { Skeleton } from '../Skeleton/Skeleton'
import { TrendIcon } from '../TrendIcon/TrendIcon'
import styles from './PairRow.module.css'

type PairRowProps = {
  pair: Pair
  price: PairPrice | undefined
  isFavorite: boolean
  unavailable: boolean
  loadingDelayMs: number
  onToggleFavorite: (symbol: string) => void
  onHide: (symbol: string) => void
}

export function PairRow({
  pair,
  price,
  isFavorite,
  unavailable,
  loadingDelayMs,
  onToggleFavorite,
  onHide,
}: PairRowProps) {
  const trend = price === undefined ? 'flat' : changeTrend(price.changePercent)
  const placeholder = (width: string) =>
    unavailable ? (
      <span className={styles.missing}>—</span>
    ) : (
      <Skeleton width={width} height="0.875rem" delayMs={loadingDelayMs} />
    )

  return (
    <tr className={styles.row}>
      <th scope="row" className={styles.asset}>
        <span className={styles.assetInner}>
          <button
            type="button"
            className={styles.star}
            data-action="favorite"
            aria-pressed={isFavorite}
            aria-label={`Favorite ${pair.name}`}
            onClick={() => {
              onToggleFavorite(pair.symbol)
            }}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M8 1.9 9.85 5.7l4.15.6-3 2.95.7 4.15L8 11.45 4.3 13.4l.7-4.15-3-2.95 4.15-.6Z" />
            </svg>
          </button>
          <CoinIcon asset={pair.base} />
          <span className={styles.label}>
            <span className={styles.name}>{pair.name}</span>
            <span className={styles.base}>{pair.base}</span>
          </span>
        </span>
      </th>
      <td className={styles.numeric}>
        {price === undefined ? (
          placeholder('5.5rem')
        ) : (
          <span key={price.price} className={styles.price} data-direction={price.direction}>
            {formatPrice(price.price)}
          </span>
        )}
      </td>
      <td className={styles.numeric}>
        {price === undefined ? (
          placeholder('3.5rem')
        ) : (
          <span className={styles.change} data-trend={trend}>
            {trend !== 'flat' && <TrendIcon direction={trend} />}
            {formatPercent(price.changePercent)}
          </span>
        )}
      </td>
      <td className={styles.actions}>
        <button
          type="button"
          className={styles.hide}
          data-action="hide"
          aria-label={`Hide ${pair.name}`}
          title="Hide"
          onClick={() => {
            onHide(pair.symbol)
          }}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M1.75 8S4 3.75 8 3.75 14.25 8 14.25 8 12 12.25 8 12.25 1.75 8 1.75 8Z" />
            <circle cx="8" cy="8" r="1.9" />
            <path d="m2.75 13.25 10.5-10.5" />
          </svg>
        </button>
      </td>
    </tr>
  )
}
