import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler } from '../utils/async-handler.js'
import { sendSuccess } from '../utils/http.js'
import { validate } from '../middleware/validate.js'
import { loginUser, registerUser } from '../services/auth.service.js'
import { signAccessToken } from '../utils/jwt.js'

export const authRouter = Router()

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2).max(100),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

authRouter.post(
  '/register',
  validate({ body: registerSchema }),
  asyncHandler(async (req, res) => {
    const user = await registerUser(req.body)
    const token = signAccessToken(user)

    return sendSuccess(
      res,
      {
        user,
        token,
      },
      'Registered successfully',
      201,
    )
  }),
)

authRouter.post(
  '/login',
  validate({ body: loginSchema }),
  asyncHandler(async (req, res) => {
    const user = await loginUser(req.body)
    const token = signAccessToken(user)

    return sendSuccess(
      res,
      {
        user,
        token,
      },
      'Login successful',
    )
  }),
)
