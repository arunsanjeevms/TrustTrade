import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config/env.js'
import { router } from './routes/index.js'
import { errorHandler, notFoundHandler } from './middleware/error-handler.js'

export const app = express()

// In dev mode, allow all origins so mobile devices on LAN can connect.
// In production, respect the CORS_ORIGIN env var (comma-separated list).
const corsOrigin =
  env.NODE_ENV === 'development' || env.CORS_ORIGIN === '*'
    ? true                       // reflect request origin (allow any)
    : env.CORS_ORIGIN.split(',').map((o) => o.trim())

app.use(helmet())
app.use(cors({ origin: corsOrigin, credentials: true }))
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: false }))
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'))

app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'Backend healthy' })
})

app.use('/api/v1', router)

app.use(notFoundHandler)
app.use(errorHandler)
