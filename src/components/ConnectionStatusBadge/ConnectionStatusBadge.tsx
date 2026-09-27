import { useRef } from 'react'
import type { ConnectionState } from '../../domain/types'
import { focusAfterRemoval } from '../focusAfterRemoval'
import styles from './ConnectionStatusBadge.module.css'
import { describeConnection } from './describeConnection'

type ConnectionStatusBadgeProps = {
  connection: ConnectionState
  onRetry: () => void
}

export function ConnectionStatusBadge({ connection, onRetry }: ConnectionStatusBadgeProps) {
  const { label, tone } = describeConnection(connection)
  const statusRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={statusRef} className={styles.status} data-tone={tone} tabIndex={-1}>
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
        <button
          type="button"
          className={styles.retry}
          onClick={() => {
            onRetry()
            focusAfterRemoval(null, '', 0, statusRef.current)
          }}
        >
          Retry
        </button>
      )}
    </div>
  )
}
