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
  waitingTargets: number
  alertAtPercent: number
  onDismiss: (id: string) => void
}

export function AlertList({ alerts, waitingTargets, alertAtPercent, onDismiss }: AlertListProps) {
  return (
    <div aria-live="polite">
      {alerts.length === 0 ? (
        <>
          <p className={styles.empty}>No alerts yet</p>
          <p className={styles.hint}>
            {waitingTargets > 0
              ? `${waitingTargets} price ${waitingTargets === 1 ? 'target is' : 'targets are'} waiting. Alerts appear here when a target is reached, or when a pair moves ${alertAtPercent}% since you opened the page.`
              : `Pairs that move ${alertAtPercent}% or more since you opened the page, and price targets you set below, show up here.`}
          </p>
        </>
      ) : (
        <ul className={styles.list}>
          {alerts.map((alert) => (
            <li key={alert.id} className={styles.alert} data-direction={alert.direction}>
              <span className={styles.icon}>
                <TrendIcon direction={alert.direction} />
              </span>
              <div>
                <p className={styles.message}>{alert.message}</p>
                <p className={styles.meta}>
                  {alert.prices} · {alert.time}
                </p>
              </div>
              <button
                type="button"
                className={styles.dismiss}
                aria-label={`Dismiss: ${alert.message}`}
                onClick={() => {
                  onDismiss(alert.id)
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
