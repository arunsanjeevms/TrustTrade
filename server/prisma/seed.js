import bcrypt from 'bcryptjs'
import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const decimal = (value) => new Prisma.Decimal(value)

async function clearDatabase() {
  await prisma.aIScore.deleteMany()
  await prisma.aISummary.deleteMany()
  await prisma.reputationEvent.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.disputeNote.deleteMany()
  await prisma.disputeEvidence.deleteMany()
  await prisma.disputeCase.deleteMany()
  await prisma.escrowTransaction.deleteMany()
  await prisma.tradeFile.deleteMany()
  await prisma.tradeActivity.deleteMany()
  await prisma.tradeMilestone.deleteMany()
  await prisma.tradeParticipant.deleteMany()
  await prisma.walletTransaction.deleteMany()
  await prisma.trade.deleteMany()
  await prisma.wallet.deleteMany()
  await prisma.user.deleteMany()
}

async function createUsers() {
  const passwordHash = await bcrypt.hash('Password@123', 12)

  const [alice, bob, charlie, moderator] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice@trusttrade.dev',
        fullName: 'Alice Seller',
        passwordHash,
        role: 'USER',
        isEmailVerified: true,
        wallet: {
          create: {
            currency: 'USD',
            balance: decimal(500),
          },
        },
      },
      include: {
        wallet: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob@trusttrade.dev',
        fullName: 'Bob Buyer',
        passwordHash,
        role: 'USER',
        isEmailVerified: true,
        wallet: {
          create: {
            currency: 'USD',
            balance: decimal(5000),
          },
        },
      },
      include: {
        wallet: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'charlie@trusttrade.dev',
        fullName: 'Charlie Seller',
        passwordHash,
        role: 'USER',
        isEmailVerified: true,
        wallet: {
          create: {
            currency: 'USD',
            balance: decimal(1400),
          },
        },
      },
      include: {
        wallet: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'mod@trusttrade.dev',
        fullName: 'Maya Moderator',
        passwordHash,
        role: 'MODERATOR',
        isEmailVerified: true,
        wallet: {
          create: {
            currency: 'USD',
            balance: decimal(0),
          },
        },
      },
      include: {
        wallet: true,
      },
    }),
  ])

  return { alice, bob, charlie, moderator }
}

async function createTrades(users) {
  const tradeOne = await prisma.trade.create({
    data: {
      publicId: 'TRD-4821',
      createdById: users.alice.id,
      title: 'MacBook Pro 16 M3',
      description: 'Sealed package, includes charger and protective sleeve.',
      amount: decimal(2580),
      currency: 'USD',
      shippingMethod: 'Express insured',
      status: 'HOLD',
      escrowStatus: 'LOCKED',
      expectedShipBy: new Date('2026-04-22T12:00:00.000Z'),
      expectedDeliveryBy: new Date('2026-04-25T12:00:00.000Z'),
      participants: {
        create: [
          {
            userId: users.alice.id,
            role: 'SELLER',
            status: 'ACCEPTED',
            joinedAt: new Date(),
          },
          {
            userId: users.bob.id,
            role: 'BUYER',
            status: 'ACCEPTED',
            joinedAt: new Date(),
          },
        ],
      },
      milestones: {
        create: [
          {
            title: 'Payment Locked',
            description: 'Buyer deposits full amount in escrow',
            position: 1,
            amount: decimal(2580),
            status: 'APPROVED',
          },
          {
            title: 'Shipment Confirmation',
            description: 'Seller uploads shipment evidence',
            position: 2,
            amount: decimal(2580),
            status: 'IN_REVIEW',
          },
        ],
      },
      activities: {
        create: [
          {
            actorId: users.alice.id,
            type: 'SYSTEM',
            message: 'Trade created and room initialized',
          },
          {
            actorId: users.bob.id,
            type: 'ESCROW_UPDATE',
            message: 'Buyer locked funds in escrow',
          },
        ],
      },
      notifications: {
        create: [
          {
            userId: users.alice.id,
            type: 'TRADE',
            title: 'Buyer joined trade',
            body: 'Bob Buyer joined TRD-4821 as buyer.',
          },
          {
            userId: users.bob.id,
            type: 'TRADE',
            title: 'Seller accepted trade',
            body: 'Alice Seller is preparing shipment details.',
          },
        ],
      },
    },
  })

  const tradeTwo = await prisma.trade.create({
    data: {
      publicId: 'TRD-4822',
      createdById: users.charlie.id,
      title: 'Sony FX30 Kit',
      description: 'Camera body + lens kit in excellent condition.',
      amount: decimal(1740),
      currency: 'USD',
      shippingMethod: 'Tracked priority',
      status: 'DISPUTED',
      escrowStatus: 'LOCKED',
      participants: {
        create: [
          {
            userId: users.charlie.id,
            role: 'SELLER',
            status: 'ACCEPTED',
            joinedAt: new Date(),
          },
          {
            userId: users.bob.id,
            role: 'BUYER',
            status: 'ACCEPTED',
            joinedAt: new Date(),
          },
        ],
      },
      activities: {
        create: [
          {
            actorId: users.charlie.id,
            type: 'SYSTEM',
            message: 'Trade created by seller',
          },
          {
            actorId: users.bob.id,
            type: 'DISPUTE_OPENED',
            message: 'Buyer reported mismatch in shipment condition',
          },
        ],
      },
    },
  })

  return { tradeOne, tradeTwo }
}

