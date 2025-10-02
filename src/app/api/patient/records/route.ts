import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  // Get userId from query params
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ message: "Missing userId" }, { status: 400 });
  }

  // Optionally, check session for security
  // const session = await getServerSession(authOptions);
  // if (!session || session.user.id !== userId) {
  //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  // }

  try {
    // Fetch medical records for the patient from the database
    const records = await prisma.medicalRecord.findMany({
      where: { patientId: userId },
      orderBy: { recordDate: "desc" },
    });
    return NextResponse.json({ records });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching records", error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { patientId, title, recordType, recordDate, description, attachments } = body;
  if (!patientId || !title || !recordType || !recordDate) {
    return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
  }
  try {
    const record = await prisma.medicalRecord.create({
      data: {
        patientId,
        title,
        recordType,
        recordDate: new Date(recordDate),
        description,
        attachments,
      },
    });
    return NextResponse.json({ record });
  } catch (error) {
    return NextResponse.json({ message: "Error creating record", error: String(error) }, { status: 500 });
  }
}
