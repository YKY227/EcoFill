import { useTheme } from '@/theme/ThemeProvider'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button onClick={toggle} className="btn-secondary" title="Toggle theme">
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  )
}
