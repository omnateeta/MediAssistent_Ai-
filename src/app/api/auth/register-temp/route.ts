import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { validateEmail } from "@/lib/utils"
import { addMockUser } from "@/lib/auth-temp"

// Temporary registration endpoint without Prisma client
// This allows testing the UI while resolving database connection issues

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

    // Check if user already exists (import the mock users to check)
    try {
      const { addMockUser } = await import("@/lib/auth-temp")
      // This will check for existing users in the addMockUser function
    } catch (error) {
      console.warn("Could not check existing users:", error)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Add user to mock database for authentication
    const newUser = addMockUser({
      email,
      name,
      password: hashedPassword,
      role
    })

    // Create response user object
    const responseUser = {
      id: newUser.id,
      name,
      email,
      role,
      emailVerified: new Date(),
      createdAt: new Date(),
      // Add role-specific data
      ...(role === "DOCTOR" && {
        doctorProfile: {
          licenseNumber: licenseNumber || "",
          specialization: specialization ? [specialization] : [],
          hospitalAffiliation: hospitalAffiliation || "",
          isVerified: false,
        }
      }),
      ...(role === "PATIENT" && {
        patientProfile: {
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          phoneNumber: phoneNumber || "",
        }
      })
    }

    return NextResponse.json(
      {
        message: "User created successfully (temporary mock)",
        user: responseUser,
        note: "This is a temporary endpoint while resolving database connection issues"
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    
    return NextResponse.json(
      { 
        message: "Internal server error",
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}
