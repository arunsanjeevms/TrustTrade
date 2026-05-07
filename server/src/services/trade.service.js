import { prisma } from '../config/prisma.js'
import { ApiError } from '../utils/http.js'
import { createTradeQrToken } from '../utils/trade-qr.js'
import { publishTradeEvent } from '../utils/trade-stream.js'

const TRADE_TRANSITIONS = {
  PENDING_JOIN: ['HOLD', 'CANCELLED'],
  HOLD: ['SHIPPED', 'CANCELLED', 'DISPUTED'],
  SHIPPED: ['DELIVERED', 'DISPUTED', 'CANCELLED'],
  DELIVERED: ['COMPLETED', 'DISPUTED'],
  DISPUTED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
}

const buildTradeIncludes = () => ({
  createdBy: {
    select: {
      id: true,
      fullName: true,
      email: true,
    },
  },
  participants: {
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  },
  milestones: {
    orderBy: {
      position: 'asc',
    },
  },
  activities: {
    orderBy: {
      createdAt: 'desc',
    },
    take: 20,
  },
  disputes: {
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
  },
})

const assertTradeAccess = async (tradeId, userId) => {
  const trade = await prisma.trade.findUnique({
    where: { id: tradeId },
    include: {
      participants: true,
    },
  })

  if (!trade) {
    throw new ApiError(404, 'Trade not found')
  }

  const canAccess = trade.createdById === userId || trade.participants.some((participant) => participant.userId === userId)
  if (!canAccess) {
    throw new ApiError(403, 'You are not allowed to access this trade')
  }

  return trade
}

const getTradeByPublicId = async (publicId) => {
  const trade = await prisma.trade.findUnique({
    where: { publicId },
    include: {
      participants: true,
    },
  })

  if (!trade) {
    throw new ApiError(404, 'Trade not found')
  }

  return trade
}

const generateTradePublicId = async (tx) => {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const randomPart = Math.floor(1000 + Math.random() * 9000)
    const candidate = `TRD-${randomPart}`
    const existing = await tx.trade.findUnique({ where: { publicId: candidate } })
    if (!existing) {
      return candidate
    }
  }

  return `TRD-${Date.now().toString().slice(-6)}`
}

export const listTrades = async (userId, filters) => {
  const page = filters.page ?? 1
  const pageSize = filters.pageSize ?? 20

  const accessFilter = {
    OR: [
      { createdById: userId },
      { participants: { some: { userId } } },
    ],
  }

  const searchFilter = filters.search
    ? {
        OR: [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { publicId: { contains: filters.search, mode: 'insensitive' } },
        ],
      }
    : undefined

  const where = {
    AND: [accessFilter, ...(searchFilter ? [searchFilter] : [])],
    ...(filters.status ? { status: filters.status } : {}),
  }

  const [items, total] = await prisma.$transaction([
    prisma.trade.findMany({
      where,
      include: buildTradeIncludes(),
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.trade.count({ where }),
  ])

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  }
}

export const getTradeById = async (userId, tradeId) => {
  await assertTradeAccess(tradeId, userId)

  return prisma.trade.findUnique({
    where: { id: tradeId },
    include: buildTradeIncludes(),
  })
}

export const createTrade = async (userId, input) => {
  const trade = await prisma.$transaction(async (tx) => {
    const publicId = await generateTradePublicId(tx)

    const trade = await tx.trade.create({
      data: {
        publicId,
        createdById: userId,
        title: input.title,
        description: input.description,
        amount: input.amount,
        currency: input.currency,
        shippingMethod: input.shippingMethod,
        expectedShipBy: input.expectedShipBy ?? null,
        expectedDeliveryBy: input.expectedDeliveryBy ?? null,
      },
    })

    await tx.tradeParticipant.create({
      data: {
        tradeId: trade.id,
        userId,
        role: input.role || 'SELLER',
        status: 'ACCEPTED',
        joinedAt: new Date(),
      },
    })

    await tx.tradeActivity.create({
      data: {
        tradeId: trade.id,
        actorId: userId,
        type: 'SYSTEM',
        message: `Trade ${publicId} created`,
      },
    })

    return tx.trade.findUnique({
      where: { id: trade.id },
      include: buildTradeIncludes(),
    })
  })

  publishTradeEvent(trade.id, { type: 'TRADE_CREATED' })
  return trade
}

export const joinTrade = async (userId, tradeId, input) => {
  const trade = await prisma.$transaction(async (tx) => {
    const trade = await tx.trade.findUnique({
      where: { id: tradeId },
      include: {
        participants: true,
      },
    })

    if (!trade) {
      throw new ApiError(404, 'Trade not found')
    }

    if (trade.roomClosed) {
      throw new ApiError(400, 'Trade room is already closed')
    }

    const existingParticipant = trade.participants.find((participant) => participant.userId === userId)

    if (existingParticipant) {
      throw new ApiError(400, 'You are already a participant in this trade.')
    }

    // Auto-assign the opposite role of the existing participant
    const existingRoles = trade.participants.map((p) => p.role)
    const assignedRole = existingRoles.includes('SELLER') ? 'BUYER' : existingRoles.includes('BUYER') ? 'SELLER' : (input.role || 'BUYER')

    await tx.tradeParticipant.create({
      data: {
        tradeId,
        userId,
        role: assignedRole,
        status: 'ACCEPTED',
        joinedAt: new Date(),
      },
    })

    // Don't auto-transition to HOLD here.
    // Buyer must complete payment simulation first, which will trigger HOLD.

    await tx.tradeActivity.create({
      data: {
        tradeId,
        actorId: userId,
        type: 'SYSTEM',
        message: `User joined trade as ${assignedRole}`,
      },
    })

    return tx.trade.findUnique({
      where: { id: tradeId },
      include: buildTradeIncludes(),
    })
  })

  publishTradeEvent(tradeId, { type: 'TRADE_JOINED' })
  return trade
}

export const updateTradeStatus = async (userId, tradeId, input) => {
  const trade = await assertTradeAccess(tradeId, userId)

  const allowedStatuses = TRADE_TRANSITIONS[trade.status] ?? []
  if (!allowedStatuses.includes(input.status)) {
    throw new ApiError(400, `Invalid status transition from ${trade.status} to ${input.status}`)
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedTrade = await tx.trade.update({
      where: { id: tradeId },
      data: {
        status: input.status,
        ...(input.status === 'HOLD' ? { escrowStatus: 'LOCKED' } : {}),
        ...(input.status === 'COMPLETED' ? { escrowStatus: 'RELEASED' } : {}),
        ...(input.status === 'DISPUTED' ? { escrowStatus: 'LOCKED' } : {}),
        ...(input.status === 'CANCELLED' && trade.escrowStatus === 'LOCKED' ? { escrowStatus: 'REFUNDED' } : {}),
      },
    })

    await tx.tradeActivity.create({
      data: {
        tradeId,
        actorId: userId,
        type: 'STATUS_CHANGE',
        message: input.note ?? `Trade status changed to ${input.status}`,
        payload: {
          from: trade.status,
          to: input.status,
        },
      },
    })

    return tx.trade.findUnique({
      where: { id: updatedTrade.id },
      include: buildTradeIncludes(),
    })
  })

  publishTradeEvent(tradeId, { type: 'STATUS_UPDATED', status: input.status })
  return updated
}

