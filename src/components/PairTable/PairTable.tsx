import { useRef, useState, type FocusEvent } from 'react'
import { keepOrder } from '../../domain/sortPairs'
import type { LoadStatus, Pair, PairPrice, SortDirection, SortKey } from '../../domain/types'
import { focusAfterRemoval } from '../focusAfterRemoval'
import { PairRow } from '../PairRow/PairRow'
import styles from './PairTable.module.css'

type PairTableProps = {
  pairs: readonly Pair[]
  prices: Readonly<Record<string, PairPrice>>
  status: LoadStatus
  favorites: ReadonlySet<string>
  onToggleFavorite: (symbol: string) => void
  onHide: (symbol: string) => void
  sortKey: SortKey
  sortDirection: SortDirection
  onSort: (key: SortKey) => void
  fallbackFocusId: string
}

const COLUMNS: readonly { key: SortKey; label: string; numeric: boolean }[] = [
  { key: 'name', label: 'Asset', numeric: false },
  { key: 'price', label: 'Price', numeric: true },
  { key: 'change', label: 'Since open', numeric: true },
]

export function PairTable({
  pairs,
  prices,
  status,
  favorites,
  onToggleFavorite,
  onHide,
  sortKey,
  sortDirection,
  onSort,
  fallbackFocusId,
}: PairTableProps) {
  const bodyRef = useRef<HTMLTableSectionElement>(null)
  const inside = useRef({ pointer: false, focus: false })
  const [frozenOrder, setFrozenOrder] = useState<readonly string[] | null>(null)
  const rows = frozenOrder === null ? pairs : keepOrder(pairs, frozenOrder)

  const setInside = (key: 'pointer' | 'focus', value: boolean) => {
    inside.current[key] = value
    const active = inside.current.pointer || inside.current.focus
    setFrozenOrder((current) => (active ? (current ?? pairs.map((pair) => pair.symbol)) : null))
  }

  return (
    <>
      <p className={status === 'error' ? styles.error : 'visually-hidden'} role="status">
        {status === 'loading' && 'Loading prices from Binance'}
        {status === 'error' && 'Couldn’t load prices from Binance. Check your connection.'}
      </p>
      <div className={styles.scroller}>
        <table className={styles.table}>
          <thead>
            <tr>
              {COLUMNS.map((column) => {
                const active = column.key === sortKey
                return (
                  <th
                    key={column.key}
                    scope="col"
                    className={column.numeric ? styles.numeric : styles.asset}
                    aria-sort={
                      active ? (sortDirection === 'asc' ? 'ascending' : 'descending') : undefined
                    }
                  >
                    <button
                      type="button"
                      className={styles.sort}
                      data-active={active}
                      onClick={() => {
                        onSort(column.key)
                      }}
                    >
                      {column.label}
                      <svg
                        className={styles.sortIcon}
                        data-direction={active ? sortDirection : undefined}
                        viewBox="0 0 10 14"
                        aria-hidden="true"
                      >
                        <path className={styles.ascending} d="M5 1.5 8.5 5.5h-7Z" />
                        <path className={styles.descending} d="M5 12.5 1.5 8.5h7Z" />
                      </svg>
                    </button>
                  </th>
                )
              })}
              <th scope="col" className={styles.actions}>
                <span className="visually-hidden">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody
            ref={bodyRef}
            onPointerEnter={() => {
              setInside('pointer', true)
            }}
            onPointerLeave={() => {
              setInside('pointer', false)
            }}
            onFocus={() => {
              setInside('focus', true)
            }}
            onBlur={(event: FocusEvent<HTMLTableSectionElement>) => {
              const next = event.relatedTarget
              if (!(next instanceof Node) || !event.currentTarget.contains(next)) {
                setInside('focus', false)
              }
            }}
          >
            {rows.map((pair, index) => (
              <PairRow
                key={pair.symbol}
                pair={pair}
                price={prices[pair.symbol]}
                isFavorite={favorites.has(pair.symbol)}
                unavailable={status === 'error'}
                loadingDelayMs={index * 120}
                onToggleFavorite={(symbol) => {
                  onToggleFavorite(symbol)
                  focusAfterRemoval(
                    bodyRef.current,
                    '[data-action="favorite"]',
                    index,
                    document.getElementById(fallbackFocusId),
                  )
                }}
                onHide={(symbol) => {
                  onHide(symbol)
                  focusAfterRemoval(
                    bodyRef.current,
                    '[data-action="hide"]',
                    index,
                    document.getElementById(fallbackFocusId),
                  )
                }}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
