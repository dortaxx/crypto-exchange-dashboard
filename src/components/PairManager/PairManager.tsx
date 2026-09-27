import type { Pair } from '../../domain/types'
import { CoinIcon } from '../CoinIcon/CoinIcon'
import styles from './PairManager.module.css'

type PairManagerProps = {
  id: string
  catalog: readonly Pair[]
  tracked: ReadonlySet<string>
  onAdd: (symbol: string) => void
  onRemove: (symbol: string) => void
}

export function PairManager({ id, catalog, tracked, onAdd, onRemove }: PairManagerProps) {
  return (
    <div id={id} className={styles.panel}>
      <div className={styles.head}>
        <p className={styles.title}>Pairs you follow</p>
        <p className={styles.count}>
          {tracked.size} of {catalog.length}
        </p>
      </div>
      <p className={styles.hint}>
        Tap a coin to add or remove it. Prices switch over on the open connection, without
        reconnecting.
      </p>
      <ul className={styles.list}>
        {catalog.map((pair) => {
          const isTracked = tracked.has(pair.symbol)
          const isLast = isTracked && tracked.size === 1
          return (
            <li key={pair.symbol}>
              <button
                type="button"
                className={styles.option}
                aria-pressed={isTracked}
                disabled={isLast}
                title={isLast ? 'Keep at least one pair' : undefined}
                onClick={() => {
                  if (isTracked) onRemove(pair.symbol)
                  else onAdd(pair.symbol)
                }}
              >
                <CoinIcon asset={pair.base} />
                <span className={styles.name}>{pair.name}</span>
                <span className={styles.base}>{pair.base}</span>
                <svg className={styles.mark} viewBox="0 0 16 16" aria-hidden="true">
                  {isTracked ? <path d="m4 8.5 2.5 2.5L12 5.5" /> : <path d="M8 4v8M4 8h8" />}
                </svg>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
