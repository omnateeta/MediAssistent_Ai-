import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const specialization = searchParams.get('specialization')
    
    if (!specialization) {
      return NextResponse.json({ error: 'Specialization parameter is required' }, { status: 400 })
    }

    // Fetch doctors from database who have the specified specialization
    const doctors = await prisma.doctorProfile.findMany({
      where: {
        specialization: {
          has: specialization  // Array contains the specialization
        },
        isAvailable: true,     // Only available doctors
        isVerified: true       // Only verified doctors
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { isAvailable: 'desc' },
        { consultationFee: 'asc' }
      ]
    })

    // Format the response to match frontend expectations
    const formattedDoctors = doctors.map(doctor => ({
      id: doctor.id,
      userId: doctor.user.id,
      name: doctor.user.name || 'Unknown Doctor',
      email: doctor.user.email,
      specialization: doctor.specialization,
      consultationFee: doctor.consultationFee || 100,
      isAvailable: doctor.isAvailable,
      isVerified: doctor.isVerified,
      yearsOfExperience: doctor.yearsOfExperience,
      hospitalAffiliation: doctor.hospitalAffiliation,
      qualifications: doctor.qualifications,
      languagesSpoken: doctor.languagesSpoken
    }))

    return NextResponse.json({
      success: true,
      doctors: formattedDoctors,
      count: formattedDoctors.length,
      specialization
    })

  } catch (error) {
    console.error('Doctors by specialization API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch doctors',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}