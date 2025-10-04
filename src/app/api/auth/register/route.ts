import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { validateEmail } from "@/lib/utils"
import { addMockUser } from "@/lib/auth-temp"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      password,
      role,
      // Doctor fields
      licenseNumber,
      specialization,
      hospitalAffiliation,
      // Patient fields
      dateOfBirth,
      phoneNumber,
    } = body

    // Validation
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      )
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long" },
        { status: 400 }
      )
    }

    if (!["PATIENT", "DOCTOR"].includes(role)) {
      return NextResponse.json(
        { message: "Invalid role specified" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user using temporary auth system
    const user = addMockUser({
      email,
      name,
      password: hashedPassword,
      role,
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      {
        message: "User created successfully",
        user: userWithoutPassword,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      {
        message: "Internal server error",
        error: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    )
  }
}
