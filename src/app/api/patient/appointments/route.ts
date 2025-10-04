import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions as any)
    const s = session as any

    // Require an authenticated session for creating appointments
    if (!s || !s.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    const {
      doctorId,
      appointmentDate,
      appointmentTime,
      chiefComplaint,
      symptoms,
      symptomDuration,
      painLevel,
    } = body

    if (!doctorId || !appointmentDate || !appointmentTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Use authenticated session's user id and ensure patient profile exists
    const userIdToUse = s.user.id as string

    let patientProfile = await prisma.patientProfile.findUnique({ where: { userId: userIdToUse } })
    if (!patientProfile) {
      patientProfile = await prisma.patientProfile.create({ data: { userId: userIdToUse } })
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: patientProfile.id,
        doctorId: doctorId,
        scheduledDate: new Date(`${appointmentDate}T${appointmentTime}:00`),
        chiefComplaint: chiefComplaint ?? undefined,
        // store free-text symptoms inside a small object for JSON field
        symptoms: symptoms ? { text: symptoms } : undefined,
        symptomDuration: symptomDuration ?? undefined,
        painLevel: painLevel ?? 1,
        status: 'SCHEDULED',
      }
    })

    return NextResponse.json({ appointment }, { status: 201 })
  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions as any)
    const s = session as any
    // Require an authenticated session for listing appointments
    if (!s || !s.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userIdToUse = s.user.id as string

    const patientProfile = await prisma.patientProfile.findUnique({ where: { userId: userIdToUse } })
    if (!patientProfile) return NextResponse.json({ appointments: [] })

    const appointments = await prisma.appointment.findMany({
      where: { patientId: patientProfile.id },
      include: {
        doctor: { include: { user: true } },
        aiSummary: true,
        prescription: true,
      },
      orderBy: { scheduledDate: 'desc' }
    })

    return NextResponse.json({ appointments })
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json({ appointments: [] })
  }
}
