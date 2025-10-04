// Defensive import of Prisma Client so we can show a helpful error when the
// generated client is missing (common during initial setup).
let PrismaClientClass: any
let requireError: any = null
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  PrismaClientClass = require('@prisma/client').PrismaClient
} catch (e) {
  requireError = e
}

const helpfulMessage = `@prisma/client did not initialize yet. Please run "npm run db:generate" or "prisma generate" and restart the server. Original error: ${String(requireError)}`

// If Prisma client loaded properly, initialize singleton. Otherwise export a proxy
// object that throws a helpful error when any property is accessed or a method is
// invoked. This prevents module-evaluation-time crashes while keeping the same
// `export const prisma` API shape for callers.
let prismaInstance: any = null
export const isPrismaClientReady = Boolean(PrismaClientClass)
if (PrismaClientClass) {
  const globalForPrisma = globalThis as unknown as { prisma?: any }
  prismaInstance = globalForPrisma.prisma ?? new PrismaClientClass({ log: ['query'] })
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaInstance
} else {
  const handler: ProxyHandler<any> = {
    get() {
      throw new Error(helpfulMessage)
    },
    apply() {
      throw new Error(helpfulMessage)
    },
    construct() {
      throw new Error(helpfulMessage)
    }
  }
  prismaInstance = new Proxy(() => {}, handler)
}

export const prisma = prismaInstance
