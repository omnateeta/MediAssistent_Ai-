import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ensureMockDoctor } from '@/lib/mock-store'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions as any)
    const s = session as any

    if (!s || !s.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // In temp mode, read from mock store
    if (process.env.USE_TEMP_AUTH === '1') {
      ensureMockDoctor(s.user.id, s.user.name, s.user.email)
      const { mockAppointments } = await import('@/lib/mock-store')
      // In temp mode, we cannot reliably map real doctor IDs to mock ones.
      // Return all appointments to ensure visibility during development.
      const appointments = [...mockAppointments].sort((a, b) => (b.scheduledDate > a.scheduledDate ? 1 : -1))
      return NextResponse.json({ appointments })
    }

    // Find doctor's profile by userId
    const doctorProfile = await prisma.doctorProfile.findUnique({ where: { userId: s.user.id } })
    if (!doctorProfile) return NextResponse.json({ appointments: [] })

    const appointments = await prisma.appointment.findMany({
      where: { doctorId: doctorProfile.id },
      include: {
        patient: { include: { user: true } },
        aiSummary: true,
        prescription: true,
      },
      orderBy: { scheduledDate: 'desc' }
    })

    return NextResponse.json({ appointments })
  } catch (error) {
    console.error('Error fetching doctor appointments:', error)
    return NextResponse.json({ appointments: [] })
  }
}
