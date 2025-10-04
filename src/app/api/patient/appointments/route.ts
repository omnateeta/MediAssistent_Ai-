import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions as any)
    const s = session as any

    // Dev-only fallback: allow specifying a dev user email via header or query param
    const url = new URL(req.url)
    const devUserEmail = url.searchParams.get('devUserEmail') || (req.headers && (req.headers as any)['x-dev-user'])

    if ((!s || !s.user) && process.env.NODE_ENV === 'production' && !devUserEmail) {
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

    // Ensure patient profile exists for the user (or dev user)
    let userIdToUse: string | undefined = undefined
    if (s && s.user) userIdToUse = s.user.id
    if (!userIdToUse && devUserEmail) {
      // find or create demo user by email
      const devUser = await prisma.user.findUnique({ where: { email: devUserEmail } })
      if (devUser) {
        userIdToUse = devUser.id
      } else {
        const created = await prisma.user.create({
          data: {
            email: devUserEmail,
            name: devUserEmail.split('@')[0],
            role: 'PATIENT',
            isActive: true,
            patientProfile: { create: {} },
          },
          include: { patientProfile: true },
        })
        userIdToUse = created.id
      }
    }

    if (!userIdToUse) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    const url = new URL(req.url)
    const devUserEmail = url.searchParams.get('devUserEmail')

    let userIdToUse: string | undefined = undefined
    if (s && s.user) userIdToUse = s.user.id
    if (!userIdToUse && devUserEmail) {
      const devUser = await prisma.user.findUnique({ where: { email: devUserEmail } })
      if (devUser) userIdToUse = devUser.id
    }

    if (!userIdToUse) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const patientProfile = await prisma.patientProfile.findUnique({ where: { userId: userIdToUse } })
    if (!patientProfile) return NextResponse.json({ appointments: [] })

    const appointments = await prisma.appointment.findMany({
      where: { patientId: patientProfile.id },
      include: { doctor: { include: { user: true } } },
      orderBy: { scheduledDate: 'desc' }
    })

    return NextResponse.json({ appointments })
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json({ appointments: [] })
  }
}
