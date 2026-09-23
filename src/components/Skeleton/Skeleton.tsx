import styles from './Skeleton.module.css'

type SkeletonProps = {
  width: string
  height: string
  shape?: 'bar' | 'circle'
  delayMs?: number
}

export function Skeleton({ width, height, shape = 'bar', delayMs = 0 }: SkeletonProps) {
  return (
    <span
      className={styles.skeleton}
      data-shape={shape}
      style={{ width, height, animationDelay: `${delayMs}ms` }}
      aria-hidden="true"
    />
  )
}
