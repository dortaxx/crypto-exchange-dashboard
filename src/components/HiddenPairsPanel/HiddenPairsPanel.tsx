import { useRef } from 'react'
import type { Pair } from '../../domain/types'
import { CoinIcon } from '../CoinIcon/CoinIcon'
import { focusAfterRemoval, refocus } from '../focusAfterRemoval'
import styles from './HiddenPairsPanel.module.css'

type HiddenPairsPanelProps = {
  id: string
  pairs: readonly Pair[]
  onRestore: (symbol: string) => void
  onRestoreAll: () => void
  fallbackFocusId: string
}

export function HiddenPairsPanel({
  id,
  pairs,
  onRestore,
  onRestoreAll,
  fallbackFocusId,
}: HiddenPairsPanelProps) {
  const listRef = useRef<HTMLUListElement>(null)

  return (
    <div id={id} className={styles.panel}>
      <div className={styles.head}>
        <p className={styles.title}>Hidden pairs</p>
        <button
          type="button"
          className={styles.link}
          onClick={() => {
            onRestoreAll()
            refocus(document.getElementById(fallbackFocusId))
          }}
        >
          Restore all
        </button>
      </div>
      <ul ref={listRef} className={styles.list}>
        {pairs.map((pair, index) => (
          <li key={pair.symbol} className={styles.item}>
            <CoinIcon asset={pair.base} />
            <span className={styles.name}>{pair.name}</span>
            <span className={styles.base}>{pair.base}</span>
            <button
              type="button"
              className={styles.restore}
              aria-label={`Restore ${pair.name}`}
              data-action="restore"
              onClick={() => {
                onRestore(pair.symbol)
                focusAfterRemoval(
                  listRef.current,
                  '[data-action="restore"]',
                  index,
                  document.getElementById(fallbackFocusId),
                )
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
