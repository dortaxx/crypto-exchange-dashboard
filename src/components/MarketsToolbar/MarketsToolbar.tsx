import type { ViewMode } from '../../domain/types'
import styles from './MarketsToolbar.module.css'

type MarketsToolbarProps = {
  view: ViewMode
  favoriteCount: number
  hiddenCount: number
  hiddenOpen: boolean
  hiddenPanelId: string
  pairsOpen: boolean
  pairsPanelId: string
  query: string
  onViewChange: (view: ViewMode) => void
  onToggleHidden: () => void
  onTogglePairs: () => void
  onQueryChange: (query: string) => void
}

export function MarketsToolbar({
  view,
  favoriteCount,
  hiddenCount,
  hiddenOpen,
  hiddenPanelId,
  pairsOpen,
  pairsPanelId,
  query,
  onViewChange,
  onToggleHidden,
  onTogglePairs,
  onQueryChange,
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

      <label className={styles.search}>
        <svg className={styles.searchIcon} viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="7" cy="7" r="4.75" />
          <path d="m10.5 10.5 3 3" />
        </svg>
        <span className="visually-hidden">Search pairs</span>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Search name or symbol"
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(event) => {
            onQueryChange(event.target.value)
          }}
        />
      </label>

      <div className={styles.actions}>
        {hiddenCount > 0 && (
          <button
            type="button"
            className={styles.panelToggle}
            aria-expanded={hiddenOpen}
            aria-controls={hiddenPanelId}
            onClick={onToggleHidden}
          >
            Hidden ({hiddenCount})
          </button>
        )}
        <button
          type="button"
          className={styles.panelToggle}
          aria-expanded={pairsOpen}
          aria-controls={pairsPanelId}
          onClick={onTogglePairs}
        >
          Edit pairs
        </button>
      </div>
    </div>
  )
}
