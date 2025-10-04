import { NextRequest, NextResponse } from 'next/server'
import { getSessionByToken } from '@/lib/tabSessions'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const token = url.searchParams.get('token')
    if (!token) return NextResponse.json({ valid: false }, { status: 400 })
    const s = await getSessionByToken(token)
    if (!s) return NextResponse.json({ valid: false }, { status: 404 })
    return NextResponse.json({ valid: true, session: s })
  } catch (e) {
    return NextResponse.json({ valid: false, error: String(e) }, { status: 500 })
  }
}
