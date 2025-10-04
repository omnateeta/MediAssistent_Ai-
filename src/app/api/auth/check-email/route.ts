import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      )
    }

    // Check if email exists in database
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, role: true }
    })

    return NextResponse.json({
      available: !existingUser,
      exists: !!existingUser,
      role: existingUser?.role || null
    })
  } catch (error) {
    console.error("Email check error:", error)
    return NextResponse.json(
      { message: "Failed to check email availability" },
      { status: 500 }
    )
  }
}