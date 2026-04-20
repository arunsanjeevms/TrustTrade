import { prisma } from '../config/prisma.js'

const ACTIVE_STATUSES = ['PENDING_JOIN', 'HOLD', 'SHIPPED', 'DELIVERED', 'DISPUTED']

export const getDashboardSummary = async (userId) => {
  const [
    activeTrades,
    pendingActions,
    completedTrades,
    cancelledTrades,
    lockedEscrow,
    recentActivity,
    myTrades,
  ] = await Promise.all([
    prisma.trade.count({
      where: {
        status: { in: ACTIVE_STATUSES },
        OR: [{ createdById: userId }, { participants: { some: { userId } } }],
      },
    }),
    prisma.trade.count({
      where: {
        status: { in: ['HOLD', 'SHIPPED', 'DELIVERED'] },
        OR: [{ createdById: userId }, { participants: { some: { userId } } }],
      },
    }),
    prisma.trade.count({
      where: {
        status: 'COMPLETED',
        OR: [{ createdById: userId }, { participants: { some: { userId } } }],
      },
    }),
    prisma.trade.count({
      where: {
        status: 'CANCELLED',
        OR: [{ createdById: userId }, { participants: { some: { userId } } }],
      },
    }),
    prisma.trade.aggregate({
      where: {
        escrowStatus: 'LOCKED',
        OR: [{ createdById: userId }, { participants: { some: { userId } } }],
      },
      _sum: {
        amount: true,
      },
    }),
    prisma.tradeActivity.findMany({
      where: {
        trade: {
          OR: [{ createdById: userId }, { participants: { some: { userId } } }],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    }),
    prisma.trade.findMany({
      where: {
        OR: [{ createdById: userId }, { participants: { some: { userId } } }],
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 5,
      include: {
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
      },
    }),
  ])

  const denominator = completedTrades + cancelledTrades
  const successRate = denominator === 0 ? 0 : Number(((completedTrades / denominator) * 100).toFixed(2))

  return {
    stats: {
      activeTrades,
      escrowVolume: lockedEscrow._sum.amount ?? 0,
      successRate,
      pendingActions,
    },
    recentActivity,
    recentTrades: myTrades,
  }
}
