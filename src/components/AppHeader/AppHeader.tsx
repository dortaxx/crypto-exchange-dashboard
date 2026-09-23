import styles from './AppHeader.module.css'

export function AppHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <p className={styles.name}>
          <svg className={styles.mark} viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="8" />
            <polyline points="7,20 13,14 18,17 25,10" />
          </svg>
          Crypto Dashboard
        </p>
        <p className={styles.source}>Binance spot · USDT</p>
      </div>
    </header>
  )
}
