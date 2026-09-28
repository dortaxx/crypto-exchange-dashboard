import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { DEFAULT_SYMBOLS, PAIR_CATALOG } from '../config/pairs'
import { targetProblem } from '../domain/targets'
import type { PriceTarget, SortKey, ThemeChoice, ViewMode } from '../domain/types'
import { sanitizePreferences, type SavedPreferences } from './sanitizePreferences'

type PreferencesState = SavedPreferences & {
  addPair: (symbol: string) => void
  removePair: (symbol: string) => void
  addTarget: (target: Pick<PriceTarget, 'symbol' | 'price' | 'direction'>) => void
  removeTargets: (ids: readonly string[]) => void
  toggleFavorite: (symbol: string) => void
  toggleHidden: (symbol: string) => void
  setView: (view: ViewMode) => void
  setSort: (key: SortKey) => void
  restoreAll: () => void
  setTheme: (theme: ThemeChoice) => void
}

const DEFAULTS: SavedPreferences = {
  pairs: [...DEFAULT_SYMBOLS],
  favorites: [],
  hidden: [],
  view: 'all',
  sortKey: 'name',
  sortDirection: 'asc',
  targets: [],
  theme: 'system',
}

export const PREFERENCES_STORAGE_KEY = 'crypto-dashboard:preferences'

const KNOWN_SYMBOLS = new Set(PAIR_CATALOG.map((pair) => pair.symbol))

function targetId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function without(list: readonly string[], item: string): string[] {
  return list.filter((entry) => entry !== item)
}

function toggle(list: readonly string[], item: string): string[] {
  return list.includes(item) ? list.filter((entry) => entry !== item) : [...list, item]
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      addPair: (symbol) =>
        set((state) =>
          state.pairs.includes(symbol) || !KNOWN_SYMBOLS.has(symbol)
            ? state
            : { pairs: [...state.pairs, symbol] },
        ),
      removePair: (symbol) =>
        set((state) =>
          state.pairs.length <= 1 || !state.pairs.includes(symbol)
            ? state
            : {
                pairs: without(state.pairs, symbol),
                favorites: without(state.favorites, symbol),
                hidden: without(state.hidden, symbol),
                targets: state.targets.filter((target) => target.symbol !== symbol),
              },
        ),
      addTarget: (target) =>
        set((state) => {
          if (targetProblem(state.targets, target.symbol, target.price) !== null) return state
          return {
            targets: [{ ...target, id: targetId(), createdAt: Date.now() }, ...state.targets],
          }
        }),
      removeTargets: (ids) =>
        set((state) => ({ targets: state.targets.filter((target) => !ids.includes(target.id)) })),
      toggleFavorite: (symbol) => set((state) => ({ favorites: toggle(state.favorites, symbol) })),
      toggleHidden: (symbol) => set((state) => ({ hidden: toggle(state.hidden, symbol) })),
      setView: (view) => set({ view }),
      restoreAll: () => set({ hidden: [] }),
      setTheme: (theme) => set({ theme }),
      setSort: (sortKey) =>
        set((state) =>
          state.sortKey === sortKey
            ? { sortDirection: state.sortDirection === 'asc' ? 'desc' : 'asc' }
            : { sortKey, sortDirection: sortKey === 'name' ? 'asc' : 'desc' },
        ),
    }),
    {
      name: PREFERENCES_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({
        pairs,
        favorites,
        hidden,
        view,
        sortKey,
        sortDirection,
        targets,
        theme,
      }): SavedPreferences => ({
        pairs,
        favorites,
        hidden,
        view,
        sortKey,
        sortDirection,
        targets,
        theme,
      }),
      merge: (saved, current) => ({
        ...current,
        ...sanitizePreferences(saved, DEFAULTS, KNOWN_SYMBOLS),
      }),
    },
  ),
)
