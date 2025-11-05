import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// Define maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024

// Allowed file types
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'PATIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const files = formData.getAll('files') as File[]
    const appointmentId = formData.get('appointmentId') as string

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 })
    }

    // Validate files
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ 
          error: `File ${file.name} is too large. Maximum size is 10MB.` 
        }, { status: 400 })
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ 
          error: `File ${file.name} has unsupported format. Allowed: PDF, JPG, PNG, DOC, DOCX.` 
        }, { status: 400 })
      }
    }

    // Get patient profile
    const patient = await prisma.patientProfile.findFirst({
      where: { userId: session.user.id }
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 })
    }

    const uploadedFiles = []

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads', 'medical-documents')
    const patientDir = join(uploadsDir, patient.id)
    
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }
    
    if (!existsSync(patientDir)) {
      await mkdir(patientDir, { recursive: true })
    }

    // Process each file
    for (const file of files) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Generate unique filename
      const timestamp = Date.now()
      const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const fileName = `${timestamp}_${originalName}`
      const filePath = join(patientDir, fileName)

      // Save file to disk
      await writeFile(filePath, buffer)

      // Create database record
      const document = await prisma.medicalDocument.create({
        data: {
          patientId: patient.id,
          appointmentId: appointmentId || null,
          fileName: originalName,
          filePath: `/uploads/medical-documents/${patient.id}/${fileName}`,
          fileSize: file.size,
          mimeType: file.type,
          uploadedAt: new Date()
        }
      })

      uploadedFiles.push({
        id: document.id,
        fileName: document.fileName,
        fileSize: document.fileSize,
        mimeType: document.mimeType,
        uploadedAt: document.uploadedAt
      })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${uploadedFiles.length} file(s)`,
      files: uploadedFiles
    })

  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    )
  }
}