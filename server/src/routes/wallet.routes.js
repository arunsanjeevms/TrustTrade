import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { asyncHandler } from '../utils/async-handler.js'
import { sendSuccess } from '../utils/http.js'
import { serializeData } from '../utils/serialize.js'
import {
  depositFunds,
  getWallet,
  holdFundsForTrade,
  refundFundsForTrade,
  releaseFundsForTrade,
} from '../services/wallet.service.js'
import { notifyTradeParticipants } from '../services/notification.service.js'

export const walletRouter = Router()

const depositSchema = z.object({
  amount: z.coerce.number().positive(),
  currency: z.string().length(3).default('USD'),
  reference: z.string().max(120).optional(),
})

const escrowActionSchema = z.object({
  amount: z.coerce.number().positive().optional(),
  currency: z.string().length(3).default('USD'),
  reference: z.string().max(120).optional(),
})

const tradeParamsSchema = z.object({
  tradeId: z.string().min(1),
})

walletRouter.use(requireAuth)

walletRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const wallet = await getWallet(req.user.id)
    return sendSuccess(res, serializeData(wallet))
  }),
)

walletRouter.post(
  '/deposit',
  validate({ body: depositSchema }),
  asyncHandler(async (req, res) => {
    const wallet = await depositFunds(req.user.id, req.body)
    return sendSuccess(res, serializeData(wallet), 'Funds deposited')
  }),
)

walletRouter.post(
  '/trades/:tradeId/hold',
  validate({ params: tradeParamsSchema, body: escrowActionSchema }),
  asyncHandler(async (req, res) => {
    const result = await holdFundsForTrade(req.user.id, req.params.tradeId, req.body)

    await notifyTradeParticipants({
      tradeId: req.params.tradeId,
      excludeUserId: req.user.id,
      type: 'ESCROW',
      title: 'Escrow funded',
      body: 'Buyer has locked funds in escrow',
      data: { action: 'HOLD' },
    })

    return sendSuccess(res, serializeData(result), 'Funds moved to escrow hold')
  }),
)

walletRouter.post(
  '/trades/:tradeId/release',
  validate({ params: tradeParamsSchema, body: escrowActionSchema }),
  asyncHandler(async (req, res) => {
    const result = await releaseFundsForTrade(req.user.id, req.params.tradeId, req.body)

    await notifyTradeParticipants({
      tradeId: req.params.tradeId,
      excludeUserId: req.user.id,
      type: 'ESCROW',
      title: 'Escrow released',
      body: 'Escrow funds have been released to seller',
      data: { action: 'RELEASE' },
    })

    return sendSuccess(res, serializeData(result), 'Funds released')
  }),
)

walletRouter.post(
  '/trades/:tradeId/refund',
  validate({ params: tradeParamsSchema, body: escrowActionSchema }),
  asyncHandler(async (req, res) => {
    const result = await refundFundsForTrade(req.user.id, req.params.tradeId, req.body)

    await notifyTradeParticipants({
      tradeId: req.params.tradeId,
      excludeUserId: req.user.id,
      type: 'ESCROW',
      title: 'Escrow refunded',
      body: 'Escrow funds have been refunded to buyer',
      data: { action: 'REFUND' },
    })

    return sendSuccess(res, serializeData(result), 'Funds refunded')
  }),
)
