import { useId } from 'react'
import { CoinSelect, type CoinOption } from '../CoinSelect/CoinSelect'
import styles from './Converter.module.css'

type ConverterProps = {
  assets: readonly CoinOption[]
  from: string
  to: string
  amount: string
  result: string | null
  message: string | null
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
  message,
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
              placeholder="0.00"
              value={amount}
              aria-invalid={message !== null}
              aria-describedby={noteId}
              onChange={(event) => {
                onAmountChange(event.target.value)
              }}
            />
          </label>
          <CoinSelect label="Convert from" value={from} options={assets} onChange={onFromChange} />
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
          <CoinSelect label="Convert to" value={to} options={assets} onChange={onToChange} />
        </div>
      </div>

      <p id={noteId} className={styles.error}>
        {message}
      </p>
    </div>
  )
}
