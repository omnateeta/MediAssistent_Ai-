import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"
import { User } from "@prisma/client"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log('[Test Signin] Attempting signin for:', email)
    
    // Check auth mode
    const shouldUseTempAuth = 
      !process.env.DATABASE_URL || 
      process.env.USE_TEMP_AUTH === '1'
      
    console.log('[Test Signin] Auth mode:', shouldUseTempAuth ? 'temp' : 'database')
    console.log('[Test Signin] DATABASE_URL exists:', !!process.env.DATABASE_URL)
    console.log('[Test Signin] USE_TEMP_AUTH value:', process.env.USE_TEMP_AUTH)

    // Simulate database auth logic
    if (!shouldUseTempAuth) {
      console.log('[Test Signin] Using database auth')
      
      // First, let's see what users exist
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true
        }
      })
      
      console.log('[Test Signin] Total users in DB:', allUsers.length)
      
      // Look for the specific user
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: {
          patientProfile: true,
          doctorProfile: true,
        }
      })

      if (!user) {
        console.log('[Test Signin] User not found with email:', email.toLowerCase())
        // Let's also try with the original email
        const userOriginal = await prisma.user.findUnique({
          where: { email: email },
          include: {
            patientProfile: true,
            doctorProfile: true,
          }
        })
        
        if (userOriginal) {
          console.log('[Test Signin] User found with original email:', userOriginal.email)
        } else {
          console.log('[Test Signin] User not found with original email either')
        }
        
        // Show all emails for debugging
        console.log('[Test Signin] All user emails:', allUsers.map((u: any) => u.email))
        
        return NextResponse.json(
          { 
            success: false, 
            error: 'User not found',
            userExists: false,
            searchedEmail: email.toLowerCase(),
            originalEmail: email,
            allUserEmails: allUsers.map((u: any) => u.email)
          }
        )
      }

      console.log('[Test Signin] User found:', {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      })

      // Verify password
      if (user.password) {
        const isPasswordValid = await bcrypt.compare(password, user.password)
        console.log('[Test Signin] Password valid:', isPasswordValid)
        
        if (!isPasswordValid) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Invalid password',
              userExists: true,
              passwordValid: false
            }
          )
        }
      }

      if (!user.isActive) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Account is deactivated',
            userExists: true,
            passwordValid: true,
            isActive: false
          }
        )
      }

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        userExists: true,
        passwordValid: true,
        isActive: true
      })
    } else {
      // Temp auth logic would go here
      return NextResponse.json(
        { 
          success: false, 
          error: 'Temp auth not implemented in test',
          authMode: 'temp'
        }
      )
    }
  } catch (error: any) {
    console.error('[Test Signin] Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}