import { useMemo } from 'react'
import { pairsFor } from '../config/pairs'
import type { Pair } from '../domain/types'
import { usePreferencesStore } from '../store/preferencesStore'

export function useTrackedPairs(): readonly Pair[] {
  const symbols = usePreferencesStore((state) => state.pairs)
  return useMemo(() => pairsFor(symbols), [symbols])
}
