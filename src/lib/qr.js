const USER_ID_PATTERN = /^u_[a-z0-9_-]{3,}$/i

function tryParseUrl(value) {
  try {
    return new URL(value)
  } catch {
    return null
  }
}

export function extractUserIdFromInvite(text) {
  const raw = String(text || '').trim()
  if (!raw) {
    return ''
  }

  if (USER_ID_PATTERN.test(raw)) {
    return raw
  }

  const url = tryParseUrl(raw)
  if (!url) {
    return ''
  }

  const queryCandidates = [
    url.searchParams.get('user'),
    url.searchParams.get('uid'),
    url.searchParams.get('id'),
    url.searchParams.get('invite'),
  ]

  for (const candidate of queryCandidates) {
    if (candidate && USER_ID_PATTERN.test(candidate.trim())) {
      return candidate.trim()
    }
  }

  const pathSegment = url.pathname
    .split('/')
    .filter(Boolean)
    .find((segment) => USER_ID_PATTERN.test(segment))

  return pathSegment || ''
}

export function isHttpUrl(value) {
  const url = tryParseUrl(String(value || '').trim())
  if (!url) {
    return false
  }

  return url.protocol === 'http:' || url.protocol === 'https:'
}

export function toShareableQrValue(input, origin) {
  const raw = String(input || '').trim()
  const appOrigin = origin || 'http://localhost:5173'

  if (!raw) {
    return `${appOrigin}/join-trade?user=u_trader007`
  }

  if (isHttpUrl(raw)) {
    return raw
  }

  const userId = extractUserIdFromInvite(raw)
  if (userId) {
    return `${appOrigin}/join-trade?user=${encodeURIComponent(userId)}`
  }

  return raw
}

export function normalizeScannedPayload(payload) {
  const raw = String(payload || '').trim()
  return {
    raw,
    userId: extractUserIdFromInvite(raw),
    isUrl: isHttpUrl(raw),
  }
}
