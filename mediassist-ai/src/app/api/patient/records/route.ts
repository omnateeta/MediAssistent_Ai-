import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as localStore from '@/lib/localStore'
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
    // Resolve patientId: the caller may pass either a PatientProfile.id or a User.id
    let patientId = userId;
    let dbRecords: any[] = []
    try {
      const patientProfile = await prisma.patientProfile.findUnique({ where: { userId } });
      if (patientProfile) patientId = patientProfile.id;
      // Fetch medical records for the patient from the database
      dbRecords = await prisma.medicalRecord.findMany({ where: { patientId }, orderBy: { recordDate: "desc" } });
    } catch (dbErr) {
      // db may be unreachable; we'll fallback to local store
      console.error('DB error, falling back to local store', String(dbErr))
    }

    // Merge local records (if any)
    const local = await localStore.getLocalRecordsByPatient(patientId)
    const records = [...local, ...dbRecords]
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
    // Resolve patientId if the caller passed a User.id
    let resolvedPatientId = patientId;
    try {
      const patientProfile = await prisma.patientProfile.findUnique({ where: { userId: patientId } });
      if (patientProfile) resolvedPatientId = patientProfile.id;

      const record = await prisma.medicalRecord.create({
        data: {
          patientId: resolvedPatientId,
          title,
          recordType,
          recordDate: new Date(recordDate),
          description,
          attachments: attachments ?? [],
        },
      });
      return NextResponse.json({ record });
    } catch (dbErr) {
      // DB write failed; fallback to local store
      console.error('DB write failed, saving locally', String(dbErr))
      const localRecord = {
        id: `local_${Date.now()}`,
        patientId: resolvedPatientId,
        title,
        recordType,
        recordDate: new Date(recordDate).toISOString(),
        description,
        attachments: attachments ?? [],
        createdAt: new Date().toISOString()
      }
      await localStore.addLocalRecord(localRecord)
      return NextResponse.json({ record: localRecord });
    }
  } catch (error) {
    return NextResponse.json({ message: "Error creating record", error: String(error) }, { status: 500 });
  }
}
