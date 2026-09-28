import { useEffect, useSyncExternalStore } from 'react'
import { usePreferencesStore } from '../store/preferencesStore'

const DARK_QUERY = '(prefers-color-scheme: dark)'

function subscribeToSystemTheme(onChange: () => void): () => void {
  const query = window.matchMedia(DARK_QUERY)
  query.addEventListener('change', onChange)
  return () => {
    query.removeEventListener('change', onChange)
  }
}

function systemPrefersDark(): boolean {
  return window.matchMedia(DARK_QUERY).matches
}

export function useTheme(): { theme: 'light' | 'dark'; toggleTheme: () => void } {
  const choice = usePreferencesStore((state) => state.theme)
  const setTheme = usePreferencesStore((state) => state.setTheme)
  const systemDark = useSyncExternalStore(subscribeToSystemTheme, systemPrefersDark)
  const theme = choice === 'system' ? (systemDark ? 'dark' : 'light') : choice

  useEffect(() => {
    const root = document.documentElement
    if (choice === 'system') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', choice)
  }, [choice])

  return {
    theme,
    toggleTheme: () => {
      setTheme(theme === 'dark' ? 'light' : 'dark')
    },
  }
}
