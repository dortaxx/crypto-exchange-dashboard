import { useEffect } from 'react'
import { PREFERENCES_STORAGE_KEY, usePreferencesStore } from '../store/preferencesStore'

export function useCrossTabPreferences(): void {
  useEffect(() => {
    const reloadWhenChangedElsewhere = (event: StorageEvent) => {
      if (event.key === PREFERENCES_STORAGE_KEY) void usePreferencesStore.persist.rehydrate()
    }
    window.addEventListener('storage', reloadWhenChangedElsewhere)
    return () => {
      window.removeEventListener('storage', reloadWhenChangedElsewhere)
    }
  }, [])
}
