import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, role } = body

    console.log('[Simulate Signin] Attempting signin:', { email, role })
    
    // Simulate the exact logic from auth.ts
    const user = await prisma.user.findUnique({
      where: { email: email },
      include: {
        patientProfile: true,
        doctorProfile: true,
      }
    })

    if (!user) {
      console.log('[Simulate Signin] User not found')
      return NextResponse.json(
        { 
          success: false, 
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        },
        { status: 401 }
      )
    }

    console.log('[Simulate Signin] User found:', {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    })

    // Check password
    if (user.password) {
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        console.log('[Simulate Signin] Invalid password')
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid password',
            code: 'INVALID_PASSWORD'
          },
          { status: 401 }
        )
      }
    }

    // Check role mismatch (exact logic from auth.ts)
    if (role && user.role && role !== user.role) {
      console.log('[Simulate Signin] Role mismatch:', { requested: role, stored: user.role })
      return NextResponse.json(
        { 
          success: false, 
          error: `Role mismatch: this account is registered as ${user.role}`,
          code: 'ROLE_MISMATCH',
          requestedRole: role,
          storedRole: user.role
        },
        { status: 401 }
      )
    }

    if (!user.isActive) {
      console.log('[Simulate Signin] Account deactivated')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Account is deactivated',
          code: 'ACCOUNT_DEACTIVATED'
        },
        { status: 401 }
      )
    }

    console.log('[Simulate Signin] Authentication successful')
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    })

  } catch (error: any) {
    console.error('[Simulate Signin] Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}