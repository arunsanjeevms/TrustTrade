import { Router } from 'express'
import { authRouter } from './auth.routes.js'
import { usersRouter } from './users.routes.js'
import { tradesRouter } from './trades.routes.js'
import { walletRouter } from './wallet.routes.js'
import { disputesRouter } from './disputes.routes.js'
import { notificationsRouter } from './notifications.routes.js'
import { dashboardRouter } from './dashboard.routes.js'

export const router = Router()

router.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'TrustTrade API v1',
  })
})

router.use('/auth', authRouter)
router.use('/users', usersRouter)
router.use('/trades', tradesRouter)
router.use('/wallet', walletRouter)
router.use('/disputes', disputesRouter)
router.use('/notifications', notificationsRouter)
router.use('/dashboard', dashboardRouter)
