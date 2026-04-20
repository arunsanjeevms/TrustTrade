import { Prisma } from '@prisma/client'
import { prisma } from '../config/prisma.js'
import { ApiError } from '../utils/http.js'

const toDecimal = (value) => new Prisma.Decimal(value)

const getTradeWithParticipants = async (tradeId) => {
  const trade = await prisma.trade.findUnique({
    where: { id: tradeId },
    include: {
      participants: true,
    },
  })

  if (!trade) {
    throw new ApiError(404, 'Trade not found')
  }

  return trade
}

export const getWallet = async (userId) => {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 30,
      },
    },
  })

  if (!wallet) {
    throw new ApiError(404, 'Wallet not found')
  }

  return wallet
}

export const depositFunds = async (userId, input) => {
  const amount = toDecimal(input.amount)

  return prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.update({
      where: { userId },
      data: {
        balance: {
          increment: amount,
        },
      },
    })

    await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'DEPOSIT',
        direction: 'CREDIT',
        status: 'SUCCESS',
        amount,
        currency: input.currency,
        reference: input.reference,
      },
    })

    return tx.wallet.findUnique({
      where: { id: wallet.id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 30,
        },
      },
    })
  })
}

export const holdFundsForTrade = async (userId, tradeId, input = {}) => {
  const trade = await getTradeWithParticipants(tradeId)

  const buyerParticipant = trade.participants.find((participant) => {
    return participant.userId === userId && participant.role === 'BUYER' && participant.status === 'ACCEPTED'
  })

  if (!buyerParticipant) {
    throw new ApiError(403, 'Only accepted buyer can lock funds for this trade')
  }

  const amount = toDecimal(input.amount ?? trade.amount)

  return prisma.$transaction(async (tx) => {
    const buyerWallet = await tx.wallet.findUnique({ where: { userId } })
    if (!buyerWallet) {
      throw new ApiError(404, 'Buyer wallet not found')
    }

    const updated = await tx.wallet.updateMany({
      where: {
        id: buyerWallet.id,
        balance: {
          gte: amount,
        },
      },
      data: {
        balance: {
          decrement: amount,
        },
        locked: {
          increment: amount,
        },
      },
    })

    if (updated.count === 0) {
      throw new ApiError(400, 'Insufficient wallet balance')
    }

    await tx.walletTransaction.create({
      data: {
        walletId: buyerWallet.id,
        tradeId,
        type: 'HOLD',
        direction: 'DEBIT',
        status: 'SUCCESS',
        amount,
        currency: trade.currency,
        reference: input.reference,
      },
    })

    await tx.escrowTransaction.create({
      data: {
        tradeId,
        action: 'LOCK_FUNDS',
        status: 'CONFIRMED',
        amount,
        currency: trade.currency,
        providerReference: input.reference,
      },
    })

    await tx.trade.update({
      where: { id: tradeId },
      data: {
        escrowStatus: 'LOCKED',
        status: trade.status === 'PENDING_JOIN' ? 'HOLD' : trade.status,
      },
    })

    await tx.tradeActivity.create({
      data: {
        tradeId,
        actorId: userId,
        type: 'ESCROW_UPDATE',
        message: 'Buyer locked funds into escrow',
      },
    })

    const [wallet, tradeSnapshot] = await Promise.all([
      tx.wallet.findUnique({
        where: { id: buyerWallet.id },
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 30,
          },
        },
      }),
      tx.trade.findUnique({
        where: { id: tradeId },
      }),
    ])

    return { wallet, trade: tradeSnapshot }
  })
}

