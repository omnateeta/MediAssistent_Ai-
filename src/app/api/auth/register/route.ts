import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { validateEmail } from "@/lib/utils"

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

    // Test database connection
    try {
      await prisma.$connect()
    } catch (dbError) {
      console.error("Database connection error:", dbError)
      return NextResponse.json(
        { message: "Database connection failed. Please ensure the database is set up and running." },
        { status: 503 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      )
    }

    // For doctors, check if license number is unique
    if (role === "DOCTOR" && licenseNumber) {
      const existingDoctor = await prisma.doctorProfile.findUnique({
        where: { licenseNumber }
      })

      if (existingDoctor) {
        return NextResponse.json(
          { message: "Doctor with this license number already exists" },
          { status: 409 }
        )
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user with role-specific profile
    const userData: any = {
      name,
      email,
      password: hashedPassword,
      role,
      emailVerified: new Date(), // Auto-verify for demo purposes
    }

    if (role === "DOCTOR") {
      userData.doctorProfile = {
        create: {
          licenseNumber: licenseNumber || "",
          specialization: specialization ? [specialization] : [],
          hospitalAffiliation: hospitalAffiliation || "",
          isVerified: false, // Doctors need manual verification
        }
      }
    } else if (role === "PATIENT") {
      userData.patientProfile = {
        create: {
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          phoneNumber: phoneNumber || "",
        }
      }
    }

    const user = await prisma.user.create({
      data: userData,
      include: {
        patientProfile: true,
        doctorProfile: true,
      }
    })

    // Log registration event (with error handling)
    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "REGISTER",
          resource: "USER",
          details: {
            role: user.role,
            method: "credentials",
          },
        },
      })
    } catch (auditError) {
      console.warn("Failed to create audit log:", auditError)
      // Continue without failing the registration
    }

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
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("connect")) {
        return NextResponse.json(
          { message: "Database connection failed. Please check your database configuration." },
          { status: 503 }
        )
      }
      if (error.message.includes("Unique constraint")) {
        return NextResponse.json(
          { message: "User with this email already exists" },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { 
        message: "Internal server error",
        error: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
