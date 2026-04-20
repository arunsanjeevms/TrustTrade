import { Router } from 'express'
import { z } from 'zod'
import { requireAuth, requireRoles } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { asyncHandler } from '../utils/async-handler.js'
import { sendSuccess } from '../utils/http.js'
import { serializeData } from '../utils/serialize.js'
import {
  addDisputeNote,
  getDisputeById,
  listDisputes,
  openDispute,
  resolveDispute,
} from '../services/dispute.service.js'

export const disputesRouter = Router()

const listDisputesQuerySchema = z.object({
  status: z.enum(['OPEN', 'UNDER_REVIEW', 'RESOLVED_REFUND', 'RESOLVED_RELEASE', 'RESOLVED_PARTIAL', 'REJECTED', 'CLOSED']).optional(),
})

const createDisputeSchema = z.object({
  tradeId: z.string().min(1),
  reason: z.string().min(5).max(500),
  evidence: z
    .array(
      z.object({
        evidenceType: z.enum(['IMAGE', 'PDF', 'VIDEO', 'CHAT_EXPORT', 'OTHER']),
        description: z.string().max(500).optional(),
        storageKey: z.string().max(255).optional(),
        checksumSha256: z.string().max(255).optional(),
      }),
    )
    .optional(),
})

const disputeParamsSchema = z.object({
  disputeId: z.string().min(1),
})

const addNoteSchema = z.object({
  note: z.string().min(1).max(2000),
  isInternal: z.boolean().optional().default(false),
})

const resolveDisputeSchema = z.object({
  status: z.enum(['RESOLVED_REFUND', 'RESOLVED_RELEASE', 'RESOLVED_PARTIAL', 'REJECTED', 'CLOSED']),
  resolutionSummary: z.string().min(5).max(1000),
  resolutionAmount: z.coerce.number().positive().optional(),
})

disputesRouter.use(requireAuth)

disputesRouter.get(
  '/',
  validate({ query: listDisputesQuerySchema }),
  asyncHandler(async (req, res) => {
    const disputes = await listDisputes(req.user.id, req.query)
    return sendSuccess(res, serializeData(disputes))
  }),
)

disputesRouter.post(
  '/',
  validate({ body: createDisputeSchema }),
  asyncHandler(async (req, res) => {
    const dispute = await openDispute(req.user.id, req.body)
    return sendSuccess(res, serializeData(dispute), 'Dispute opened', 201)
  }),
)

disputesRouter.get(
  '/:disputeId',
  validate({ params: disputeParamsSchema }),
  asyncHandler(async (req, res) => {
    const dispute = await getDisputeById(req.user.id, req.params.disputeId)
    return sendSuccess(res, serializeData(dispute))
  }),
)

disputesRouter.post(
  '/:disputeId/notes',
  validate({ params: disputeParamsSchema, body: addNoteSchema }),
  asyncHandler(async (req, res) => {
    const note = await addDisputeNote(req.user.id, req.params.disputeId, req.body)
    return sendSuccess(res, serializeData(note), 'Dispute note added', 201)
  }),
)

disputesRouter.post(
  '/:disputeId/resolve',
  requireRoles('MODERATOR', 'ADMIN'),
  validate({ params: disputeParamsSchema, body: resolveDisputeSchema }),
  asyncHandler(async (req, res) => {
    const dispute = await resolveDispute(req.user.id, req.params.disputeId, req.body)
    return sendSuccess(res, serializeData(dispute), 'Dispute resolved')
  }),
)
