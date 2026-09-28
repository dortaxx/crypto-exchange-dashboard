import { useId, useState, type ComponentProps } from 'react'
import { EmptyState } from '../components/EmptyState/EmptyState'
import { refocus } from '../components/focusAfterRemoval'
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
type EmptyStateProps = ComponentProps<typeof EmptyState>

export function MarketsContainer({ pairs }: MarketsContainerProps) {
  const prices = useMarketStore((state) => state.prices)
  const status = useMarketStore((state) => state.snapshotStatus)
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
  const pairsToggleId = useId()
  const searchId = useId()

  const tracked = new Set(pairs.map((pair) => pair.symbol))
  const shown = visiblePairs(pairs, { hidden, favorites, view })
  const rows = sortPairs(
    shown.filter((pair) => matchesSearch(pair, query)),
    prices,
    sortKey,
    sortDirection,
  )
  const hiddenPairs = pairs.filter((pair) => hidden.includes(pair.symbol))
  const searching = query.trim() !== ''

  const togglePanel = (next: Exclude<Panel, null>) => {
    setPanel((current) => (current === next ? null : next))
  }

  const emptyState = (): EmptyStateProps | null => {
    if (rows.length > 0) return null
    if (
      shown.length === 0 &&
      view === 'favorites' &&
      favorites.some((symbol) => hidden.includes(symbol))
    ) {
      return {
        title: 'Your favorites are hidden',
        message: 'Restore them to see their live prices here.',
        action: { label: 'Show hidden pairs', onClick: () => setPanel('hidden') },
      }
    }
    if (shown.length === 0 && view === 'favorites') {
      return {
        title: 'No favorites to show',
        message: 'Tap the star next to a coin to pin it to this list.',
        action: { label: 'Show all pairs', onClick: () => setView('all') },
      }
    }
    if (shown.length === 0) {
      return {
        title: 'All pairs are hidden',
        message: 'Restore a pair to see its live price here again.',
        action: { label: 'Show hidden pairs', onClick: () => setPanel('hidden') },
      }
    }

    const title = `No ${view === 'favorites' ? 'favorites' : 'pairs'} match “${query.trim()}”`
    const hiddenMatches = hiddenPairs.filter(
      (pair) => matchesSearch(pair, query) && (view === 'all' || favorites.includes(pair.symbol)),
    )
    if (hiddenMatches.length > 0) {
      return {
        title,
        message: `Hidden: ${hiddenMatches.map((pair) => pair.name).join(', ')}.`,
        action: { label: 'Show hidden pairs', onClick: () => setPanel('hidden') },
      }
    }
    const notFavorite = pairs.find(
      (pair) => !favorites.includes(pair.symbol) && matchesSearch(pair, query),
    )
    if (notFavorite && view === 'favorites') {
      return {
        title,
        message: `${notFavorite.name} isn’t in your favorites.`,
        action: { label: 'Show all pairs', onClick: () => setView('all') },
      }
    }
    const suggestion = PAIR_CATALOG.find(
      (pair) => !tracked.has(pair.symbol) && matchesSearch(pair, query),
    )
    if (suggestion && view === 'all') {
      return {
        title,
        message: `${suggestion.name} (${suggestion.base}) isn’t on your list yet.`,
        action: { label: `Add ${suggestion.name}`, onClick: () => addPair(suggestion.symbol) },
      }
    }
    return {
      title,
      message: 'Try a coin name like Bitcoin or a symbol like BTC.',
      action: { label: 'Clear search', onClick: () => setQuery('') },
    }
  }
  const empty = emptyState()
  const emptyWithFocus = empty && {
    ...empty,
    action: empty.action && {
      ...empty.action,
      onClick: () => {
        empty.action?.onClick()
        refocus(document.getElementById(searchId))
      },
    },
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
        pairsToggleId={pairsToggleId}
        searchId={searchId}
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
          fallbackFocusId={pairsToggleId}
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
          tracked={tracked}
          onAdd={addPair}
          onRemove={removePair}
        />
      )}
      {emptyWithFocus === null ? (
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
          fallbackFocusId={searchId}
        />
      ) : (
        <EmptyState {...emptyWithFocus} />
      )}
      <p className="visually-hidden" role="status">
        {searching && `${rows.length} ${rows.length === 1 ? 'pair' : 'pairs'} found`}
      </p>
    </section>
  )
}
