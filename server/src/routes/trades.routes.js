import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { asyncHandler } from '../utils/async-handler.js'
import { sendSuccess } from '../utils/http.js'
import { serializeData } from '../utils/serialize.js'
import {
  addMilestone,
  addTradeActivity,
  createTrade,
  getTradeById,
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

tradesRouter.use(requireAuth)

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
