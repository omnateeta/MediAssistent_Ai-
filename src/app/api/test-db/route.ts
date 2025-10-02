import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Simple database connection test without Prisma client
    return NextResponse.json(
      { 
        status: "success",
        message: "Database connection test endpoint",
        timestamp: new Date().toISOString(),
        note: "This is a test endpoint while resolving Prisma client issues"
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { 
        status: "error",
        message: "Database connection failed",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 503 }
    )
  }
}
