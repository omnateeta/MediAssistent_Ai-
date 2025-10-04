import NextAuth from "next-auth"

// Try to use the real Prisma-backed auth options. If Prisma client hasn't been
// generated in this environment (common during local setup), fall back to the
// temporary in-memory auth options so sign-in UI remains functional for testing.
let authOptions: any
try {
	// Use require to avoid module-eval problems at import time
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const real = require('@/lib/auth')
	authOptions = real.authOptions
} catch (err) {
	console.warn('Failed to load Prisma-backed auth options, falling back to auth-temp:', String(err))
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const temp = require('@/lib/auth-temp')
	authOptions = temp.authOptions
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
