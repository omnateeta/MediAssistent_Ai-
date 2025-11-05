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
    
    console.log('Appointment detail API called with ID:', params.id)
    console.log('Session:', session ? 'Present' : 'Missing')

    if (!session?.user) {
      console.log('Unauthorized: No session or user')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'DOCTOR') {
      console.log('Access denied: User is not a doctor')
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const appointmentId = params.id
    console.log('Looking for appointment with ID:', appointmentId)
    
    // Validate appointment ID
    if (!appointmentId || typeof appointmentId !== 'string' || appointmentId.length < 20) {
      console.log('Invalid appointment ID:', appointmentId)
      return NextResponse.json({ error: 'Invalid appointment ID' }, { status: 400 })
    }

    // Fetch appointment with all related data
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        doctor: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        },
        aiSummary: true,
        prescription: {
          include: {
            medications: true
          }
        },
        uploadedFiles: true
      }
    })

    if (!appointment) {
      console.log('Appointment not found in database for ID:', appointmentId)
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    console.log('Found appointment:', {
      id: appointment.id,
      doctorId: appointment.doctorId,
      patientId: appointment.patientId
    })

    // Check if this doctor owns the appointment
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: session.user.id }
    })

    console.log('Doctor profile lookup:', {
      sessionUserId: session.user.id,
      foundDoctorProfile: !!doctorProfile,
      doctorProfileId: doctorProfile?.id
    })

    if (!doctorProfile) {
      console.log('Access denied: Doctor profile not found for user')
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    if (appointment.doctorId !== doctorProfile.id) {
      console.log('Access denied: Doctor does not own this appointment', {
        appointmentDoctorId: appointment.doctorId,
        doctorProfileId: doctorProfile.id
      })
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Calculate patient age from dateOfBirth if available
    let patientAge = null
    if (appointment.patient.dateOfBirth) {
      const today = new Date()
      const birthDate = new Date(appointment.patient.dateOfBirth)
      patientAge = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        patientAge--
      }
    }

    // Format the response
    const appointmentDetail = {
      id: appointment.id,
      referenceId: appointment.referenceId,
      patientName: appointment.patient.user.name || 'Unknown Patient',
      patientAge: patientAge,
      patientGender: appointment.patient.gender || 'Not specified',
      contactInfo: appointment.patient.phoneNumber || 'Not provided',
      email: appointment.patient.user.email,
      scheduledDate: appointment.scheduledDate.toISOString().split('T')[0],
      scheduledTime: appointment.scheduledDate.toTimeString().slice(0, 5),
      status: appointment.status,
      urgencyLevel: appointment.aiSummary?.urgencyLevel || 'LOW',
      chiefComplaint: appointment.chiefComplaint || 'No chief complaint',
      
      // Parse symptoms from JSON if stored as JSON, otherwise treat as string
      symptoms: (() => {
        if (!appointment.symptoms) return []
        if (typeof appointment.symptoms === 'object' && appointment.symptoms.text) {
          return [appointment.symptoms.text]
        }
        if (typeof appointment.symptoms === 'string') {
          return [appointment.symptoms]
        }
        if (Array.isArray(appointment.symptoms)) {
          return appointment.symptoms
        }
        return []
      })(),
      
      medicalHistory: appointment.patient.chronicConditions || [],
      currentMedications: appointment.patient.currentMedications || [],
      allergies: appointment.patient.allergies || [],
      
      // Vital signs would need to be stored separately or in appointment data
      vitalSigns: {
        bloodPressure: "Not recorded",
        heartRate: "Not recorded",
        temperature: "Not recorded",
        weight: appointment.patient.weight ? `${appointment.patient.weight} kg` : "Not recorded",
        height: appointment.patient.height ? `${appointment.patient.height} cm` : "Not recorded"
      },
      
      hasAiSummary: !!appointment.aiSummary,
      isNewPatient: appointment.createdAt >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // New if created in last 30 days
      
      notes: appointment.doctorNotes || '',
      diagnosis: appointment.aiSummary?.possibleConditions?.join(', ') || '',
      treatment: appointment.aiSummary?.preliminaryTreatment || '',
      prescription: appointment.prescription ? {
        id: appointment.prescription.id,
        medications: appointment.prescription.medications.map((med: any) => ({
          name: med.medicationName,
          dosage: med.dosage,
          frequency: med.frequency,
          instructions: med.instructions
        })),
        instructions: appointment.prescription.instructions,
        status: appointment.prescription.status
      } : null,
      
      followUpDate: '', // Would need to be implemented
      
      // AI Summary details
      aiSummary: appointment.aiSummary ? {
        id: appointment.aiSummary.id,
        symptomsList: appointment.aiSummary.symptomsList,
        possibleConditions: appointment.aiSummary.possibleConditions,
        suggestedTests: appointment.aiSummary.suggestedTests,
        preliminaryTreatment: appointment.aiSummary.preliminaryTreatment,
        dietRecommendations: appointment.aiSummary.dietRecommendations,
        urgencyLevel: appointment.aiSummary.urgencyLevel,
        riskFactors: appointment.aiSummary.riskFactors,
        confidenceScore: appointment.aiSummary.confidenceScore
      } : null,
      
      // Uploaded files
      uploadedFiles: appointment.uploadedFiles.map((file: any) => ({
        id: file.id,
        fileName: file.fileName,
        fileType: file.fileType,
        fileSize: file.fileSize,
        uploadedAt: file.uploadedAt.toISOString()
      }))
    }

    console.log('Successfully returning appointment details')
    return NextResponse.json({
      success: true,
      appointment: appointmentDetail
    })

  } catch (error) {
    console.error('Appointment detail API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch appointment details',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}