import { useEffect, useSyncExternalStore } from 'react'
import { usePreferencesStore } from '../store/preferencesStore'

const DARK_QUERY = '(prefers-color-scheme: dark)'
const BAR_COLORS = { light: '#f8f2f6', dark: '#190100' } as const

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

    for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
      const scheme = meta.media.includes('dark') ? 'dark' : 'light'
      meta.content = BAR_COLORS[choice === 'system' ? scheme : choice]
    }
  }, [choice])

  return {
    theme,
    toggleTheme: () => {
      setTheme(theme === 'dark' ? 'light' : 'dark')
    },
  }
}
