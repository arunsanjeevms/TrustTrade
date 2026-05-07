const PUBLIC_ID_PATTERN = /^TRD-[A-Z0-9-]{3,}$/i
const TOKEN_PREFIX = 'tt1.'

function tryParseUrl(value) {
  try {
    return new URL(value)
  } catch {
    return null
  }
}

export function extractTradePublicId(text) {
  const raw = String(text || '').trim()
  if (!raw) {
    return ''
  }

  if (PUBLIC_ID_PATTERN.test(raw)) {
    return raw
  }

  const url = tryParseUrl(raw)
  if (!url) {
    return ''
  }

  const queryCandidates = [
    url.searchParams.get('trade'),
    url.searchParams.get('publicId'),
    url.searchParams.get('id'),
    url.searchParams.get('invite'),
  ]

  for (const candidate of queryCandidates) {
    if (candidate && PUBLIC_ID_PATTERN.test(candidate.trim())) {
      return candidate.trim()
    }
  }

  const pathSegment = url.pathname
    .split('/')
    .filter(Boolean)
    .find((segment) => PUBLIC_ID_PATTERN.test(segment))

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
    return `${appOrigin}/join-trade?invite=TRD-0000`
  }

  if (isHttpUrl(raw)) {
    return raw
  }

  if (isTradeQrToken(raw)) {
    return raw
  }

  const publicId = extractTradePublicId(raw)
  if (publicId) {
    return `${appOrigin}/join-trade?invite=${encodeURIComponent(publicId)}`
  }

  return raw
}

export function isTradeQrToken(value) {
  const raw = String(value || '').trim()
  return raw.startsWith(TOKEN_PREFIX)
}

export function normalizeScannedPayload(payload) {
  const raw = String(payload || '').trim()
  return {
    raw,
    publicId: extractTradePublicId(raw),
    isUrl: isHttpUrl(raw),
    isTradeToken: isTradeQrToken(raw),
  }
}
