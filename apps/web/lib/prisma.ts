import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

function createPrismaClient(): PrismaClient {
  if (process.env.TURSO_AUTH_TOKEN && process.env.DATABASE_URL?.startsWith('libsql://')) {
    const adapter = new PrismaLibSQL({
      url: process.env.DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
    return new PrismaClient({ adapter, log: ['error'] })
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
