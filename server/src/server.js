import { app } from './app.js'
import { env } from './config/env.js'
import { prisma } from './config/prisma.js'

const server = app.listen(env.PORT, () => {
  console.log(`TrustTrade backend running on http://localhost:${env.PORT}`)
})

const shutdown = async (signal) => {
  console.log(`Received ${signal}, shutting down gracefully...`)
  server.close(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
