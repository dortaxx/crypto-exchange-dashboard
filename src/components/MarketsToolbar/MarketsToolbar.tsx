import type { ViewMode } from '../../domain/types'
import styles from './MarketsToolbar.module.css'

type MarketsToolbarProps = {
  view: ViewMode
  favoriteCount: number
  hiddenCount: number
  hiddenOpen: boolean
  hiddenPanelId: string
  onViewChange: (view: ViewMode) => void
  onToggleHidden: () => void
}

export function MarketsToolbar({
  view,
  favoriteCount,
  hiddenCount,
  hiddenOpen,
  hiddenPanelId,
  onViewChange,
  onToggleHidden,
}: MarketsToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.tabs} role="group" aria-label="Show">
        <button
          type="button"
          className={styles.tab}
          aria-pressed={view === 'all'}
          onClick={() => {
            onViewChange('all')
          }}
        >
          All
        </button>
        <button
          type="button"
          className={styles.tab}
          aria-pressed={view === 'favorites'}
          onClick={() => {
            onViewChange('favorites')
          }}
        >
          Favorites
          {favoriteCount > 0 && <span className={styles.count}>{favoriteCount}</span>}
        </button>
      </div>

      {hiddenCount > 0 && (
        <button
          type="button"
          className={styles.hiddenToggle}
          aria-expanded={hiddenOpen}
          aria-controls={hiddenPanelId}
          onClick={onToggleHidden}
        >
          Hidden ({hiddenCount})
        </button>
      )}
    </div>
  )
}
