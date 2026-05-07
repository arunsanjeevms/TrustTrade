import crypto from 'crypto'
import { env } from '../config/env.js'

const TOKEN_PREFIX = 'tt1'

const base64UrlEncode = (value) => Buffer.from(value).toString('base64url')
const base64UrlDecode = (value) => Buffer.from(value, 'base64url').toString('utf8')

const signPayload = (encodedPayload) => {
  return crypto
    .createHmac('sha256', env.QR_SECRET)
    .update(encodedPayload)
    .digest('base64url')
}

export const createTradeQrToken = (publicId) => {
  const payload = JSON.stringify({ pid: publicId, iat: Date.now() })
  const encoded = base64UrlEncode(payload)
  const signature = signPayload(encoded)
  return `${TOKEN_PREFIX}.${encoded}.${signature}`
}

export const parseTradeQrToken = (token) => {
  if (!token || typeof token !== 'string') {
    return null
  }

  const [prefix, encoded, signature] = token.split('.')
  if (prefix !== TOKEN_PREFIX || !encoded || !signature) {
    return null
  }

  const expected = signPayload(encoded)
  if (expected !== signature) {
    return null
  }

  try {
    const parsed = JSON.parse(base64UrlDecode(encoded))
    if (!parsed || typeof parsed.pid !== 'string' || !parsed.pid.trim()) {
      return null
    }

    return {
      publicId: parsed.pid.trim(),
      issuedAt: parsed.iat || null,
    }
  } catch {
    return null
  }
}
