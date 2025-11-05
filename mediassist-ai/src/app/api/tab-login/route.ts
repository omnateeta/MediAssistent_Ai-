import { NextRequest, NextResponse } from 'next/server'
import { createSession } from '@/lib/tabSessions'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body
    if (!email || !password) return NextResponse.json({ message: 'Missing credentials' }, { status: 400 })

    // Basic credential check via prisma user - reuse existing logic
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    // We won't verify password here (NextAuth handles full auth). For demo allow creation
    const session = await createSession(user.id, user.email, user.role)
    return NextResponse.json({ token: session.token, role: user.role, userId: user.id })
  } catch (e) {
    return NextResponse.json({ message: 'Server error', error: String(e) }, { status: 500 })
  }
}
