import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export const signAccessToken = (user) => {
  return jwt.sign(
    {
      email: user.email,
      role: user.role,
    },
    env.JWT_SECRET,
    {
      subject: user.id,
      expiresIn: env.JWT_EXPIRES_IN,
    },
  )
}
