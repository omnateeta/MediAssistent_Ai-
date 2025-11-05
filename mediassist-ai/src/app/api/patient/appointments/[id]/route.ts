import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'PATIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const appointmentId = params.id

    // Get patient profile
    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!patientProfile) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 })
    }

    // Fetch appointment details
    const appointment = await prisma.appointment.findFirst({
      where: {
        OR: [
          { id: appointmentId },
          { referenceId: appointmentId }
        ],
        patientId: patientProfile.id
      },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        patient: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        medicalDocuments: {
          select: {
            id: true,
            fileName: true,
            fileSize: true,
            uploadedAt: true,
            mimeType: true
          }
        },
        aiSummary: true,
        prescription: true
      }
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      appointment
    })

  } catch (error) {
    console.error('Appointment fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointment details' },
      { status: 500 }
    )
  }
}