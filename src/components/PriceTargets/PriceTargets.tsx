import { useId } from 'react'
import { targetVerb } from '../../domain/targets'
import { CoinSelect, type CoinOption } from '../CoinSelect/CoinSelect'
import { TrendIcon } from '../TrendIcon/TrendIcon'
import styles from './PriceTargets.module.css'

export type TargetView = {
  id: string
  asset: string
  direction: 'up' | 'down'
  price: string
}

type PriceTargetsProps = {
  assets: readonly CoinOption[]
  asset: string
  value: string
  note: string
  invalid: boolean
  canAdd: boolean
  targets: readonly TargetView[]
  onAssetChange: (code: string) => void
  onValueChange: (value: string) => void
  onAdd: () => void
  onRemove: (id: string) => void
}

export function PriceTargets({
  assets,
  asset,
  value,
  note,
  invalid,
  canAdd,
  targets,
  onAssetChange,
  onValueChange,
  onAdd,
  onRemove,
}: PriceTargetsProps) {
  const inputId = useId()
  const noteId = useId()

  return (
    <div className={styles.targets}>
      <h3 className={styles.title}>Price targets</h3>
      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault()
          if (canAdd) onAdd()
        }}
      >
        <div className={styles.row}>
          <label className={styles.field} htmlFor={inputId}>
            <span className={styles.caption}>Alert me at (USDT)</span>
            <input
              id={inputId}
              className={styles.input}
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="0.00"
              value={value}
              aria-invalid={invalid}
              aria-describedby={noteId}
              onChange={(event) => {
                onValueChange(event.target.value)
              }}
            />
          </label>
          <CoinSelect label="Target coin" value={asset} options={assets} onChange={onAssetChange} />
        </div>
        <div className={styles.footer}>
          <p id={noteId} className={invalid ? styles.error : styles.note}>
            {note}
          </p>
          <button type="submit" className={styles.add} disabled={!canAdd}>
            Add target
          </button>
        </div>
      </form>

      {targets.length > 0 && (
        <ul className={styles.list} aria-label="Price targets">
          {targets.map((target) => (
            <li key={target.id} className={styles.item} data-direction={target.direction}>
              <TrendIcon direction={target.direction} />
              <span className={styles.text}>
                <strong>{target.asset}</strong> {targetVerb(target.direction)}{' '}
                <span className={styles.figure}>{target.price}</span>
              </span>
              <button
                type="button"
                className={styles.remove}
                aria-label={`Remove target: ${target.asset} ${targetVerb(target.direction)} ${target.price}`}
                onClick={() => {
                  onRemove(target.id)
                }}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
