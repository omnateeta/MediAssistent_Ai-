import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    console.log('POST /api/patient/appointments - Starting request...')
    
    const session = await getServerSession(authOptions as any)
    const s = session as any
    
    console.log('Session:', s ? 'Found session' : 'No session', s?.user?.id)

    // Require an authenticated session for creating appointments
    if (!s || !s.user) {
      console.log('Unauthorized: No session or user')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Parsing request body...')
    const body = await req.json()
    console.log('Request body received:', JSON.stringify(body, null, 2))

    const {
      specialization,
      doctorId,
      appointmentDate,
      appointmentTime,
      chiefComplaint,
      symptoms,
      symptomDuration,
      painLevel,
      allergies,
      currentMedications,
      uploadedDocuments,
      voiceNote
    } = body

    console.log('Extracted fields:', {
      specialization,
      doctorId,
      appointmentDate,
      appointmentTime,
      chiefComplaint: chiefComplaint?.slice(0, 50) + '...',
      symptoms: symptoms?.slice(0, 50) + '...',
      symptomDuration,
      painLevel,
      allergies,
      currentMedications,
      uploadedDocuments: uploadedDocuments?.length || 0,
      voiceNote: voiceNote ? 'Present' : 'None'
    })

    if (!doctorId || !appointmentDate || !appointmentTime) {
      console.log('Missing required fields:', { doctorId: !!doctorId, appointmentDate: !!appointmentDate, appointmentTime: !!appointmentTime })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Validate date format
    const dateTimeString = `${appointmentDate}T${appointmentTime}:00`
    const appointmentDateTime = new Date(dateTimeString)
    
    if (isNaN(appointmentDateTime.getTime())) {
      console.log('Invalid date format:', dateTimeString)
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }
    
    console.log('Valid appointment date time:', appointmentDateTime.toISOString())

    // Use authenticated session's user id and ensure patient profile exists
    const userIdToUse = s.user.id as string
    console.log('Using user ID:', userIdToUse)

    console.log('Checking for existing patient profile...')
    let patientProfile = await prisma.patientProfile.findUnique({ where: { userId: userIdToUse } })
    if (!patientProfile) {
      console.log('Creating new patient profile...')
      patientProfile = await prisma.patientProfile.create({ 
        data: { 
          userId: userIdToUse,
          allergies: allergies ? [allergies] : [],
          currentMedications: currentMedications ? [currentMedications] : []
        } 
      })
      console.log('Patient profile created:', patientProfile.id)
    } else {
      console.log('Found existing patient profile:', patientProfile.id)
      // Update patient profile with new allergy/medication info if provided
      if (allergies || currentMedications) {
        console.log('Updating patient profile with new medical info...')
        await prisma.patientProfile.update({
          where: { id: patientProfile.id },
          data: {
            allergies: allergies ? [...(patientProfile.allergies || []), allergies].filter((item, index, arr) => arr.indexOf(item) === index) : patientProfile.allergies,
            currentMedications: currentMedications ? [...(patientProfile.currentMedications || []), currentMedications].filter((item, index, arr) => arr.indexOf(item) === index) : patientProfile.currentMedications
          }
        })
      }
    }

    // Create the appointment with all provided data
    console.log('Creating appointment with data:', {
      patientId: patientProfile.id,
      doctorId: doctorId,
      scheduledDate: `${appointmentDate}T${appointmentTime}:00`,
      chiefComplaint: chiefComplaint || 'Not provided',
      symptomDuration: symptomDuration || 'Not specified',
      painLevel: painLevel || 1,
      patientVoiceNote: voiceNote ? 'Present' : 'None'
    })
    
    const appointment = await prisma.appointment.create({
      data: {
        patientId: patientProfile.id,
        doctorId: doctorId,
        scheduledDate: appointmentDateTime,
        chiefComplaint: chiefComplaint || undefined,
        symptoms: symptoms ? { 
          text: symptoms,
          duration: symptomDuration || 'Not specified',
          painLevel: painLevel || 1,
          specialization: specialization || 'General'
        } : null,
        symptomDuration: symptomDuration || undefined,
        painLevel: painLevel || 1,
        patientVoiceNote: voiceNote || undefined,
        status: 'SCHEDULED',
      }
    })
    
    console.log('Appointment created successfully:', appointment.id)

    // Link uploaded documents to this appointment if any
    if (uploadedDocuments && uploadedDocuments.length > 0) {
      await prisma.medicalDocument.updateMany({
        where: {
          id: { in: uploadedDocuments },
          patientId: patientProfile.id
        },
        data: {
          appointmentId: appointment.id
        }
      })
    }

    // Fetch the complete appointment data to return
    const completeAppointment = await prisma.appointment.findUnique({
      where: { id: appointment.id },
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
            uploadedAt: true
          }
        }
      }
    })

    console.log('Appointment created successfully:', {
      appointmentId: appointment.id,
      patientId: patientProfile.id,
      doctorId: doctorId,
      scheduledDate: appointment.scheduledDate,
      documentsLinked: uploadedDocuments?.length || 0
    })

    return NextResponse.json({ 
      appointment: completeAppointment,
      message: 'Appointment created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
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
