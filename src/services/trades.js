import { tradeRoomMessages as mockTradeRoomMessages, trades as mockTrades } from '@/data/mock'
import { apiRequest, isApiConfigured } from '@/lib/api-client'

function cloneData(value) {
  return JSON.parse(JSON.stringify(value))
}

function normalizeList(payload, fallback) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (payload && typeof payload === 'object') {
    if (Array.isArray(payload.items)) {
      return payload.items
    }
    if (Array.isArray(payload.data)) {
      return payload.data
    }
    if (Array.isArray(payload.results)) {
      return payload.results
    }
  }

  return fallback
}

function snapshotFromMock() {
  return {
    trades: cloneData(mockTrades),
    tradeRoomMessages: cloneData(mockTradeRoomMessages),
    source: 'mock',
  }
}

export async function getTradesSnapshot() {
  if (!isApiConfigured()) {
    return snapshotFromMock()
  }

  try {
    const [tradesResponse, messagesResponse] = await Promise.all([
      apiRequest('/trades'),
      apiRequest('/trade-room/messages'),
    ])

    return {
      trades: normalizeList(tradesResponse, cloneData(mockTrades)),
      tradeRoomMessages: normalizeList(messagesResponse, cloneData(mockTradeRoomMessages)),
      source: 'api',
    }
  } catch {
    return snapshotFromMock()
  }
}