export const releaseFundsForTrade = async (actorId, tradeId, input = {}) => {
  const trade = await getTradeWithParticipants(tradeId)
  const amount = toDecimal(input.amount ?? trade.amount)

  const buyer = trade.participants.find((participant) => participant.role === 'BUYER' && participant.status === 'ACCEPTED')
  const seller =
    trade.participants.find((participant) => participant.role === 'SELLER' && participant.status === 'ACCEPTED') ??
    { userId: trade.createdById }

  if (!buyer) {
    throw new ApiError(400, 'Buyer not found for this trade')
  }

  const actor = await prisma.user.findUnique({
    where: { id: actorId },
    select: { id: true, role: true },
  })

  if (!actor) {
    throw new ApiError(404, 'Actor not found')
  }

  const isModerator = actor.role === 'ADMIN' || actor.role === 'MODERATOR'
  const isAcceptedBuyer = buyer.userId === actorId

  if (!isModerator && !isAcceptedBuyer) {
    throw new ApiError(403, 'Only accepted buyer or moderator can release escrow funds')
  }

  return prisma.$transaction(async (tx) => {
    const [buyerWallet, sellerWallet] = await Promise.all([
      tx.wallet.findUnique({ where: { userId: buyer.userId } }),
      tx.wallet.findUnique({ where: { userId: seller.userId } }),
    ])

    if (!buyerWallet || !sellerWallet) {
      throw new ApiError(404, 'Wallet not found for one or more participants')
    }

    const buyerUpdate = await tx.wallet.updateMany({
      where: {
        id: buyerWallet.id,
        locked: {
          gte: amount,
        },
      },
      data: {
        locked: {
          decrement: amount,
        },
      },
    })

    if (buyerUpdate.count === 0) {
      throw new ApiError(400, 'Insufficient locked escrow funds')
    }

    await tx.wallet.update({
      where: { id: sellerWallet.id },
      data: {
        balance: {
          increment: amount,
        },
        released: {
          increment: amount,
        },
      },
    })

    await tx.walletTransaction.createMany({
      data: [
        {
          walletId: buyerWallet.id,
          tradeId,
          type: 'RELEASE',
          direction: 'DEBIT',
          status: 'SUCCESS',
          amount,
          currency: trade.currency,
          reference: input.reference,
        },
        {
          walletId: sellerWallet.id,
          tradeId,
          type: 'RELEASE',
          direction: 'CREDIT',
          status: 'SUCCESS',
          amount,
          currency: trade.currency,
          reference: input.reference,
        },
      ],
    })

    await tx.escrowTransaction.create({
      data: {
        tradeId,
        action: 'RELEASE_FUNDS',
        status: 'CONFIRMED',
        amount,
        currency: trade.currency,
        providerReference: input.reference,
      },
    })

    await tx.trade.update({
      where: { id: tradeId },
      data: {
        escrowStatus: 'RELEASED',
        status: ['CANCELLED', 'DISPUTED'].includes(trade.status) ? trade.status : 'COMPLETED',
      },
    })

    await tx.tradeActivity.create({
      data: {
        tradeId,
        actorId,
        type: 'ESCROW_UPDATE',
        message: 'Escrow funds released to seller',
      },
    })

    const [updatedBuyerWallet, updatedSellerWallet, tradeSnapshot] = await Promise.all([
      tx.wallet.findUnique({ where: { id: buyerWallet.id } }),
      tx.wallet.findUnique({ where: { id: sellerWallet.id } }),
      tx.trade.findUnique({ where: { id: tradeId } }),
    ])

    return {
      buyerWallet: updatedBuyerWallet,
      sellerWallet: updatedSellerWallet,
      trade: tradeSnapshot,
    }
  })
}

export const refundFundsForTrade = async (actorId, tradeId, input = {}) => {
  const trade = await getTradeWithParticipants(tradeId)
  const amount = toDecimal(input.amount ?? trade.amount)

  const buyer = trade.participants.find((participant) => participant.role === 'BUYER' && participant.status === 'ACCEPTED')
  if (!buyer) {
    throw new ApiError(400, 'Buyer not found for this trade')
  }

  const seller =
    trade.participants.find((participant) => participant.role === 'SELLER' && participant.status === 'ACCEPTED') ??
    { userId: trade.createdById }

  const actor = await prisma.user.findUnique({
    where: { id: actorId },
    select: { id: true, role: true },
  })

  if (!actor) {
    throw new ApiError(404, 'Actor not found')
  }

  const isModerator = actor.role === 'ADMIN' || actor.role === 'MODERATOR'
  const isAcceptedSeller = seller.userId === actorId

  if (!isModerator && !isAcceptedSeller) {
    throw new ApiError(403, 'Only accepted seller or moderator can refund escrow funds')
  }

  return prisma.$transaction(async (tx) => {
    const buyerWallet = await tx.wallet.findUnique({ where: { userId: buyer.userId } })
    if (!buyerWallet) {
      throw new ApiError(404, 'Buyer wallet not found')
    }

    const buyerUpdate = await tx.wallet.updateMany({
      where: {
        id: buyerWallet.id,
        locked: {
          gte: amount,
        },
      },
      data: {
        locked: {
          decrement: amount,
        },
        balance: {
          increment: amount,
        },
      },
    })

    if (buyerUpdate.count === 0) {
      throw new ApiError(400, 'Insufficient locked escrow funds')
    }

    await tx.walletTransaction.create({
      data: {
        walletId: buyerWallet.id,
        tradeId,
        type: 'REFUND',
        direction: 'CREDIT',
        status: 'SUCCESS',
        amount,
        currency: trade.currency,
        reference: input.reference,
      },
    })

    await tx.escrowTransaction.create({
      data: {
        tradeId,
        action: 'REFUND_FUNDS',
        status: 'CONFIRMED',
        amount,
        currency: trade.currency,
        providerReference: input.reference,
      },
    })

    await tx.trade.update({
      where: { id: tradeId },
      data: {
        escrowStatus: 'REFUNDED',
        status: 'CANCELLED',
      },
    })

    await tx.tradeActivity.create({
      data: {
        tradeId,
        actorId,
        type: 'ESCROW_UPDATE',
        message: 'Escrow funds refunded to buyer',
      },
    })

    const [wallet, tradeSnapshot] = await Promise.all([
      tx.wallet.findUnique({ where: { id: buyerWallet.id } }),
      tx.trade.findUnique({ where: { id: tradeId } }),
    ])

    return { wallet, trade: tradeSnapshot }
  })
}
