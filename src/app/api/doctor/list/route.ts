import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const doctors = await prisma.doctorProfile.findMany({
      include: { user: true },
      where: { isAvailable: true },
    })

    const payload = doctors.map((d: any) => ({
      id: d.id,
      name: d.user?.name ?? d.licenseNumber,
      specialization: d.specialization ?? [],
      consultationFee: d.consultationFee ?? 0,
      isAvailable: d.isAvailable,
    }))

    return NextResponse.json({ doctors: payload })
  } catch (error) {
    console.error('Error fetching doctors:', error)
    return NextResponse.json({ doctors: [] })
  }
}
