import { COIN_ICONS } from './coinIcons'
import styles from './CoinIcon.module.css'

type CoinIconProps = {
  asset: string
}

export function CoinIcon({ asset }: CoinIconProps) {
  const src = COIN_ICONS[asset]

  if (src === undefined) {
    return (
      <span className={styles.fallback} aria-hidden="true">
        {asset.charAt(0)}
      </span>
    )
  }

  return <img className={styles.icon} src={src} alt="" width={28} height={28} />
}
