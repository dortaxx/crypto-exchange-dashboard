import type { ReactNode } from 'react'
import styles from './AppHeader.module.css'

type AppHeaderProps = {
  status: ReactNode
}

export function AppHeader({ status }: AppHeaderProps) {
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
        <div className={styles.aside}>
          <p className={styles.source}>Binance spot · USDT</p>
          {status}
        </div>
      </div>
    </header>
  )
}
