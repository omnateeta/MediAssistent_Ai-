import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions as any)
    const s = session as any

    if (!s || !s.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
