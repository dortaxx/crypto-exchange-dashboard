import type { ConnectionState } from '../../domain/types'
import styles from './ConnectionStatusBadge.module.css'
import { describeConnection } from './describeConnection'

type ConnectionStatusBadgeProps = {
  connection: ConnectionState
  onRetry: () => void
}

export function ConnectionStatusBadge({ connection, onRetry }: ConnectionStatusBadgeProps) {
  const { label, tone } = describeConnection(connection)

  return (
    <div className={styles.status} data-tone={tone}>
      <span className={styles.signal} aria-hidden="true">
        <span className={styles.bar} />
        <span className={styles.bar} />
        <span className={styles.bar} />
      </span>
      <span
        role="status"
        className={styles.label}
        title={connection.status === 'error' ? connection.message : label}
      >
        {label}
      </span>
      {connection.status === 'error' && (
        <button type="button" className={styles.retry} onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  )
}
