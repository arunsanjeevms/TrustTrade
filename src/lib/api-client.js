const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim()
const apiBaseUrl = rawBaseUrl.replace(/\/+$/, '')

function resolveUrl(path) {
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${apiBaseUrl}${normalizedPath}`
}

function toErrorMessage(payload, fallbackMessage) {
  if (typeof payload === 'string' && payload.trim()) {
    return payload
  }

  if (payload && typeof payload === 'object') {
    const message = payload.message || payload.error
    if (typeof message === 'string' && message.trim()) {
      return message
    }
  }

  return fallbackMessage
}

export function isApiConfigured() {
  return Boolean(apiBaseUrl)
}

export async function apiRequest(
  path,
  {
    method = 'GET',
    body,
    headers = {},
    signal,
  } = {},
) {
  if (!isApiConfigured()) {
    throw new Error('API is not configured. Add VITE_API_BASE_URL to enable backend requests.')
  }

  const hasBody = body !== undefined && body !== null
  const response = await fetch(resolveUrl(path), {
    method,
    credentials: 'include',
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: hasBody ? JSON.stringify(body) : undefined,
    signal,
  })

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json') ? await response.json() : await response.text()

  if (!response.ok) {
    throw new Error(toErrorMessage(payload, `Request failed (${response.status})`))
  }

  return payload
}
