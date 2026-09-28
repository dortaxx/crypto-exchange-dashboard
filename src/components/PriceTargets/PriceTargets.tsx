import { useId, useRef } from 'react'
import { targetVerb } from '../../domain/targets'
import { AssetPicker, type AssetOption } from '../AssetPicker/AssetPicker'
import { focusAfterRemoval } from '../focusAfterRemoval'
import { TrendIcon } from '../TrendIcon/TrendIcon'
import styles from './PriceTargets.module.css'

export type NoteTone = 'info' | 'warning' | 'error'

export type TargetView = {
  id: string
  asset: string
  direction: 'up' | 'down'
  price: string
}

type PriceTargetsProps = {
  assets: readonly AssetOption[]
  asset: string
  value: string
  note: string
  tone: NoteTone
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
  tone,
  canAdd,
  targets,
  onAssetChange,
  onValueChange,
  onAdd,
  onRemove,
}: PriceTargetsProps) {
  const inputId = useId()
  const noteId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

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
              ref={inputRef}
              id={inputId}
              className={styles.input}
              type="text"
              inputMode="decimal"
              autoComplete="off"
              spellCheck={false}
              placeholder="0.00"
              value={value}
              aria-invalid={tone === 'error'}
              aria-describedby={noteId}
              onChange={(event) => {
                onValueChange(event.target.value)
              }}
            />
          </label>
          <AssetPicker label="Target coin" value={asset} assets={assets} onChange={onAssetChange} />
        </div>
        <div className={styles.footer}>
          <p id={noteId} className={styles.note} data-tone={tone}>
            {note}
          </p>
          <p className="visually-hidden" role="status">
            {tone === 'info' ? '' : note}
          </p>
          <button type="submit" className={styles.add} disabled={!canAdd}>
            Add target
          </button>
        </div>
      </form>

      {targets.length > 0 && (
        <ul ref={listRef} className={styles.list} aria-label="Waiting price targets">
          {targets.map((target, index) => (
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
                data-action="remove-target"
                onClick={() => {
                  onRemove(target.id)
                  focusAfterRemoval(
                    listRef.current,
                    '[data-action="remove-target"]',
                    index,
                    inputRef.current,
                  )
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
