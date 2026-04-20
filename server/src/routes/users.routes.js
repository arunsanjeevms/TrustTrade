import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { asyncHandler } from '../utils/async-handler.js'
import { sendSuccess } from '../utils/http.js'
import { serializeData } from '../utils/serialize.js'
import { getUserProfile, updateUserProfile } from '../services/user.service.js'

export const usersRouter = Router()

const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100),
  avatarUrl: z.string().url().optional().nullable(),
})

usersRouter.use(requireAuth)

usersRouter.get(
  '/me',
  asyncHandler(async (req, res) => {
    const profile = await getUserProfile(req.user.id)
    return sendSuccess(res, serializeData(profile))
  }),
)

usersRouter.patch(
  '/me',
  validate({ body: updateProfileSchema }),
  asyncHandler(async (req, res) => {
    const profile = await updateUserProfile(req.user.id, req.body)
    return sendSuccess(res, serializeData(profile), 'Profile updated')
  }),
)
