import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId || userId !== session.user.id) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Find the patient profile
    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId }
    });

    if (!patientProfile) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
    }

    // Get completed appointments that don't already have medical records
    const completedAppointments = await prisma.appointment.findMany({
      where: {
        patientId: patientProfile.id,
        status: 'COMPLETED'
      },
      include: {
        doctor: {
          include: {
            user: true
          }
        },
        aiSummary: true,
        prescription: {
          include: {
            medications: true
          }
        }
      }
    });

    const createdRecords = [];

    for (const appointment of completedAppointments) {
      // Check if medical record already exists for this appointment
      const existingRecord = await prisma.medicalRecord.findFirst({
        where: {
          patientId: patientProfile.id,
          recordData: {
            path: ['appointmentId'],
            equals: appointment.id
          }
        }
      });

      if (existingRecord) {
        continue; // Skip if record already exists
      }

      // Create medical record from appointment
      let title = `Appointment with ${appointment.doctor.user?.name || 'Doctor'}`;
      let description = appointment.chiefComplaint || 'Medical consultation';
      let recordType = 'CONSULTATION';

      // Enhanced description from AI summary
      if (appointment.aiSummary) {
        const summary = appointment.aiSummary;
        if (summary.symptomsList && summary.symptomsList.length > 0) {
          description += `\n\nSymptoms: ${summary.symptomsList.join(', ')}`;
        }
        if (summary.possibleConditions && summary.possibleConditions.length > 0) {
          description += `\n\nPossible conditions: ${summary.possibleConditions.join(', ')}`;
        }
        if (summary.preliminaryTreatment) {
          description += `\n\nTreatment: ${summary.preliminaryTreatment}`;
        }
        if (summary.suggestedTests && summary.suggestedTests.length > 0) {
          description += `\n\nSuggested tests: ${summary.suggestedTests.join(', ')}`;
        }
        
        // Determine record type based on AI analysis
        if (summary.possibleConditions && summary.possibleConditions.length > 0) {
          recordType = 'DIAGNOSIS';
        } else if (summary.preliminaryTreatment) {
          recordType = 'TREATMENT';
        }
      }

      // Add prescription information
      if (appointment.prescription && appointment.prescription.medications) {
        const medications = appointment.prescription.medications.map(med => 
          `${med.medicationName} - ${med.dosage} ${med.frequency}`
        ).join(', ');
        description += `\n\nPrescription: ${medications}`;
        if (appointment.prescription.instructions) {
          description += `\nInstructions: ${appointment.prescription.instructions}`;
        }
      }

      // Create the medical record
      const record = await prisma.medicalRecord.create({
        data: {
          patientId: patientProfile.id,
          recordType: recordType as any,
          title,
          description,
          recordDate: appointment.scheduledDate,
          createdBy: appointment.doctor.userId,
          recordData: {
            appointmentId: appointment.id,
            referenceId: appointment.referenceId,
            doctorName: appointment.doctor.user?.name,
            specialization: appointment.doctor.specialization,
            aiSummaryId: appointment.aiSummary?.id,
            prescriptionId: appointment.prescription?.id,
            urgencyLevel: appointment.aiSummary?.urgencyLevel,
            confidenceScore: appointment.aiSummary?.confidenceScore
          },
          attachments: []
        }
      });

      createdRecords.push(record);
    }

    return NextResponse.json({ 
      message: `Generated ${createdRecords.length} medical records from completed appointments`,
      records: createdRecords 
    });

  } catch (error) {
    console.error('Error generating medical records:', error);
    return NextResponse.json({ 
      error: 'Failed to generate medical records',
      details: String(error)
    }, { status: 500 });
  }
}