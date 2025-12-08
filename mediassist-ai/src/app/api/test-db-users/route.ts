import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { User } from "@prisma/client"

export async function GET() {
  try {
    // Check if we're using temporary auth
    const shouldUseTempAuth = 
      !process.env.DATABASE_URL || 
      process.env.USE_TEMP_AUTH === '1'
      
    console.log('[Test DB Users] shouldUseTempAuth:', shouldUseTempAuth)
    console.log('[Test DB Users] DATABASE_URL exists:', !!process.env.DATABASE_URL)
    console.log('[Test DB Users] USE_TEMP_AUTH:', process.env.USE_TEMP_AUTH)
    
    // List all users from database
    const users = await prisma.user.findMany({
      include: {
        patientProfile: true,
        doctorProfile: true
      }
    })
    
    // Count users
    const userCount = await prisma.user.count()
    
    return NextResponse.json({
      success: true,
      userCount,
      users: users.map((user: User & { patientProfile: any; doctorProfile: any }) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        hasPatientProfile: !!user.patientProfile,
        hasDoctorProfile: !!user.doctorProfile
      })),
      authMode: shouldUseTempAuth ? 'temporary' : 'database',
      env: {
        DATABASE_URL: !!process.env.DATABASE_URL,
        USE_TEMP_AUTH: process.env.USE_TEMP_AUTH
      }
    })
  } catch (error: any) {
    console.error('[Test DB Users] Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}