import { prisma } from '../config/prisma.js'
import { ApiError } from '../utils/http.js'

export const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      wallet: {
        include: {
          transactions: {
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
        },
      },
      _count: {
        select: {
          tradesCreated: true,
          disputesOpened: true,
          notifications: true,
        },
      },
    },
  })

  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    wallet: user.wallet,
    stats: user._count,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

export const updateUserProfile = async (userId, input) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      fullName: input.fullName,
      avatarUrl: input.avatarUrl,
    },
  })

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}
