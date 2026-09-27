import type { Pair } from '../../domain/types'
import { CoinIcon } from '../CoinIcon/CoinIcon'
import styles from './PairSwitcher.module.css'

type PairSwitcherProps = {
  pairs: readonly Pair[]
  selected: string
  onSelect: (symbol: string) => void
}

export function PairSwitcher({ pairs, selected, onSelect }: PairSwitcherProps) {
  return (
    <div className={styles.switcher} role="group" aria-label="Pair to chart">
      {pairs.map((pair) => (
        <button
          key={pair.symbol}
          type="button"
          className={styles.option}
          aria-pressed={pair.symbol === selected}
          onClick={() => {
            onSelect(pair.symbol)
          }}
        >
          <CoinIcon asset={pair.base} />
          {pair.base}
        </button>
      ))}
    </div>
  )
}
