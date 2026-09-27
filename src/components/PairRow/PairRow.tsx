import { roundPercent } from '../../domain/alertCheck'
import { formatPercent, formatPrice } from '../../domain/format'
import type { Pair, PairPrice } from '../../domain/types'
import { CoinIcon } from '../CoinIcon/CoinIcon'
import { Skeleton } from '../Skeleton/Skeleton'
import { Sparkline } from '../Sparkline/Sparkline'
import { TrendIcon } from '../TrendIcon/TrendIcon'
import styles from './PairRow.module.css'

type PairRowProps = {
  pair: Pair
  price: PairPrice | undefined
  isFavorite: boolean
  loadingDelayMs: number
  onToggleFavorite: (symbol: string) => void
  onHide: (symbol: string) => void
}

function trendOf(changePercent: number): 'up' | 'down' | 'flat' {
  const shown = roundPercent(changePercent)
  if (shown > 0) return 'up'
  if (shown < 0) return 'down'
  return 'flat'
}

export function PairRow({
  pair,
  price,
  isFavorite,
  loadingDelayMs,
  onToggleFavorite,
  onHide,
}: PairRowProps) {
  const trend = price === undefined ? 'flat' : trendOf(price.changePercent)

  return (
    <tr className={styles.row}>
      <th scope="row" className={styles.asset}>
        <span className={styles.assetInner}>
          <button
            type="button"
            className={styles.star}
            aria-pressed={isFavorite}
            aria-label={
              isFavorite ? `Remove ${pair.name} from favorites` : `Add ${pair.name} to favorites`
            }
            onClick={() => {
              onToggleFavorite(pair.symbol)
            }}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M8 1.9 9.85 5.7l4.15.6-3 2.95.7 4.15L8 11.45 4.3 13.4l.7-4.15-3-2.95 4.15-.6Z" />
            </svg>
          </button>
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
        {price === undefined || price.history.length < 2 ? (
          <Skeleton width="5rem" height="1.5rem" delayMs={loadingDelayMs} />
        ) : (
          <Sparkline values={price.history} label={`${pair.name} price trend this session`} />
        )}
      </td>
      <td className={styles.actions}>
        <button
          type="button"
          className={styles.hide}
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
