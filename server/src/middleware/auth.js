import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { ApiError } from '../utils/http.js'

export const requireAuth = (req, _res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Missing or invalid authorization header'))
  }

  const token = authHeader.slice(7)

  try {
    const payload = jwt.verify(token, env.JWT_SECRET)
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    }
    return next()
  } catch {
    return next(new ApiError(401, 'Invalid or expired token'))
  }
}

export const requireRoles = (...roles) => (req, _res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required'))
  }

  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, 'Forbidden'))
  }

  return next()
}
