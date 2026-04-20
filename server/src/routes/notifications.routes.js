import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { asyncHandler } from '../utils/async-handler.js'
import { sendSuccess } from '../utils/http.js'
import { serializeData } from '../utils/serialize.js'
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/notification.service.js'

export const notificationsRouter = Router()

const notificationsQuerySchema = z.object({
  unreadOnly: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => (value ? value === 'true' : false)),
  limit: z.coerce.number().int().min(1).max(100).optional(),
})

const notificationParamsSchema = z.object({
  notificationId: z.string().min(1),
})

notificationsRouter.use(requireAuth)

notificationsRouter.get(
  '/',
  validate({ query: notificationsQuerySchema }),
  asyncHandler(async (req, res) => {
    const notifications = await listNotifications(req.user.id, req.query)
    return sendSuccess(res, serializeData(notifications))
  }),
)

notificationsRouter.post(
  '/:notificationId/read',
  validate({ params: notificationParamsSchema }),
  asyncHandler(async (req, res) => {
    const result = await markNotificationRead(req.user.id, req.params.notificationId)
    return sendSuccess(res, serializeData(result), 'Notification marked as read')
  }),
)

notificationsRouter.post(
  '/read-all',
  asyncHandler(async (req, res) => {
    const result = await markAllNotificationsRead(req.user.id)
    return sendSuccess(res, serializeData(result), 'All notifications marked as read')
  }),
)
