import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    console.log('Dashboard API: Starting request processing')
    
    let session = await getServerSession(authOptions)
    let userId: string | null = null
    
    // First try NextAuth session
    if (session?.user?.id) {
      userId = session.user.id
      console.log('Dashboard API: Found NextAuth session for user:', userId)
    } else {
      // Try multi-role authentication token
      const authHeader = req.headers.get('authorization')
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        console.log('Dashboard API: Trying multi-role token authentication')
        try {
          const response = await fetch(`${req.nextUrl.origin}/api/multi-role-auth?token=${token}`)
          if (response.ok) {
            const tokenData = await response.json()
            if (tokenData.valid && tokenData.role === 'PATIENT') {
              userId = tokenData.userId
              console.log('Dashboard API: Valid multi-role token for user:', userId)
            } else {
              console.log('Dashboard API: Invalid multi-role token - valid:', tokenData.valid, 'role:', tokenData.role)
            }
          } else {
            console.log('Dashboard API: Multi-role auth endpoint returned status:', response.status)
            // Try to get error details
            try {
              const errorText = await response.text()
              console.log('Dashboard API: Multi-role auth error details:', errorText)
            } catch (e) {
              console.log('Dashboard API: Could not read error details')
            }
          }
        } catch (e) {
          console.warn('Dashboard API: Multi-role token validation failed:', e)
        }
      } else {
        console.log('Dashboard API: No authorization header found')
      }
    }
    
    if (!userId) {
      console.log('Dashboard API: No valid user ID found, returning 401')
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'No valid authentication found. Please sign in again.'
      }, { status: 401 })
    }

    // Verify user is a patient
    console.log('Dashboard API: Verifying user role for user:', userId)
    let user
    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
        include: { patientProfile: true }
      })
    } catch (dbError) {
      console.error('Dashboard API: Database error when fetching user:', dbError)
      return NextResponse.json({ 
        error: 'Database error',
        message: 'Unable to access user data. Please try again later.'
      }, { status: 500 })
    }

    if (!user || user.role !== 'PATIENT') {
      console.log('Dashboard API: User is not a patient or not found:', userId)
      return NextResponse.json({ 
        error: 'Access denied',
        message: 'This resource is only available to patients.'
      }, { status: 403 })
    }

    let patientId: string

    if (!user.patientProfile) {
      console.log('Dashboard API: Creating patient profile for user:', userId)
      // Auto-create patient profile if it doesn't exist
      try {
        const patientProfile = await prisma.patientProfile.create({
          data: {
            userId: user.id
          }
        })
        patientId = patientProfile.id
      } catch (createError) {
        console.error('Dashboard API: Failed to create patient profile:', createError)
        // Try to fetch existing profile in case of race condition
        try {
          const existingProfile = await prisma.patientProfile.findUnique({
            where: { userId: user.id }
          })
          if (existingProfile) {
            patientId = existingProfile.id
          } else {
            throw new Error('Could not create or find patient profile')
          }
        } catch (fetchError) {
          console.error('Dashboard API: Failed to fetch existing patient profile:', fetchError)
          return NextResponse.json({ 
            error: 'Profile error',
            message: 'Unable to access patient profile. Please try again later.'
          }, { status: 500 })
        }
      }
    } else {
      patientId = user.patientProfile.id
      console.log('Dashboard API: Found existing patient profile:', patientId)
    }

    // Calculate real-time statistics with error handling
    console.log('Dashboard API: Calculating statistics for patient:', patientId)
    let totalAppointments = 0
    let upcomingAppointments = 0
    let completedAppointments = 0
    let activePrescriptions = 0
    
    try {
      const [
        totalResult,
        upcomingResult,
        completedResult,
        activeResult
      ] = await Promise.allSettled([
        // Total appointments count
        prisma.appointment.count({
          where: { patientId }
        }),
        
        // Upcoming appointments (future dates and pending/confirmed status)
        prisma.appointment.count({
          where: {
            patientId,
            scheduledDate: {
              gte: new Date()
            },
            status: {
              in: ['SCHEDULED', 'CONFIRMED']
            }
          }
        }),
        
        // Completed appointments
        prisma.appointment.count({
          where: {
            patientId,
            status: 'COMPLETED'
          }
        }),
        
        // Active prescriptions (not expired and active status)
        prisma.prescription.count({
          where: {
            appointment: {
              patientId
            },
            status: 'ACTIVE',
            OR: [
              { expiryDate: null },
              { expiryDate: { gte: new Date() } }
            ]
          }
        })
      ])
      
      // Handle results individually to prevent one failure from breaking everything
      if (totalResult.status === 'fulfilled') {
        totalAppointments = totalResult.value
      } else {
        console.error('Dashboard API: Failed to count total appointments:', totalResult.reason)
      }
      
      if (upcomingResult.status === 'fulfilled') {
        upcomingAppointments = upcomingResult.value
      } else {
        console.error('Dashboard API: Failed to count upcoming appointments:', upcomingResult.reason)
      }
      
      if (completedResult.status === 'fulfilled') {
        completedAppointments = completedResult.value
      } else {
        console.error('Dashboard API: Failed to count completed appointments:', completedResult.reason)
      }
      
      if (activeResult.status === 'fulfilled') {
        activePrescriptions = activeResult.value
      } else {
        console.error('Dashboard API: Failed to count active prescriptions:', activeResult.reason)
      }
    } catch (statsError) {
      console.error('Dashboard API: Error calculating statistics:', statsError)
      // Continue with zero values rather than failing completely
    }

    console.log('Dashboard API: Statistics calculated:', {
      totalAppointments,
      upcomingAppointments,
      completedAppointments,
      activePrescriptions
    })

    // Get recent appointments for upcoming section with error handling
    let recentAppointments: any[] = []
    try {
      console.log('Dashboard API: Fetching upcoming appointments for patient:', patientId)
      recentAppointments = await prisma.appointment.findMany({
        where: {
          patientId,
          scheduledDate: {
            gte: new Date()
          },
          status: {
            in: ['SCHEDULED', 'CONFIRMED']
          }
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
          }
        },
        orderBy: {
          scheduledDate: 'asc'
        },
        take: 5
      })
    } catch (appointmentsError) {
      console.error('Dashboard API: Error fetching upcoming appointments:', appointmentsError)
      // Continue with empty array rather than failing
    }

    // Get recent activity from appointments, prescriptions, and medical records with error handling
    let recentAppointmentHistory: any[] = []
    try {
      console.log('Dashboard API: Fetching appointment history for patient:', patientId)
      recentAppointmentHistory = await prisma.appointment.findMany({
        where: { patientId },
        include: {
          doctor: {
            include: {
              user: {
                select: { name: true }
              }
            }
          },
          aiSummary: true,
          prescription: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      })
    } catch (historyError) {
      console.error('Dashboard API: Error fetching appointment history:', historyError)
      // Continue with empty array rather than failing
    }

    // Format the response
    const stats = {
      totalAppointments,
      upcomingAppointments,
      completedAppointments,
      activePrescriptions
    }

    const upcomingAppointmentsList = recentAppointments.map((appointment: any) => ({
      id: appointment.id,
      referenceId: appointment.referenceId || `APPT-${appointment.id.slice(0, 8)}`,
      doctorName: appointment.doctor?.user?.name || 'Unknown Doctor',
      specialization: appointment.doctor?.specialization?.join(', ') || 'General Medicine',
      scheduledDate: appointment.scheduledDate?.toISOString().split('T')[0] || '',
      scheduledTime: appointment.scheduledDate?.toISOString().split('T')[1]?.slice(0, 5) || '',
      status: appointment.status || 'SCHEDULED'
    }))

    // Generate recent activity from appointment history
    const recentActivity: any[] = []
    
    for (const appointment of recentAppointmentHistory) {
      try {
        const appointmentDate = appointment.scheduledDate 
          ? appointment.scheduledDate.toISOString().split('T')[0] 
          : appointment.createdAt.toISOString().split('T')[0]
        
        // Add appointment activity
        recentActivity.push({
          id: `appt_${appointment.id}`,
          type: 'appointment',
          title: `Appointment ${appointment.status}`,
          description: `With ${appointment.doctor?.user?.name || 'doctor'} on ${appointmentDate}`,
          date: appointmentDate,
          status: appointment.status?.toLowerCase() || 'scheduled'
        })

        // Add AI summary activity if exists
        if (appointment.aiSummary && appointment.aiSummary.length > 0) {
          appointment.aiSummary.forEach((summary: any, index: number) => {
            recentActivity.push({
              id: `ai_${appointment.id}_${index}`,
              type: 'ai_summary',
              title: 'AI Analysis Ready',
              description: summary.summaryText || 'Medical analysis completed',
              date: summary.createdAt ? summary.createdAt.toISOString().split('T')[0] : appointmentDate,
              status: 'completed'
            })
          })
        }

        // Add prescription activity if exists
        if (appointment.prescription && appointment.prescription.length > 0) {
          appointment.prescription.forEach((prescription: any, index: number) => {
            recentActivity.push({
              id: `pres_${appointment.id}_${index}`,
              type: 'prescription',
              title: `Prescription ${prescription.status}`,
              description: `Prescription from ${appointment.doctor?.user?.name || 'doctor'}`,
              date: prescription.issuedDate 
                ? prescription.issuedDate.toISOString().split('T')[0] 
                : appointmentDate,
              status: prescription.status?.toLowerCase() || 'active'
            })
          })
        }
      } catch (activityError) {
        console.error('Dashboard API: Error processing appointment activity:', activityError)
        // Continue processing other appointments
      }
    }

    // Sort recent activity by date (most recent first)
    recentActivity.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateB - dateA
    })

    console.log('Dashboard API: Successfully processed request for user:', userId)
    return NextResponse.json({
      success: true,
      data: {
        stats,
        upcomingAppointments: upcomingAppointmentsList,
        recentActivity: recentActivity.slice(0, 10) // Limit to 10 most recent
      }
    })

  } catch (error) {
    console.error('Dashboard API critical error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard data',
        message: 'An unexpected error occurred while loading your dashboard. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}