import { useRef } from 'react'
import { focusAfterRemoval } from '../focusAfterRemoval'
import { TrendIcon } from '../TrendIcon/TrendIcon'
import styles from './AlertList.module.css'

export type AlertView = {
  id: string
  direction: 'up' | 'down'
  message: string
  prices: string
  time: string
}

type AlertListProps = {
  alerts: readonly AlertView[]
  onDismiss: (id: string) => void
}

export function AlertList({ alerts, onDismiss }: AlertListProps) {
  const listRef = useRef<HTMLUListElement>(null)

  return (
    <div aria-live="polite">
      {alerts.length === 0 ? (
        <>
          <p className={styles.empty}>No alerts yet</p>
          <p className={styles.hint}>
            Pairs that move 2% or more since you opened the page, and price targets you set below,
            show up here.
          </p>
        </>
      ) : (
        <ul ref={listRef} className={styles.list}>
          {alerts.map((alert, index) => (
            <li key={alert.id} className={styles.alert} data-direction={alert.direction}>
              <span className={styles.icon}>
                <TrendIcon direction={alert.direction} />
              </span>
              <div className={styles.body}>
                <p className={styles.message}>{alert.message}</p>
                <p className={styles.meta}>
                  {alert.prices} · {alert.time}
                </p>
              </div>
              <button
                type="button"
                className={styles.dismiss}
                data-action="dismiss"
                aria-label={`Dismiss: ${alert.message}`}
                onClick={() => {
                  onDismiss(alert.id)
                  focusAfterRemoval(listRef.current, '[data-action="dismiss"]', index)
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
