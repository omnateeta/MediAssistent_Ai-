import { NextResponse, NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, context: { params: any }) {
  try {
    const session = await getServerSession(authOptions as any)
    const s = session as any

    if (!s || !s.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

  // context.params may be a Promise in some Next.js typings/runtime, so normalize
  const params = await Promise.resolve(context.params)
  const appointmentId = params?.id
    if (!appointmentId) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const userId = s.user.id as string

    const patientProfile = await prisma.patientProfile.findUnique({ where: { userId } })
    if (!patientProfile) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { doctor: { include: { user: true } }, aiSummary: true, prescription: true }
    })

    if (!appointment || appointment.patientId !== patientProfile.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ appointment })
  } catch (error) {
    console.error('Error fetching appointment by id:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
