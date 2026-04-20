import { prisma } from '../config/prisma.js'

export const createNotification = async ({
  userId,
  type = 'SYSTEM',
  title,
  body,
  tradeId,
  disputeId,
  data,
}) => {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      body,
      tradeId,
      disputeId,
      data,
    },
  })
}

export const notifyTradeParticipants = async ({
  tradeId,
  excludeUserId,
  type = 'TRADE',
  title,
  body,
  data,
  disputeId,
}) => {
  const trade = await prisma.trade.findUnique({
    where: { id: tradeId },
    include: {
      participants: true,
    },
  })

  if (!trade) {
    return []
  }

  const recipients = new Set([trade.createdById])
  for (const participant of trade.participants) {
    recipients.add(participant.userId)
  }

  if (excludeUserId) {
    recipients.delete(excludeUserId)
  }

  const result = []
  for (const userId of recipients) {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body,
        tradeId,
        disputeId,
        data,
      },
    })

    result.push(notification)
  }

  return result
}

export const listNotifications = async (userId, { unreadOnly = false, limit = 50 }) => {
  return prisma.notification.findMany({
    where: {
      userId,
      ...(unreadOnly ? { readAt: null } : {}),
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  })
}

export const markNotificationRead = async (userId, notificationId) => {
  return prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  })
}

export const markAllNotificationsRead = async (userId) => {
  return prisma.notification.updateMany({
    where: {
      userId,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  })
}
