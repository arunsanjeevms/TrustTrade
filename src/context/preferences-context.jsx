/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'trusttrade.preferences.v1'

const defaultPreferences = {
  theme: 'dark',
  compactMode: false,
  reducedMotion: false,
  emailTradeAlerts: true,
}

const PreferencesContext = createContext(undefined)

function loadStoredPreferences() {
  if (typeof window === 'undefined') {
    return defaultPreferences
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return defaultPreferences
    }

    const parsed = JSON.parse(raw)
    return {
      ...defaultPreferences,
      ...parsed,
      theme: parsed?.theme === 'light' ? 'light' : 'dark',
    }
  } catch {
    return defaultPreferences
  }
}

export function PreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState(loadStoredPreferences)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
  }, [preferences])

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark', 'light')
    root.classList.add(preferences.theme)

    root.classList.toggle('compact', preferences.compactMode)
    root.classList.toggle('reduced-motion', preferences.reducedMotion)
  }, [preferences.theme, preferences.compactMode, preferences.reducedMotion])

  const value = useMemo(() => {
    const setTheme = (theme) => {
      setPreferences((current) => ({ ...current, theme }))
    }

    const toggleTheme = () => {
      setPreferences((current) => ({
        ...current,
        theme: current.theme === 'dark' ? 'light' : 'dark',
      }))
    }

    const updatePreference = (key, nextValue) => {
      setPreferences((current) => ({
        ...current,
        [key]: typeof nextValue === 'function' ? nextValue(current[key]) : nextValue,
      }))
    }

    const resetPreferences = () => {
      setPreferences(defaultPreferences)
    }

    return {
      preferences,
      setTheme,
      toggleTheme,
      updatePreference,
      resetPreferences,
    }
  }, [preferences])

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function usePreferences() {
  const context = useContext(PreferencesContext)

  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider')
  }

  return context
}
