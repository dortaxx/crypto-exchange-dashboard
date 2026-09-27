import type { ReactNode } from 'react'
import styles from './Card.module.css'

type CardProps = {
  titleId: string
  title: string
  children: ReactNode
  className?: string
}

export function Card({ titleId, title, children, className }: CardProps) {
  return (
    <section
      className={className ? `${styles.card} ${className}` : styles.card}
      aria-labelledby={titleId}
    >
      <h2 id={titleId} className={styles.title}>
        {title}
      </h2>
      {children}
    </section>
  )
}
