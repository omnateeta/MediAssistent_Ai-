import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  // Get doctorId from query params
  const { searchParams } = new URL(request.url);
  const doctorId = searchParams.get("doctorId");
  if (!doctorId) {
    return NextResponse.json({ message: "Missing doctorId" }, { status: 400 });
  }

  // Optionally, check session for security
  // const session = await getServerSession(authOptions);
  // if (!session || session.user.id !== doctorId) {
  //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  // }

  try {
    // Find appointments for the doctor and load unique patient profiles
    const appointments = await prisma.appointment.findMany({
      where: { doctorId },
      include: { patient: true },
    })

    const patientsMap: Record<string, any> = {}
    for (const a of appointments) {
      if (a.patient) patientsMap[a.patient.id] = a.patient
    }

    const patients = Object.values(patientsMap)
    return NextResponse.json({ patients })
  } catch (error) {
    return NextResponse.json({ message: "Error fetching patients", error: String(error) }, { status: 500 });
  }
}
