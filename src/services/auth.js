import { apiRequest, isApiConfigured } from '@/lib/api-client'

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
  const user = payload?.user && typeof payload.user === 'object'
    ? payload.user
    : defaultUserFromEmail(fallbackEmail, fallbackName)

  return {
    token: payload?.token || payload?.accessToken || 'mock-token',
    user,
  }
}

export async function loginUser({ email, password }) {
  if (isApiConfigured()) {
    const payload = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    })

    return normalizeAuthResponse(payload, email)
  }

  await sleep(550)
  return normalizeAuthResponse(null, email)
}

export async function registerUser({ fullName, email, password }) {
  if (isApiConfigured()) {
    const payload = await apiRequest('/auth/register', {
      method: 'POST',
      body: { fullName, email, password },
    })

    return normalizeAuthResponse(payload, email, fullName)
  }

  await sleep(650)
  return normalizeAuthResponse(null, email, fullName)
}
