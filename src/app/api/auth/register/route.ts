import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { validateEmail } from "@/lib/utils"
import { prisma } from "@/lib/prisma"

// Advanced password validation
function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long")
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number")
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character")
  }
  
  return { isValid: errors.length === 0, errors }
}

// Advanced name validation
function validateName(name: string): { isValid: boolean; error?: string } {
  if (!name || name.trim().length < 2) {
    return { isValid: false, error: "Name must be at least 2 characters long" }
  }
  if (name.length > 100) {
    return { isValid: false, error: "Name must be less than 100 characters" }
  }
  if (!/^[a-zA-Z\s.'-]+$/.test(name)) {
    return { isValid: false, error: "Name can only contain letters, spaces, periods, hyphens, and apostrophes" }
  }
  return { isValid: true }
}

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

    // Enhanced validation
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { 
          message: "Missing required fields",
          details: {
            name: !name ? "Name is required" : null,
            email: !email ? "Email is required" : null,
            password: !password ? "Password is required" : null,
            role: !role ? "Role is required" : null,
          }
        },
        { status: 400 }
      )
    }

    // Validate name
    const nameValidation = validateName(name)
    if (!nameValidation.isValid) {
      return NextResponse.json(
        { message: nameValidation.error },
        { status: 400 }
      )
    }

    // Validate email
    if (!validateEmail(email)) {
      return NextResponse.json(
        { message: "Please enter a valid email address" },
        { status: 400 }
      )
    }

    // Advanced password validation
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { 
          message: "Password does not meet security requirements",
          details: passwordValidation.errors
        },
        { status: 400 }
      )
    }

    // Validate role
    if (!["PATIENT", "DOCTOR"].includes(role)) {
      return NextResponse.json(
        { message: "Invalid role. Must be either PATIENT or DOCTOR" },
        { status: 400 }
      )
    }

    // Doctor-specific validation
    if (role === "DOCTOR") {
      if (!licenseNumber || licenseNumber.trim().length < 3) {
        return NextResponse.json(
          { message: "Medical license number is required and must be at least 3 characters" },
          { status: 400 }
        )
      }
      if (!specialization || specialization.trim().length < 2) {
        return NextResponse.json(
          { message: "Medical specialization is required" },
          { status: 400 }
        )
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      if (existingUser.role === role) {
        return NextResponse.json(
          { 
            message: `An account with this email already exists as a ${role.toLowerCase()}. Please sign in instead.`,
            conflict: "existing_account"
          },
          { status: 409 }
        )
      } else {
        return NextResponse.json(
          { 
            message: `This email is already registered as a ${existingUser.role.toLowerCase()}. Each email can only be used for one role.`,
            conflict: "role_mismatch",
            existingRole: existingUser.role
          },
          { status: 409 }
        )
      }
    }

    // Hash password with strong settings
    const hashedPassword = await bcrypt.hash(password, 14)

    // Create user with transaction for data integrity
    const user = await prisma.$transaction(async (tx) => {
      // Create base user
      const newUser = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          name: name.trim(),
          password: hashedPassword,
          role,
          isActive: true,
        }
      })

      // Create role-specific profile
      if (role === "DOCTOR") {
        await tx.doctorProfile.create({
          data: {
            userId: newUser.id,
            licenseNumber: licenseNumber.trim(),
            specialization: [specialization.trim()],
            hospitalAffiliation: hospitalAffiliation?.trim() || "",
            consultationFee: 0,
            isAvailable: true,
            isVerified: false, // Doctors need verification
          }
        })
      } else {
        await tx.patientProfile.create({
          data: {
            userId: newUser.id,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            phoneNumber: phoneNumber?.trim() || "",
          }
        })
      }

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: newUser.id,
          action: "REGISTRATION",
          resource: "USER",
          details: {
            role,
            method: "email_password",
            ip: request.headers.get('x-forwarded-for') || 'unknown'
          }
        }
      })

      return newUser
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      {
        message: "Account created successfully! You can now sign in.",
        user: {
          ...userWithoutPassword,
          requiresVerification: role === "DOCTOR"
        },
        success: true
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    
    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { 
            message: "An account with this email already exists. Please sign in or use a different email.",
            conflict: "unique_constraint"
          },
          { status: 409 }
        )
      }
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      {
        message: "Unable to create account. Please try again.",
        error: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    )
  }
}
