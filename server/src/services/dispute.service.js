import { prisma } from '../config/prisma.js'
import { ApiError } from '../utils/http.js'
import { notifyTradeParticipants } from './notification.service.js'

const canAccessTrade = (trade, userId) => {
  return trade.createdById === userId || trade.participants.some((participant) => participant.userId === userId)
}

export const listDisputes = async (userId, filters = {}) => {
  return prisma.disputeCase.findMany({
    where: {
      ...(filters.status ? { status: filters.status } : {}),
      OR: [
        { openedById: userId },
        { trade: { createdById: userId } },
        { trade: { participants: { some: { userId } } } },
      ],
    },
    include: {
      trade: {
        select: {
          id: true,
          publicId: true,
          title: true,
          amount: true,
          status: true,
        },
      },
      openedBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      evidence: true,
      notes: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export const getDisputeById = async (userId, disputeId) => {
  const dispute = await prisma.disputeCase.findUnique({
    where: { id: disputeId },
    include: {
      trade: {
        include: {
          participants: true,
        },
      },
      openedBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      resolvedBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      evidence: {
        orderBy: { createdAt: 'desc' },
      },
      notes: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!dispute) {
    throw new ApiError(404, 'Dispute not found')
  }

  if (!canAccessTrade(dispute.trade, userId)) {
    throw new ApiError(403, 'You are not allowed to access this dispute')
  }

  return dispute
}

export const openDispute = async (userId, input) => {
  const trade = await prisma.trade.findUnique({
    where: { id: input.tradeId },
    include: {
      participants: true,
    },
  })

  if (!trade) {
    throw new ApiError(404, 'Trade not found')
  }

  if (!canAccessTrade(trade, userId)) {
    throw new ApiError(403, 'You are not allowed to open dispute for this trade')
  }

  const existingOpenDispute = await prisma.disputeCase.findFirst({
    where: {
      tradeId: input.tradeId,
      status: {
        in: ['OPEN', 'UNDER_REVIEW'],
      },
    },
  })

  if (existingOpenDispute) {
    throw new ApiError(400, 'An active dispute already exists for this trade')
  }

  const dispute = await prisma.$transaction(async (tx) => {
    const createdDispute = await tx.disputeCase.create({
      data: {
        tradeId: input.tradeId,
        openedById: userId,
        reason: input.reason,
        status: 'OPEN',
      },
      include: {
        evidence: true,
        notes: true,
      },
    })

    if (input.evidence?.length) {
      await tx.disputeEvidence.createMany({
        data: input.evidence.map((item) => ({
          disputeId: createdDispute.id,
          uploadedById: userId,
          evidenceType: item.evidenceType,
          description: item.description,
          storageKey: item.storageKey,
          checksumSha256: item.checksumSha256,
        })),
      })
    }

    await tx.trade.update({
      where: { id: input.tradeId },
      data: {
        status: 'DISPUTED',
      },
    })

    await tx.tradeActivity.create({
      data: {
        tradeId: input.tradeId,
        actorId: userId,
        type: 'DISPUTE_OPENED',
        message: `Dispute opened: ${input.reason}`,
      },
    })

    return tx.disputeCase.findUnique({
      where: { id: createdDispute.id },
      include: {
        evidence: true,
        notes: true,
      },
    })
  })

  await notifyTradeParticipants({
    tradeId: input.tradeId,
    excludeUserId: userId,
    type: 'DISPUTE',
    title: 'New dispute opened',
    body: input.reason,
    disputeId: dispute.id,
    data: {
      disputeId: dispute.id,
      tradeId: input.tradeId,
    },
  })

  return dispute
}

export const addDisputeNote = async (userId, disputeId, input) => {
  const dispute = await prisma.disputeCase.findUnique({
    where: { id: disputeId },
    include: {
      trade: {
        include: {
          participants: true,
        },
      },
    },
  })

  if (!dispute) {
    throw new ApiError(404, 'Dispute not found')
  }

  if (!canAccessTrade(dispute.trade, userId)) {
    throw new ApiError(403, 'You are not allowed to add note to this dispute')
  }

  return prisma.disputeNote.create({
    data: {
      disputeId,
      authorId: userId,
      note: input.note,
      isInternal: input.isInternal,
    },
  })
}

export const resolveDispute = async (resolverId, disputeId, input) => {
  const dispute = await prisma.disputeCase.findUnique({
    where: { id: disputeId },
  })

  if (!dispute) {
    throw new ApiError(404, 'Dispute not found')
  }

  return prisma.$transaction(async (tx) => {
    const updatedDispute = await tx.disputeCase.update({
      where: { id: disputeId },
      data: {
        status: input.status,
        resolvedById: resolverId,
        resolutionSummary: input.resolutionSummary,
        resolutionAmount: input.resolutionAmount,
        resolvedAt: new Date(),
      },
    })

    if (input.status === 'RESOLVED_REFUND') {
      await tx.trade.update({
        where: { id: dispute.tradeId },
        data: {
          status: 'CANCELLED',
          escrowStatus: 'REFUNDED',
        },
      })
    }

    if (input.status === 'RESOLVED_RELEASE' || input.status === 'RESOLVED_PARTIAL') {
      await tx.trade.update({
        where: { id: dispute.tradeId },
        data: {
          status: 'COMPLETED',
          escrowStatus: 'RELEASED',
        },
      })
    }

    await tx.tradeActivity.create({
      data: {
        tradeId: dispute.tradeId,
        actorId: resolverId,
        type: 'DISPUTE_RESOLVED',
        message: input.resolutionSummary,
        payload: {
          disputeId,
          status: input.status,
        },
      },
    })

    return updatedDispute
  })
}