async function seedWalletAndEscrow(users, trades) {
  await prisma.wallet.update({
    where: { id: users.bob.wallet.id },
    data: {
      balance: {
        decrement: decimal(4320),
      },
      locked: {
        increment: decimal(4320),
      },
    },
  })

  await prisma.walletTransaction.createMany({
    data: [
      {
        walletId: users.bob.wallet.id,
        tradeId: trades.tradeOne.id,
        type: 'HOLD',
        direction: 'DEBIT',
        status: 'SUCCESS',
        amount: decimal(2580),
        currency: 'USD',
        reference: 'seed-hold-1',
      },
      {
        walletId: users.bob.wallet.id,
        tradeId: trades.tradeTwo.id,
        type: 'HOLD',
        direction: 'DEBIT',
        status: 'SUCCESS',
        amount: decimal(1740),
        currency: 'USD',
        reference: 'seed-hold-2',
      },
    ],
  })

  await prisma.escrowTransaction.createMany({
    data: [
      {
        tradeId: trades.tradeOne.id,
        action: 'LOCK_FUNDS',
        status: 'CONFIRMED',
        amount: decimal(2580),
        currency: 'USD',
        providerReference: 'seed-escrow-lock-1',
      },
      {
        tradeId: trades.tradeTwo.id,
        action: 'LOCK_FUNDS',
        status: 'CONFIRMED',
        amount: decimal(1740),
        currency: 'USD',
        providerReference: 'seed-escrow-lock-2',
      },
    ],
  })
}

async function seedDispute(users, trades) {
  const dispute = await prisma.disputeCase.create({
    data: {
      tradeId: trades.tradeTwo.id,
      openedById: users.bob.id,
      status: 'OPEN',
      reason: 'Package had lens scratches not shown in listing images',
      evidence: {
        create: [
          {
            uploadedById: users.bob.id,
            evidenceType: 'IMAGE',
            description: 'Photo of lens scratches',
            storageKey: 'evidence/trade-two/photo-1.jpg',
            checksumSha256: 'abc123seedlensscratch',
          },
        ],
      },
      notes: {
        create: [
          {
            authorId: users.moderator.id,
            note: 'Moderator review started.',
            isInternal: true,
          },
        ],
      },
      notifications: {
        create: [
          {
            userId: users.charlie.id,
            type: 'DISPUTE',
            title: 'Dispute opened on your trade',
            body: 'Buyer has opened a dispute for TRD-4822.',
          },
        ],
      },
    },
  })

  return dispute
}

async function main() {
  await clearDatabase()
  const users = await createUsers()
  const trades = await createTrades(users)
  await seedWalletAndEscrow(users, trades)
  await seedDispute(users, trades)

  console.log('Seed completed successfully.')
  console.log('Demo users:')
  console.log(' - alice@trusttrade.dev / Password@123')
  console.log(' - bob@trusttrade.dev / Password@123')
  console.log(' - charlie@trusttrade.dev / Password@123')
  console.log(' - mod@trusttrade.dev / Password@123')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
