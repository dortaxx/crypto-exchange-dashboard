import styles from './SectionHeading.module.css'

type SectionHeadingProps = {
  id: string
  title: string
}

export function SectionHeading({ id, title }: SectionHeadingProps) {
  return (
    <h2 id={id} className={styles.heading}>
      {title}
    </h2>
  )
}
