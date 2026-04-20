import bcrypt from 'bcryptjs'
import { prisma } from '../config/prisma.js'
import { ApiError } from '../utils/http.js'

const sanitizeUser = (user) => ({
  id: user.id,
  email: user.email,
  fullName: user.fullName,
  avatarUrl: user.avatarUrl,
  role: user.role,
  isEmailVerified: user.isEmailVerified,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
})

export const registerUser = async ({ email, password, fullName }) => {
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    throw new ApiError(409, 'Email already registered')
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      email,
      fullName,
      passwordHash,
      wallet: {
        create: {
          currency: 'USD',
        },
      },
    },
  })

  return sanitizeUser(user)
}

export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    throw new ApiError(401, 'Invalid email or password')
  }

  const matches = await bcrypt.compare(password, user.passwordHash)
  if (!matches) {
    throw new ApiError(401, 'Invalid email or password')
  }

  return sanitizeUser(user)
}
