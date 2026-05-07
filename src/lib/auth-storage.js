const STORAGE_KEY = 'trusttrade.auth.v1'

export function getAuthSession() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }

    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setAuthSession(session) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch {
    // Ignore storage errors.
  }
}

export function clearAuthSession() {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore storage errors.
  }
}

export function getAuthToken() {
  return getAuthSession()?.token || ''
}

export function getAuthUser() {
  return getAuthSession()?.user || null
}
