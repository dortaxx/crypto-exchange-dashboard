import { Skeleton } from '../Skeleton/Skeleton'
import styles from './PairListSkeleton.module.css'

type PairListSkeletonProps = {
  rows: number
}

export function PairListSkeleton({ rows }: PairListSkeletonProps) {
  return (
    <div className={styles.table}>
      <p className="visually-hidden" role="status">
        Loading prices from Binance
      </p>
      <div className={styles.header} aria-hidden="true">
        <span>Asset</span>
        <span className={styles.numeric}>Price</span>
        <span className={styles.numeric}>Since open</span>
        <span className={styles.trend}>Trend</span>
      </div>
      {Array.from({ length: rows }, (_, index) => {
        const delayMs = index * 120
        return (
          <div key={index} className={styles.row} aria-hidden="true">
            <span className={styles.asset}>
              <Skeleton shape="circle" width="1.75rem" height="1.75rem" delayMs={delayMs} />
              <Skeleton width="7rem" height="0.875rem" delayMs={delayMs} />
            </span>
            <span className={styles.numeric}>
              <Skeleton width="5.5rem" height="0.875rem" delayMs={delayMs} />
            </span>
            <span className={styles.numeric}>
              <Skeleton width="3.5rem" height="0.875rem" delayMs={delayMs} />
            </span>
            <span className={styles.trend}>
              <Skeleton width="5rem" height="1.5rem" delayMs={delayMs} />
            </span>
          </div>
        )
      })}
    </div>
  )
}
