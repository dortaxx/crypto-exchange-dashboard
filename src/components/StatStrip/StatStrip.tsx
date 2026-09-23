import { Skeleton } from '../Skeleton/Skeleton'
import styles from './StatStrip.module.css'

type Stat = {
  label: string
  value?: string
}

type StatStripProps = {
  stats: Stat[]
}

export function StatStrip({ stats }: StatStripProps) {
  return (
    <dl className={styles.strip}>
      {stats.map((stat) => (
        <div key={stat.label} className={styles.stat}>
          <dt className={styles.label}>{stat.label}</dt>
          <dd className={styles.value}>
            {stat.value ?? (
              <>
                <Skeleton width="5.5rem" height="1.25rem" />
                <span className="visually-hidden">Loading</span>
              </>
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}
