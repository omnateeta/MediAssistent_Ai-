import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface TimeSlot {
  time: string
  available: boolean
  reason?: string
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const doctorId = searchParams.get('doctorId')
    const date = searchParams.get('date')
    
    if (!doctorId || !date) {
      return NextResponse.json({ 
        error: 'Both doctorId and date parameters are required' 
      }, { status: 400 })
    }

    // Validate date format
    const requestDate = new Date(date)
    if (isNaN(requestDate.getTime())) {
      return NextResponse.json({ 
        error: 'Invalid date format. Use YYYY-MM-DD' 
      }, { status: 400 })
    }

    // Check if doctor exists and is available
    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: doctorId },
      include: {
        user: {
          select: { name: true }
        }
      }
    })

    if (!doctor) {
      return NextResponse.json({ 
        error: 'Doctor not found' 
      }, { status: 404 })
    }

    if (!doctor.isAvailable || !doctor.isVerified) {
      return NextResponse.json({ 
        error: 'Doctor is not available for appointments' 
      }, { status: 400 })
    }

    // Get start and end of the requested date
    const startOfDay = new Date(requestDate)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(requestDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Fetch existing appointments for this doctor on this date
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctorId,
        scheduledDate: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS']
        }
      },
      select: {
        scheduledDate: true,
        duration: true,
        status: true
      }
    })

    // Generate time slots for the day (9 AM to 5 PM in 30-minute intervals)
    const timeSlots: TimeSlot[] = []
    const startHour = 9
    const endHour = 17
    const slotDuration = 30 // minutes

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        
        // Create a full datetime for this slot
        const slotDateTime = new Date(requestDate)
        slotDateTime.setHours(hour, minute, 0, 0)
        
        // Check if this slot conflicts with existing appointments
        const hasConflict = existingAppointments.some(appointment => {
          const appointmentStart = new Date(appointment.scheduledDate)
          const appointmentEnd = new Date(appointmentStart.getTime() + (appointment.duration || 30) * 60000)
          
          // Check if slot overlaps with appointment
          const slotEnd = new Date(slotDateTime.getTime() + slotDuration * 60000)
          return (slotDateTime < appointmentEnd && slotEnd > appointmentStart)
        })

        // Check if the slot is in the past (for today)
        const now = new Date()
        const isPast = slotDateTime <= now

        // Determine availability
        let available = true
        let reason = undefined

        if (isPast) {
          available = false
          reason = 'Past time slot'
        } else if (hasConflict) {
          available = false
          reason = 'Already booked'
        }

        timeSlots.push({
          time,
          available,
          reason
        })
      }
    }

    // Also check doctor's working hours if available in the profile
    // This is a placeholder for future enhancement
    // const workingHours = doctor.workingHours

    return NextResponse.json({
      success: true,
      date: date,
      doctorId: doctorId,
      doctorName: doctor.user.name,
      timeSlots: timeSlots,
      availableCount: timeSlots.filter(slot => slot.available).length,
      totalSlots: timeSlots.length
    })

  } catch (error) {
    console.error('Time slots API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch available time slots',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}