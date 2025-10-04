import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    console.log('Debug endpoint called')
    
    const session = await getServerSession(authOptions as any)
    console.log('Session:', session)
    
    const body = await req.json()
    console.log('Request body:', JSON.stringify(body, null, 2))
    
    const {
      specialization,
      doctorId,
      appointmentDate,
      appointmentTime,
      chiefComplaint,
      symptoms,
      symptomDuration,
      painLevel,
      allergies,
      currentMedications,
      uploadedDocuments,
      voiceNote
    } = body
    
    console.log('Extracted fields:', {
      specialization,
      doctorId,
      appointmentDate,
      appointmentTime,
      chiefComplaint,
      symptoms,
      symptomDuration,
      painLevel,
      allergies,
      currentMedications,
      uploadedDocuments,
      voiceNote
    })
    
    return NextResponse.json({ 
      message: 'Debug successful',
      sessionUser: (session as any)?.user,
      receivedData: body
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({ 
      error: 'Debug error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}