import type { Pair } from '../../domain/types'
import { CoinIcon } from '../CoinIcon/CoinIcon'
import styles from './HiddenPairsPanel.module.css'

type HiddenPairsPanelProps = {
  id: string
  pairs: readonly Pair[]
  onRestore: (symbol: string) => void
  onRestoreAll: () => void
}

export function HiddenPairsPanel({ id, pairs, onRestore, onRestoreAll }: HiddenPairsPanelProps) {
  return (
    <div id={id} className={styles.panel}>
      <div className={styles.head}>
        <p className={styles.title}>Hidden pairs</p>
        <button type="button" className={styles.link} onClick={onRestoreAll}>
          Restore all
        </button>
      </div>
      <ul className={styles.list}>
        {pairs.map((pair) => (
          <li key={pair.symbol} className={styles.item}>
            <CoinIcon asset={pair.base} />
            <span className={styles.name}>{pair.name}</span>
            <span className={styles.base}>{pair.base}</span>
            <button
              type="button"
              className={styles.restore}
              aria-label={`Restore ${pair.name}`}
              onClick={() => {
                onRestore(pair.symbol)
              }}
            >
              Restore
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
