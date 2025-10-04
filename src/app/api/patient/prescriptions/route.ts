import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'PATIENT') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get or create patient profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { patientProfile: true }
    })

    if (!user || !user.patientProfile) {
      return NextResponse.json({ 
        success: true, 
        prescriptions: [] 
      })
    }

    // Fetch prescriptions for this patient
    const prescriptions = await prisma.prescription.findMany({
      where: {
        appointment: {
          patientId: user.patientProfile.id
        }
      },
      include: {
        medications: true,
        appointment: {
          include: {
            doctor: {
              include: {
                user: {
                  select: { name: true }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Format prescriptions for frontend
    const formattedPrescriptions = prescriptions.map((prescription: any) => ({
      id: prescription.id,
      referenceId: prescription.appointment.referenceId,
      doctorName: prescription.appointment.doctor.user.name || 'Unknown Doctor',
      specialization: prescription.appointment.doctor.specialization?.[0] || 'General Medicine',
      issuedDate: prescription.issuedAt?.toISOString().split('T')[0] || prescription.createdAt.toISOString().split('T')[0],
      status: prescription.status,
      appointmentDate: prescription.appointment.scheduledDate.toISOString().split('T')[0],
      medications: prescription.medications.map((med: any) => ({
        name: med.medicationName,
        dosage: med.dosage,
        frequency: med.frequency,
        instructions: med.instructions
      })),
      instructions: prescription.instructions,
      duration: prescription.duration,
      digitalSignature: prescription.digitalSignature,
      canDownload: prescription.status === 'ISSUED',
      canShare: prescription.status === 'ISSUED',
      canPrint: prescription.status === 'ISSUED'
    }))

    return NextResponse.json({
      success: true,
      prescriptions: formattedPrescriptions
    })

  } catch (error) {
    console.error('Patient prescriptions API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch prescriptions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}