import styles from './Skeleton.module.css'

type SkeletonProps = {
  width: string
  height: string
  delayMs?: number
}

export function Skeleton({ width, height, delayMs = 0 }: SkeletonProps) {
  return (
    <span
      className={styles.skeleton}
      style={{ width, height, animationDelay: `${delayMs}ms` }}
      aria-hidden="true"
    />
  )
}
