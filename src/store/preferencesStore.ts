import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { PAIR_CATALOG } from '../config/pairs'
import type { SortKey, ViewMode } from '../domain/types'
import { sanitizePreferences, type SavedPreferences } from './sanitizePreferences'

type PreferencesState = SavedPreferences & {
  toggleFavorite: (symbol: string) => void
  toggleHidden: (symbol: string) => void
  setView: (view: ViewMode) => void
  setSort: (key: SortKey) => void
  restoreAll: () => void
}

const DEFAULTS: SavedPreferences = {
  favorites: [],
  hidden: [],
  view: 'all',
  sortKey: 'name',
  sortDirection: 'asc',
}

const KNOWN_SYMBOLS = new Set(PAIR_CATALOG.map((pair) => pair.symbol))

function toggle(list: readonly string[], item: string): string[] {
  return list.includes(item) ? list.filter((entry) => entry !== item) : [...list, item]
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      toggleFavorite: (symbol) => set((state) => ({ favorites: toggle(state.favorites, symbol) })),
      toggleHidden: (symbol) => set((state) => ({ hidden: toggle(state.hidden, symbol) })),
      setView: (view) => set({ view }),
      restoreAll: () => set({ hidden: [] }),
      setSort: (sortKey) =>
        set((state) =>
          state.sortKey === sortKey
            ? { sortDirection: state.sortDirection === 'asc' ? 'desc' : 'asc' }
            : { sortKey, sortDirection: sortKey === 'name' ? 'asc' : 'desc' },
        ),
    }),
    {
      name: 'crypto-dashboard:preferences',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ favorites, hidden, view, sortKey, sortDirection }): SavedPreferences => ({
        favorites,
        hidden,
        view,
        sortKey,
        sortDirection,
      }),
      merge: (saved, current) => ({
        ...current,
        ...sanitizePreferences(saved, DEFAULTS, KNOWN_SYMBOLS),
      }),
    },
  ),
)
