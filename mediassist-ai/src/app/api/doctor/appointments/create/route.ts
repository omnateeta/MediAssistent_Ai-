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

    // Require doctor role
    if (s.user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await req.json()
    
    const {
      patientId,
      appointmentDate,
      appointmentTime,
      chiefComplaint,
      symptoms,
      symptomDuration,
      painLevel,
      notes
    } = body

    // Validate required fields
    if (!patientId || !appointmentDate || !appointmentTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Validate date format
    const dateTimeString = `${appointmentDate}T${appointmentTime}:00`
    const appointmentDateTime = new Date(dateTimeString)
    
    if (isNaN(appointmentDateTime.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }

    // Find doctor's profile
    const doctorProfile = await prisma.doctorProfile.findUnique({ 
      where: { userId: s.user.id } 
    })
    
    if (!doctorProfile) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
    }

    // Verify that the patient exists
    const patientProfile = await prisma.patientProfile.findUnique({
      where: { id: patientId }
    })
    
    if (!patientProfile) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId: patientId,
        doctorId: doctorProfile.id,
        scheduledDate: appointmentDateTime,
        chiefComplaint: chiefComplaint || undefined,
        symptoms: symptoms ? { 
          text: symptoms,
          duration: symptomDuration || 'Not specified',
          painLevel: painLevel || 1
        } : null,
        symptomDuration: symptomDuration || undefined,
        painLevel: painLevel || 1,
        doctorNotes: notes || undefined,
        status: 'SCHEDULED',
      }
    })

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
        }
      }
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