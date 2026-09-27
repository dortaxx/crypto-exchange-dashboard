import { ThemeToggle } from '../components/ThemeToggle/ThemeToggle'
import { useTheme } from '../hooks/useTheme'

export function ThemeToggleContainer() {
  const { theme, toggleTheme } = useTheme()
  return <ThemeToggle theme={theme} onToggle={toggleTheme} />
}
