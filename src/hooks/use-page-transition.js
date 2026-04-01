import { useMemo } from 'react'
import { usePreferences } from '@/hooks/use-preferences'

export function usePageTransition() {
  const { preferences } = usePreferences()

  return useMemo(() => {
    if (preferences.reducedMotion) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.01, ease: 'easeInOut' },
      }
    }

    return {
      initial: { opacity: 0, y: 16 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -12 },
      transition: { duration: 0.3, ease: 'easeInOut' },
    }
  }, [preferences.reducedMotion])
}
