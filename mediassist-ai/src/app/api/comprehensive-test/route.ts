import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log('[Comprehensive Test] Starting test...')
    
    // Check environment variables
    const envInfo = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      USE_TEMP_AUTH: process.env.USE_TEMP_AUTH,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NODE_ENV: process.env.NODE_ENV
    }
    
    console.log('[Comprehensive Test] Environment:', envInfo)
    
    // Check auth mode decision
    const shouldUseTempAuth = 
      !process.env.DATABASE_URL || 
      process.env.USE_TEMP_AUTH === '1'
      
    console.log('[Comprehensive Test] shouldUseTempAuth:', shouldUseTempAuth)
    
    // Count users in database
    const userCount = await prisma.user.count()
    console.log('[Comprehensive Test] Total users in DB:', userCount)
    
    // Get a sample user
    const sampleUser = await prisma.user.findFirst({
      where: { email: 'test@gmail.com' }
    })
    
    console.log('[Comprehensive Test] Sample user:', sampleUser?.email)
    
    // Try to find all variations of a test email
    const testEmails = [
      'test@gmail.com',
      'TEST@GMAIL.COM',
      'Test@Gmail.Com',
      ' test@gmail.com ',
      'test@gmail.com '
    ]
    
    const userSearchResults: any[] = []
    for (const email of testEmails) {
      const user = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() }
      })
      userSearchResults.push({
        searchedEmail: email,
        found: !!user,
        foundEmail: user?.email
      })
    }
    
    console.log('[Comprehensive Test] User search results:', userSearchResults)
    
    return NextResponse.json({
      success: true,
      envInfo,
      shouldUseTempAuth,
      userCount,
      sampleUser: sampleUser?.email,
      userSearchResults
    })
  } catch (error: any) {
    console.error('[Comprehensive Test] Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}