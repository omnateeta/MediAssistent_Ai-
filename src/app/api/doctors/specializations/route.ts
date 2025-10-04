import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get unique specializations from all doctors in database
    const doctors = await prisma.doctorProfile.findMany({
      where: {
        isVerified: true,
        isAvailable: true
      },
      select: {
        specialization: true
      }
    })

    // Extract and flatten all specializations
    const allSpecializations: string[] = doctors.flatMap((doctor: any) => doctor.specialization)
    
    // Get unique specializations and sort them
    const uniqueSpecializations: string[] = [...new Set(allSpecializations)].sort()

    // Define the registration form specializations for consistency
    const registrationSpecializations: string[] = [
      "Cardiology", "Dermatology", "Endocrinology", "Gastroenterology", 
      "General Practice", "Neurology", "Oncology", "Orthopedics", 
      "Psychiatry", "Pulmonology"
    ]

    // Filter to only include specializations from registration form
    const filteredSpecializations: string[] = uniqueSpecializations.filter((spec: string) => 
      registrationSpecializations.includes(spec)
    )

    return NextResponse.json({
      success: true,
      specializations: filteredSpecializations.length > 0 ? filteredSpecializations : registrationSpecializations,
      total: filteredSpecializations.length,
      availableInDatabase: uniqueSpecializations
    })

  } catch (error) {
    console.error('Specializations API error:', error)
    
    // Return registration form specializations as fallback
    return NextResponse.json({
      success: true,
      specializations: [
        "Cardiology", "Dermatology", "Endocrinology", "Gastroenterology",
        "General Practice", "Neurology", "Oncology", "Orthopedics",
        "Psychiatry", "Pulmonology"
      ],
      error: 'Database error, using fallback specializations'
    })
  }
}