export const addTradeActivity = async (userId, tradeId, input) => {
  await assertTradeAccess(tradeId, userId)

  const activity = await prisma.tradeActivity.create({
    data: {
      tradeId,
      actorId: userId,
      type: 'MESSAGE',
      message: input.message,
      payload: input.payload,
    },
  })

  publishTradeEvent(tradeId, { type: 'ACTIVITY_ADDED' })
  return activity
}

export const listTradeActivities = async (userId, tradeId) => {
  await assertTradeAccess(tradeId, userId)

  return prisma.tradeActivity.findMany({
    where: { tradeId },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      actor: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  })
}

export const addMilestone = async (userId, tradeId, input) => {
  await assertTradeAccess(tradeId, userId)

  const position =
    input.position ??
    (await prisma.tradeMilestone.count({
      where: { tradeId },
    })) + 1

  const milestone = await prisma.tradeMilestone.create({
    data: {
      tradeId,
      title: input.title,
      description: input.description,
      amount: input.amount,
      dueAt: input.dueAt,
      position,
    },
  })

  publishTradeEvent(tradeId, { type: 'MILESTONE_ADDED' })
  return milestone
}

export const getTradeQrPayload = async (userId, tradeId) => {
  const trade = await assertTradeAccess(tradeId, userId)
  return {
    publicId: trade.publicId,
    token: createTradeQrToken(trade.publicId),
  }
}

export const joinTradeByPublicId = async (userId, publicId, input) => {
  const trade = await getTradeByPublicId(publicId)
  return joinTrade(userId, trade.id, input)
}

export const confirmDeliveryByPublicId = async (userId, publicId) => {
  const trade = await getTradeByPublicId(publicId)
  return updateTradeStatus(userId, trade.id, {
    status: 'DELIVERED',
    note: 'Buyer confirmed delivery via QR scan',
  })
}

export const closeTradeRoom = async (userId, tradeId) => {
  await assertTradeAccess(tradeId, userId)

  const trade = await prisma.trade.update({
    where: { id: tradeId },
    data: { roomClosed: true },
  })

  await prisma.tradeActivity.create({
    data: {
      tradeId,
      actorId: userId,
      type: 'SYSTEM',
      message: 'Trade room closed',
    },
  })

  publishTradeEvent(tradeId, { type: 'ROOM_CLOSED' })
  return trade
}

export const resolveDispute = async (userId, tradeId, input) => {
  const trade = await assertTradeAccess(tradeId, userId)

  if (trade.status !== 'DISPUTED') {
    throw new ApiError(400, 'Trade is not currently disputed')
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedTrade = await tx.trade.update({
      where: { id: tradeId },
      data: {
        status: input.resolution === 'SELLER' ? 'COMPLETED' : 'CANCELLED',
        escrowStatus: input.resolution === 'SELLER' ? 'RELEASED' : 'REFUNDED',
        roomClosed: true,
      },
    })

    await tx.tradeActivity.create({
      data: {
        tradeId,
        actorId: userId,
        type: 'STATUS_CHANGE',
        message: `Dispute resolved in favor of ${input.resolution}. Room closed.`,
        payload: {
          resolution: input.resolution,
        },
      },
    })

    return tx.trade.findUnique({
      where: { id: updatedTrade.id },
      include: buildTradeIncludes(),
    })
  })

  publishTradeEvent(tradeId, { type: 'DISPUTE_RESOLVED', resolution: input.resolution })
  return updated
}
