import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { asyncHandler } from '../utils/async-handler.js'
import { ApiError, sendSuccess } from '../utils/http.js'
import { serializeData } from '../utils/serialize.js'
import { parseTradeQrToken } from '../utils/trade-qr.js'
import { registerTradeStream } from '../utils/trade-stream.js'
import {
  addMilestone,
  addTradeActivity,
  closeTradeRoom,
  confirmDeliveryByPublicId,
  createTrade,
  getTradeQrPayload,
  getTradeById,
  joinTradeByPublicId,
  joinTrade,
  listTradeActivities,
  listTrades,
  updateTradeStatus,
} from '../services/trade.service.js'
import { notifyTradeParticipants } from '../services/notification.service.js'

export const tradesRouter = Router()

const dateFromInput = z.preprocess((value) => {
  if (!value) {
    return undefined
  }

  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? undefined : date
}, z.date().optional())

const listTradesQuerySchema = z.object({
  status: z.enum(['PENDING_JOIN', 'HOLD', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'DISPUTED']).optional(),
  search: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
})

const createTradeSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(2000),
  amount: z.coerce.number().positive(),
  currency: z.string().length(3).default('USD'),
  shippingMethod: z.string().min(2).max(100),
  expectedShipBy: dateFromInput,
  expectedDeliveryBy: dateFromInput,
  role: z.enum(['BUYER', 'SELLER']).default('SELLER'),
})

const tradeIdParamsSchema = z.object({
  tradeId: z.string().min(1),
})

const joinTradeSchema = z.object({
  role: z.enum(['BUYER', 'SELLER']).default('BUYER'),
})

const updateStatusSchema = z.object({
  status: z.enum(['HOLD', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'DISPUTED']),
  note: z.string().max(500).optional(),
})

const addActivitySchema = z.object({
  message: z.string().min(1).max(1000),
  payload: z.record(z.any()).optional(),
})

const addMilestoneSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().max(1000).optional(),
  amount: z.coerce.number().positive().optional(),
  dueAt: dateFromInput,
  position: z.coerce.number().int().positive().optional(),
})

const qrJoinSchema = z.object({
  token: z.string().min(8).optional(),
  publicId: z.string().min(4).optional(),
  role: z.enum(['BUYER', 'SELLER']).default('BUYER'),
})

const qrConfirmSchema = z.object({
  token: z.string().min(8).optional(),
  publicId: z.string().min(4).optional(),
})

const resolveQrPublicId = ({ token, publicId }) => {
  if (publicId) {
    return publicId
  }

  if (!token) {
    throw new ApiError(400, 'QR token or trade ID is required')
  }

  const parsed = parseTradeQrToken(token)
  if (!parsed) {
    throw new ApiError(400, 'Invalid QR token')
  }

  return parsed.publicId
}

tradesRouter.use(requireAuth)

tradesRouter.get(
  '/:tradeId/stream',
  validate({ params: tradeIdParamsSchema }),
  asyncHandler(async (req, res) => {
    await getTradeById(req.user.id, req.params.tradeId)

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    if (typeof res.flushHeaders === 'function') {
      res.flushHeaders()
    }

    registerTradeStream(req.params.tradeId, res)
  }),
)

tradesRouter.get(
  '/',
  validate({ query: listTradesQuerySchema }),
  asyncHandler(async (req, res) => {
    const response = await listTrades(req.user.id, req.query)
    return sendSuccess(res, serializeData(response))
  }),
)

tradesRouter.post(
  '/',
  validate({ body: createTradeSchema }),
  asyncHandler(async (req, res) => {
    const trade = await createTrade(req.user.id, req.body)
    return sendSuccess(res, serializeData(trade), 'Trade created', 201)
  }),
)

tradesRouter.get(
  '/:tradeId/qr',
  validate({ params: tradeIdParamsSchema }),
  asyncHandler(async (req, res) => {
    const payload = await getTradeQrPayload(req.user.id, req.params.tradeId)
    return sendSuccess(res, serializeData(payload))
  }),
)

tradesRouter.post(
  '/qr/join',
  validate({ body: qrJoinSchema }),
  asyncHandler(async (req, res) => {
    const publicId = resolveQrPublicId(req.body)
    const trade = await joinTradeByPublicId(req.user.id, publicId, req.body)

    await notifyTradeParticipants({
      tradeId: trade.id,
      excludeUserId: req.user.id,
      type: 'TRADE',
      title: 'Participant joined trade',
      body: `${req.user.email} joined as ${req.body.role}`,
      data: { role: req.body.role },
    })

    return sendSuccess(res, serializeData(trade), 'Joined trade successfully')
  }),
)

