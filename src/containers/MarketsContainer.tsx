import { useId, useState } from 'react'
import { EmptyState } from '../components/EmptyState/EmptyState'
import { HiddenPairsPanel } from '../components/HiddenPairsPanel/HiddenPairsPanel'
import { MarketsToolbar } from '../components/MarketsToolbar/MarketsToolbar'
import { PairTable } from '../components/PairTable/PairTable'
import { SectionHeading } from '../components/SectionHeading/SectionHeading'
import type { Pair } from '../domain/types'
import { matchesSearch } from '../domain/search'
import { sortPairs } from '../domain/sortPairs'
import { visiblePairs } from '../domain/visiblePairs'
import { useMarketStore } from '../store/marketStore'
import { usePreferencesStore } from '../store/preferencesStore'

type MarketsContainerProps = {
  pairs: readonly Pair[]
}

export function MarketsContainer({ pairs }: MarketsContainerProps) {
  const prices = useMarketStore((state) => state.prices)
  const status = useMarketStore((state) => state.snapshotStatus)
  const favorites = usePreferencesStore((state) => state.favorites)
  const hidden = usePreferencesStore((state) => state.hidden)
  const view = usePreferencesStore((state) => state.view)
  const toggleFavorite = usePreferencesStore((state) => state.toggleFavorite)
  const toggleHidden = usePreferencesStore((state) => state.toggleHidden)
  const setView = usePreferencesStore((state) => state.setView)
  const restoreAll = usePreferencesStore((state) => state.restoreAll)
  const sortKey = usePreferencesStore((state) => state.sortKey)
  const sortDirection = usePreferencesStore((state) => state.sortDirection)
  const setSort = usePreferencesStore((state) => state.setSort)
  const [hiddenOpen, setHiddenOpen] = useState(false)
  const [query, setQuery] = useState('')
  const hiddenPanelId = useId()

  const shown = visiblePairs(pairs, { hidden, favorites, view })
  const matching = shown.filter((pair) => matchesSearch(pair, query))
  const rows = sortPairs(matching, prices, sortKey, sortDirection)
  const hiddenPairs = pairs.filter((pair) => hidden.includes(pair.symbol))
  const searching = query.trim() !== ''
  const hiddenMatches = searching ? hiddenPairs.filter((pair) => matchesSearch(pair, query)) : []

  const empty =
    rows.length > 0
      ? null
      : shown.length > 0
        ? {
            title: `No ${view === 'favorites' ? 'favorites' : 'pairs'} match “${query.trim()}”`,
            message:
              hiddenMatches.length > 0
                ? `Hidden: ${hiddenMatches.map((pair) => pair.name).join(', ')}. Restore ${hiddenMatches.length === 1 ? 'it' : 'them'} from the Hidden list to see ${hiddenMatches.length === 1 ? 'it' : 'them'} here.`
                : 'Try a coin name like Bitcoin or a symbol like BTC.',
            action: { label: 'Clear search', onClick: () => setQuery('') },
          }
        : view === 'favorites'
          ? {
              title: 'No favorites to show',
              message: 'Tap the star next to a coin to pin it to this list.',
              action: { label: 'Show all pairs', onClick: () => setView('all') },
            }
          : {
              title: 'All pairs are hidden',
              message: 'Restore a pair to see its live price here again.',
              action: { label: 'Show hidden pairs', onClick: () => setHiddenOpen(true) },
            }

  return (
    <section aria-labelledby="markets-heading">
      <SectionHeading id="markets-heading" title="Markets" />
      <MarketsToolbar
        view={view}
        favoriteCount={favorites.length}
        hiddenCount={hiddenPairs.length}
        hiddenOpen={hiddenOpen}
        hiddenPanelId={hiddenPanelId}
        query={query}
        onViewChange={setView}
        onQueryChange={setQuery}
        onToggleHidden={() => {
          setHiddenOpen((open) => !open)
        }}
      />
      {hiddenOpen && hiddenPairs.length > 0 && (
        <HiddenPairsPanel
          id={hiddenPanelId}
          pairs={hiddenPairs}
          onRestore={toggleHidden}
          onRestoreAll={restoreAll}
        />
      )}
      {empty === null ? (
        <PairTable
          pairs={rows}
          prices={prices}
          status={status}
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
      <p className="visually-hidden" role="status">
        {searching && `${rows.length} ${rows.length === 1 ? 'pair' : 'pairs'} found`}
      </p>
    </section>
  )
}
