import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    let session = await getServerSession(authOptions)
    let userId: string | null = null
    
    // First try NextAuth session
    if (session?.user?.id) {
      userId = session.user.id
    } else {
      // Try multi-role authentication token
      const authHeader = req.headers.get('authorization')
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        try {
          const response = await fetch(`${req.nextUrl.origin}/api/multi-role-auth?token=${token}`)
          if (response.ok) {
            const tokenData = await response.json()
            if (tokenData.valid && tokenData.role === 'PATIENT') {
              userId = tokenData.userId
            }
          }
        } catch (e) {
          console.warn('Multi-role token validation failed:', e)
        }
      }
    }
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a patient
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { patientProfile: true }
    })

    if (!user || user.role !== 'PATIENT') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    let patientId: string

    if (!user.patientProfile) {
      // Auto-create patient profile if it doesn't exist
      const patientProfile = await prisma.patientProfile.create({
        data: {
          userId: user.id
        }
      })
      patientId = patientProfile.id
    } else {
      patientId = user.patientProfile.id
    }

    // Calculate real-time statistics
    const [
      totalAppointments,
      upcomingAppointments,
      completedAppointments,
      activePrescriptions
    ] = await Promise.all([
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

    // Get recent appointments for upcoming section
    const recentAppointments = await prisma.appointment.findMany({
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

    // Get recent activity from appointments, prescriptions, and medical records
    const recentAppointmentHistory = await prisma.appointment.findMany({
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
      specialization: appointment.doctor?.specialization || 'General Medicine',
      scheduledDate: appointment.scheduledDate?.toISOString().split('T')[0] || '',
      scheduledTime: appointment.scheduledDate?.toISOString().split('T')[1]?.slice(0, 5) || '',
      status: appointment.status || 'SCHEDULED'
    }))

    // Generate recent activity from appointment history
    const recentActivity: any[] = []
    
    for (const appointment of recentAppointmentHistory) {
      const appointmentDate = appointment.scheduledDate?.toISOString().split('T')[0] || appointment.createdAt.toISOString().split('T')[0]
      
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
            date: summary.createdAt.toISOString().split('T')[0],
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
            date: prescription.issuedDate?.toISOString().split('T')[0] || appointmentDate,
            status: prescription.status?.toLowerCase() || 'active'
          })
        })
      }
    }

    // Sort recent activity by date (most recent first)
    recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json({
      success: true,
      data: {
        stats,
        upcomingAppointments: upcomingAppointmentsList,
        recentActivity: recentActivity.slice(0, 10) // Limit to 10 most recent
      }
    })

  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}