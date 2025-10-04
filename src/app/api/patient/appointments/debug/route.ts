import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'PATIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get patient profile
    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!patientProfile) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 })
    }

    // Get recent appointments with full details
    const appointments = await prisma.appointment.findMany({
      where: { patientId: patientProfile.id },
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
        medicalDocuments: {
          select: {
            id: true,
            fileName: true,
            fileSize: true,
            uploadedAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    return NextResponse.json({
      success: true,
      patientId: patientProfile.id,
      appointmentCount: appointments.length,
      appointments: appointments.map(apt => ({
        id: apt.id,
        referenceId: apt.referenceId,
        scheduledDate: apt.scheduledDate,
        status: apt.status,
        chiefComplaint: apt.chiefComplaint,
        symptoms: apt.symptoms,
        doctorName: apt.doctor.user.name,
        specialization: apt.doctor.specialization,
        hasVoiceNote: !!apt.patientVoiceNote,
        documentCount: apt.medicalDocuments.length,
        createdAt: apt.createdAt
      }))
    })

  } catch (error) {
    console.error('Debug appointments error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointments', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}