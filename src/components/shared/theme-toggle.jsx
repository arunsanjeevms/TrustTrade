import { MoonStar, SunMedium } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePreferences } from '@/hooks/use-preferences'

export default function ThemeToggle({
  size = 'icon',
  variant = 'ghost',
  className,
  showLabel = false,
}) {
  const { preferences, toggleTheme } = usePreferences()
  const isDark = preferences.theme === 'dark'

  return (
    <Button variant={variant} size={size} className={className} onClick={toggleTheme}>
      {isDark ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
      {showLabel ? (isDark ? 'Light' : 'Dark') : null}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
