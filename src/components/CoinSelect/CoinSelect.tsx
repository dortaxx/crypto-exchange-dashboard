import styles from './CoinSelect.module.css'

export type CoinOption = {
  code: string
  name: string
}

type CoinSelectProps = {
  label: string
  value: string
  options: readonly CoinOption[]
  onChange: (code: string) => void
}

export function CoinSelect({ label, value, options, onChange }: CoinSelectProps) {
  return (
    <select
      className={styles.select}
      aria-label={label}
      value={value}
      onChange={(event) => {
        onChange(event.target.value)
      }}
    >
      {options.map((option) => (
        <option key={option.code} value={option.code}>
          {option.code}
        </option>
      ))}
    </select>
  )
}