tradesRouter.post(
  '/qr/confirm-delivery',
  validate({ body: qrConfirmSchema }),
  asyncHandler(async (req, res) => {
    const publicId = resolveQrPublicId(req.body)
    const trade = await confirmDeliveryByPublicId(req.user.id, publicId)

    await notifyTradeParticipants({
      tradeId: trade.id,
      excludeUserId: req.user.id,
      type: 'TRADE',
      title: 'Delivery confirmed',
      body: 'Buyer confirmed delivery via QR scan',
      data: { status: trade.status },
    })

    return sendSuccess(res, serializeData(trade), 'Delivery confirmed')
  }),
)

tradesRouter.get(
  '/:tradeId',
  validate({ params: tradeIdParamsSchema }),
  asyncHandler(async (req, res) => {
    const trade = await getTradeById(req.user.id, req.params.tradeId)
    return sendSuccess(res, serializeData(trade))
  }),
)

tradesRouter.post(
  '/:tradeId/join',
  validate({ params: tradeIdParamsSchema, body: joinTradeSchema }),
  asyncHandler(async (req, res) => {
    const trade = await joinTrade(req.user.id, req.params.tradeId, req.body)

    await notifyTradeParticipants({
      tradeId: req.params.tradeId,
      excludeUserId: req.user.id,
      type: 'TRADE',
      title: 'Participant joined trade',
      body: `${req.user.email} joined as ${req.body.role}`,
      data: { role: req.body.role },
    })

    return sendSuccess(res, serializeData(trade), 'Joined trade successfully')
  }),
)

tradesRouter.post(
  '/:tradeId/close',
  validate({ params: tradeIdParamsSchema }),
  asyncHandler(async (req, res) => {
    const trade = await closeTradeRoom(req.user.id, req.params.tradeId)

    await notifyTradeParticipants({
      tradeId: req.params.tradeId,
      excludeUserId: req.user.id,
      type: 'TRADE',
      title: 'Trade room closed',
      body: 'Trade room is now closed',
      data: { roomClosed: true },
    })

    return sendSuccess(res, serializeData(trade), 'Trade room closed')
  }),
)

tradesRouter.post(
  '/:tradeId/status',
  validate({ params: tradeIdParamsSchema, body: updateStatusSchema }),
  asyncHandler(async (req, res) => {
    const trade = await updateTradeStatus(req.user.id, req.params.tradeId, req.body)

    await notifyTradeParticipants({
      tradeId: req.params.tradeId,
      excludeUserId: req.user.id,
      type: 'TRADE',
      title: 'Trade status updated',
      body: `Status changed to ${req.body.status}`,
      data: { status: req.body.status },
    })

    return sendSuccess(res, serializeData(trade), 'Trade status updated')
  }),
)

tradesRouter.get(
  '/:tradeId/activities',
  validate({ params: tradeIdParamsSchema }),
  asyncHandler(async (req, res) => {
    const items = await listTradeActivities(req.user.id, req.params.tradeId)
    return sendSuccess(res, serializeData(items))
  }),
)

tradesRouter.post(
  '/:tradeId/activities',
  validate({ params: tradeIdParamsSchema, body: addActivitySchema }),
  asyncHandler(async (req, res) => {
    const item = await addTradeActivity(req.user.id, req.params.tradeId, req.body)
    return sendSuccess(res, serializeData(item), 'Activity added', 201)
  }),
)

tradesRouter.post(
  '/:tradeId/milestones',
  validate({ params: tradeIdParamsSchema, body: addMilestoneSchema }),
  asyncHandler(async (req, res) => {
    const milestone = await addMilestone(req.user.id, req.params.tradeId, req.body)
    return sendSuccess(res, serializeData(milestone), 'Milestone added', 201)
  }),
)

tradesRouter.post(
  '/:tradeId/resolve-dispute',
  validate({ params: tradeIdParamsSchema, body: z.object({ resolution: z.enum(['SELLER', 'BUYER']) }) }),
  asyncHandler(async (req, res) => {
    const { resolveDispute } = await import('../services/trade.service.js')
    const trade = await resolveDispute(req.user.id, req.params.tradeId, req.body)
    return sendSuccess(res, serializeData(trade), 'Dispute resolved')
  }),
)
