import { apiRequest, isApiConfigured } from '@/lib/api-client'
import { setAuthSession } from '@/lib/auth-storage'

function sleep(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function defaultUserFromEmail(email, fallbackName = 'Trust Trade User') {
  const normalized = (email || '').trim().toLowerCase()
  const username = normalized.includes('@') ? normalized.split('@')[0] : 'trader'

  return {
    id: `user_${username || 'trader'}`,
    fullName: fallbackName,
    email: normalized || 'user@trusttrade.app',
  }
}

function normalizeAuthResponse(payload, fallbackEmail, fallbackName) {
  const resolved = payload?.data && typeof payload.data === 'object'
    ? payload.data
    : payload

  const user = resolved?.user && typeof resolved.user === 'object'
    ? resolved.user
    : defaultUserFromEmail(fallbackEmail, fallbackName)

  return {
    token: resolved?.token || resolved?.accessToken || 'mock-token',
    user,
  }
}

export async function loginUser({ email, password }) {
  if (isApiConfigured()) {
    const payload = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    })

    const session = normalizeAuthResponse(payload, email)
    setAuthSession(session)
    return session
  }

  await sleep(550)
  const session = normalizeAuthResponse(null, email)
  setAuthSession(session)
  return session
}

export async function registerUser({ fullName, email, password }) {
  if (isApiConfigured()) {
    const payload = await apiRequest('/auth/register', {
      method: 'POST',
      body: { fullName, email, password },
    })

    const session = normalizeAuthResponse(payload, email, fullName)
    setAuthSession(session)
    return session
  }

  await sleep(650)
  const session = normalizeAuthResponse(null, email, fullName)
  setAuthSession(session)
  return session
}
