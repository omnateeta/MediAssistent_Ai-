import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    // Get all unique specializations from verified and available doctors
    const doctorProfiles = await prisma.doctorProfile.findMany({
      where: {
        isAvailable: true,
        isVerified: true
      },
      select: {
        specialization: true
      }
    })

    // Extract and flatten all specializations
    const allSpecializations = doctorProfiles
      .flatMap(profile => profile.specialization)
      .filter((spec, index, array) => array.indexOf(spec) === index) // Remove duplicates
      .sort()

    return NextResponse.json({
      success: true,
      specializations: allSpecializations,
      count: allSpecializations.length
    })

  } catch (error) {
    console.error('Specializations API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch specializations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}