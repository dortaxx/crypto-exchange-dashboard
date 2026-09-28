import { useId, useState, type ComponentProps } from 'react'
import { EmptyState } from '../components/EmptyState/EmptyState'
import { HiddenPairsPanel } from '../components/HiddenPairsPanel/HiddenPairsPanel'
import { MarketsToolbar } from '../components/MarketsToolbar/MarketsToolbar'
import { PairManager } from '../components/PairManager/PairManager'
import { PairTable } from '../components/PairTable/PairTable'
import { SectionHeading } from '../components/SectionHeading/SectionHeading'
import { PAIR_CATALOG } from '../config/pairs'
import { matchesSearch } from '../domain/search'
import { sortPairs } from '../domain/sortPairs'
import type { Pair } from '../domain/types'
import { visiblePairs } from '../domain/visiblePairs'
import { useMarketStore } from '../store/marketStore'
import { usePreferencesStore } from '../store/preferencesStore'

type MarketsContainerProps = {
  pairs: readonly Pair[]
}

type Panel = 'hidden' | 'pairs' | null

export function MarketsContainer({ pairs }: MarketsContainerProps) {
  const prices = useMarketStore((state) => state.prices)
  const unavailable = useMarketStore((state) => state.connection.status === 'error')
  const favorites = usePreferencesStore((state) => state.favorites)
  const hidden = usePreferencesStore((state) => state.hidden)
  const view = usePreferencesStore((state) => state.view)
  const sortKey = usePreferencesStore((state) => state.sortKey)
  const sortDirection = usePreferencesStore((state) => state.sortDirection)
  const toggleFavorite = usePreferencesStore((state) => state.toggleFavorite)
  const toggleHidden = usePreferencesStore((state) => state.toggleHidden)
  const setView = usePreferencesStore((state) => state.setView)
  const setSort = usePreferencesStore((state) => state.setSort)
  const restoreAll = usePreferencesStore((state) => state.restoreAll)
  const addPair = usePreferencesStore((state) => state.addPair)
  const removePair = usePreferencesStore((state) => state.removePair)
  const [panel, setPanel] = useState<Panel>(null)
  const [query, setQuery] = useState('')
  const hiddenPanelId = useId()
  const pairsPanelId = useId()

  const shown = visiblePairs(pairs, { hidden, favorites, view })
  const rows = sortPairs(
    shown.filter((pair) => matchesSearch(pair, query)),
    prices,
    sortKey,
    sortDirection,
  )
  const hiddenPairs = pairs.filter((pair) => hidden.includes(pair.symbol))

  const togglePanel = (next: Exclude<Panel, null>) => {
    setPanel((current) => (current === next ? null : next))
  }

  let empty: ComponentProps<typeof EmptyState> | null = null
  if (shown.length === 0 && view === 'favorites') {
    empty = {
      title: 'No favorites to show',
      message: 'Tap the star next to a coin to add it here.',
      action: { label: 'Show all pairs', onClick: () => setView('all') },
    }
  } else if (shown.length === 0) {
    empty = {
      title: 'All pairs are hidden',
      message: 'Restore a pair to see its price here again.',
      action: { label: 'Show hidden pairs', onClick: () => setPanel('hidden') },
    }
  } else if (rows.length === 0) {
    empty = {
      title: `No pairs match “${query.trim()}”`,
      message: 'Try a coin name like Bitcoin or a symbol like BTC.',
      action: { label: 'Clear search', onClick: () => setQuery('') },
    }
  }

  return (
    <section aria-labelledby="markets-heading">
      <SectionHeading id="markets-heading" title="Markets" />
      <MarketsToolbar
        view={view}
        favoriteCount={favorites.length}
        hiddenCount={hiddenPairs.length}
        hiddenOpen={panel === 'hidden'}
        hiddenPanelId={hiddenPanelId}
        pairsOpen={panel === 'pairs'}
        pairsPanelId={pairsPanelId}
        query={query}
        onViewChange={setView}
        onToggleHidden={() => {
          togglePanel('hidden')
        }}
        onTogglePairs={() => {
          togglePanel('pairs')
        }}
        onQueryChange={setQuery}
      />
      {panel === 'hidden' && hiddenPairs.length > 0 && (
        <HiddenPairsPanel
          id={hiddenPanelId}
          pairs={hiddenPairs}
          onRestore={(symbol) => {
            toggleHidden(symbol)
            if (hiddenPairs.length === 1) setPanel(null)
          }}
          onRestoreAll={() => {
            restoreAll()
            setPanel(null)
          }}
        />
      )}
      {panel === 'pairs' && (
        <PairManager
          id={pairsPanelId}
          catalog={PAIR_CATALOG}
          tracked={new Set(pairs.map((pair) => pair.symbol))}
          onAdd={addPair}
          onRemove={removePair}
        />
      )}
      {empty === null ? (
        <PairTable
          pairs={rows}
          prices={prices}
          unavailable={unavailable}
          favorites={new Set(favorites)}
          onToggleFavorite={toggleFavorite}
          onHide={toggleHidden}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSort={setSort}
        />
      ) : (
        <EmptyState {...empty} />
      )}
    </section>
  )
}
