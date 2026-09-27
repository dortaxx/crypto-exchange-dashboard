import styles from './TrendIcon.module.css'

type TrendIconProps = {
  direction: 'up' | 'down'
}

export function TrendIcon({ direction }: TrendIconProps) {
  return (
    <svg
      className={styles.icon}
      data-direction={direction}
      viewBox="0 0 12 12"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M6 2.75 10 9.25H2Z" />
    </svg>
  )
}
