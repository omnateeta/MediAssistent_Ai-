import NextAuth from "next-auth"
import { isPrismaClientReady } from "@/lib/prisma"

console.log('[Auth Route] Environment check:')
console.log('[Auth Route] isPrismaClientReady:', isPrismaClientReady)
console.log('[Auth Route] DATABASE_URL exists:', !!process.env.DATABASE_URL)
console.log('[Auth Route] USE_TEMP_AUTH:', process.env.USE_TEMP_AUTH)
console.log('[Auth Route] NODE_ENV:', process.env.NODE_ENV)

let authOptions: any

// Decide whether to use temporary auth based on environment flags
const shouldUseTempAuth =
	isPrismaClientReady === false ||
	!process.env.DATABASE_URL ||
	process.env.USE_TEMP_AUTH === '1'

console.log('[Auth Route] shouldUseTempAuth:', shouldUseTempAuth)

if (shouldUseTempAuth) {
	const reason = !isPrismaClientReady
		? 'Prisma client not generated or failed to load'
		: !process.env.DATABASE_URL
			? 'DATABASE_URL missing'
			: 'USE_TEMP_AUTH=1 override'
	console.warn(`[Auth Route] Using temporary in-memory auth (${reason})`)
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const temp = require('@/lib/auth-temp')
	authOptions = temp.authOptions
} else {
	console.log('[Auth Route] Using real database-backed auth')
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
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }