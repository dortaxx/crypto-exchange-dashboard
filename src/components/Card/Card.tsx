import type { ReactNode } from 'react'
import styles from './Card.module.css'

type CardProps = {
  titleId: string
  title: string
  children: ReactNode
}

export function Card({ titleId, title, children }: CardProps) {
  return (
    <section className={styles.card} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.title}>
        {title}
      </h2>
      {children}
    </section>
  )
}
