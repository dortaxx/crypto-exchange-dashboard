import styles from './EmptyState.module.css'

type EmptyStateProps = {
  title: string
  message: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <div className={styles.empty} role="status">
      <p className={styles.title}>{title}</p>
      <p className={styles.message}>{message}</p>
      {action && (
        <button type="button" className={styles.action} onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  )
}
