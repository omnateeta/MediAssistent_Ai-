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
    // Fetch patients for the doctor from the database
    // This assumes a relation between doctor and patients exists
    const patients = await prisma.patientProfile.findMany({
      where: {
        doctorId: doctorId,
      },
      include: {
        medicalRecords: true,
      },
    });
    return NextResponse.json({ patients });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching patients", error: String(error) }, { status: 500 });
  }
}
