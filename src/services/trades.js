import { trades as mockTrades } from '@/data/mock'
import { apiRequest, getApiBaseUrl, isApiConfigured } from '@/lib/api-client'
import { getAuthToken } from '@/lib/auth-storage'

function cloneData(value) {
  return JSON.parse(JSON.stringify(value))
}

function unwrapPayload(payload) {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data
  }

  return payload
}

function normalizeList(payload, fallback) {
  const data = unwrapPayload(payload)
  if (Array.isArray(data)) {
    return data
  }

  if (data && typeof data === 'object') {
    if (Array.isArray(data.items)) {
      return data.items
    }
    if (Array.isArray(data.results)) {
      return data.results
    }
  }

  return fallback
}

function snapshotFromMock() {
  return {
    trades: cloneData(mockTrades),
    source: 'mock',
  }
}

export async function getTradesSnapshot() {
  if (!isApiConfigured()) {
    return snapshotFromMock()
  }

  try {
    const tradesResponse = await apiRequest('/trades')
    return {
      trades: normalizeList(tradesResponse, cloneData(mockTrades)),
      source: 'api',
    }
  } catch {
    return snapshotFromMock()
  }
}

export async function getTradeById(tradeId) {
  const payload = await apiRequest(`/trades/${tradeId}`)
  return unwrapPayload(payload)
}

export async function listTradeActivities(tradeId) {
  const payload = await apiRequest(`/trades/${tradeId}/activities`)
  return normalizeList(payload, [])
}

export async function createTrade(input) {
  const payload = await apiRequest('/trades', {
    method: 'POST',
    body: input,
  })
  return unwrapPayload(payload)
}

export async function joinTradeByToken({ token, publicId, role = 'BUYER' }) {
  const payload = await apiRequest('/trades/qr/join', {
    method: 'POST',
    body: { token, publicId, role },
  })
  return unwrapPayload(payload)
}

export async function confirmDeliveryByToken({ token, publicId }) {
  const payload = await apiRequest('/trades/qr/confirm-delivery', {
    method: 'POST',
    body: { token, publicId },
  })
  return unwrapPayload(payload)
}

export async function updateTradeStatus(tradeId, status, note) {
  const payload = await apiRequest(`/trades/${tradeId}/status`, {
    method: 'POST',
    body: { status, note },
  })
  return unwrapPayload(payload)
}

export async function closeTradeRoom(tradeId) {
  const payload = await apiRequest(`/trades/${tradeId}/close`, {
    method: 'POST',
  })
  return unwrapPayload(payload)
}

export async function resolveDispute(tradeId, resolution) {
  const payload = await apiRequest(`/trades/${tradeId}/resolve-dispute`, {
    method: 'POST',
    body: { resolution },
  })
  return unwrapPayload(payload)
}

export async function addTradeActivity(tradeId, message, payload) {
  const response = await apiRequest(`/trades/${tradeId}/activities`, {
    method: 'POST',
    body: { message, payload },
  })
  return unwrapPayload(response)
}

export async function getTradeQrPayload(tradeId) {
  const payload = await apiRequest(`/trades/${tradeId}/qr`)
  return unwrapPayload(payload)
}

export function openTradeStream(tradeId, onMessage, onError) {
  const baseUrl = getApiBaseUrl()
  const token = getAuthToken()
  if (!baseUrl || !token || typeof window === 'undefined') {
    return null
  }

  const url = `${baseUrl}/trades/${tradeId}/stream?token=${encodeURIComponent(token)}`
  const stream = new EventSource(url)
  stream.addEventListener('trade', onMessage)
  if (onError) {
    stream.addEventListener('error', onError)
  }

  return stream
}
