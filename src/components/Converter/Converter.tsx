import { useId } from 'react'
import { AssetPicker, type AssetOption } from '../AssetPicker/AssetPicker'
import styles from './Converter.module.css'

export type { AssetOption }

export type QuickAmount = {
  label: string
  value: string
}

type ConverterProps = {
  assets: readonly AssetOption[]
  from: string
  to: string
  amount: string
  result: string | null
  rate: string | null
  message: string | null
  quickAmounts: readonly QuickAmount[]
  onAmountChange: (value: string) => void
  onFromChange: (code: string) => void
  onToChange: (code: string) => void
  onSwap: () => void
}

export function Converter({
  assets,
  from,
  to,
  amount,
  result,
  rate,
  message,
  quickAmounts,
  onAmountChange,
  onFromChange,
  onToChange,
  onSwap,
}: ConverterProps) {
  const inputId = useId()
  const noteId = useId()

  return (
    <div className={styles.converter}>
      <div className={styles.fields}>
        <div className={styles.row}>
          <label className={styles.field} htmlFor={inputId}>
            <span className={styles.caption}>You convert</span>
            <input
              id={inputId}
              className={styles.amount}
              type="text"
              inputMode="decimal"
              autoComplete="off"
              spellCheck={false}
              placeholder="0.00"
              value={amount}
              aria-invalid={message !== null}
              aria-describedby={noteId}
              onChange={(event) => {
                onAmountChange(event.target.value)
              }}
            />
          </label>
          <AssetPicker label="Convert from" value={from} assets={assets} onChange={onFromChange} />
        </div>

        <button type="button" className={styles.swap} aria-label="Swap currencies" onClick={onSwap}>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M5 2.5v10M5 12.5 2.5 10M5 12.5 7.5 10M11 13.5v-10M11 3.5 8.5 6M11 3.5 13.5 6" />
          </svg>
        </button>

        <div className={styles.row}>
          <div className={styles.field}>
            <span className={styles.caption}>You get</span>
            <span className={styles.result}>{result ?? '—'}</span>
          </div>
          <AssetPicker label="Convert to" value={to} assets={assets} onChange={onToChange} />
        </div>
      </div>

      <p id={noteId} className={message === null ? styles.note : styles.error}>
        <svg className={styles.info} viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="8" cy="8" r="6.5" />
          <path d="M8 7.25v4M8 4.75v.01" />
        </svg>
        {message ?? rate ?? 'Waiting for prices…'}
      </p>
      <p className="visually-hidden" role="status">
        {message ?? ''}
      </p>

      <div className={styles.chips} role="group" aria-label="Quick amounts">
        {quickAmounts.map((quick) => (
          <button
            key={quick.value}
            type="button"
            className={styles.chip}
            aria-pressed={amount === quick.value}
            onClick={() => {
              onAmountChange(quick.value)
            }}
          >
            {quick.label}
          </button>
        ))}
      </div>
    </div>
  )
}
