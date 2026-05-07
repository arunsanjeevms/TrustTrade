import { apiRequest, isApiConfigured } from '@/lib/api-client'

function unwrapPayload(payload) {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data
  }
  return payload
}

export async function listDisputes(filters = {}) {
  if (!isApiConfigured()) return []

  try {
    const query = new URLSearchParams()
    if (filters.status) query.set('status', filters.status)

    const url = `/disputes${query.toString() ? `?${query}` : ''}`
    const payload = await apiRequest(url)
    const data = unwrapPayload(payload)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export async function getDisputeById(disputeId) {
  const payload = await apiRequest(`/disputes/${disputeId}`)
  return unwrapPayload(payload)
}

export async function openDispute({ tradeId, reason, evidence }) {
  const payload = await apiRequest('/disputes', {
    method: 'POST',
    body: { tradeId, reason, evidence },
  })
  return unwrapPayload(payload)
}

export async function addDisputeNote(disputeId, note) {
  const payload = await apiRequest(`/disputes/${disputeId}/notes`, {
    method: 'POST',
    body: { note, isInternal: false },
  })
  return unwrapPayload(payload)
}
