import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../utils/async-handler.js'
import { sendSuccess } from '../utils/http.js'
import { serializeData } from '../utils/serialize.js'
import { getDashboardSummary } from '../services/dashboard.service.js'

export const dashboardRouter = Router()

dashboardRouter.use(requireAuth)

dashboardRouter.get(
  '/summary',
  asyncHandler(async (req, res) => {
    const summary = await getDashboardSummary(req.user.id)
    return sendSuccess(res, serializeData(summary))
  }),
)
