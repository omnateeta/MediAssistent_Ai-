import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any);
    const s = session as any;

    if (!s || !s.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find doctor's profile by userId
    const doctorProfile = await prisma.doctorProfile.findUnique({ 
      where: { userId: s.user.id } 
    });
    
    if (!doctorProfile) {
      return NextResponse.json({ patients: [] });
    }

    // Check if we're requesting basic patient list for appointment creation
    const { searchParams } = new URL(request.url);
    const basicList = searchParams.get('basic') === 'true';

    if (basicList) {
      // Return simplified patient list for appointment creation
      const appointments = await prisma.appointment.findMany({
        where: { doctorId: doctorProfile.id },
        include: {
          patient: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: { scheduledDate: 'desc' }
      });

      // Create unique patient list
      const uniquePatients = new Map();
      appointments.forEach((appointment: any) => {
        const patient = appointment.patient;
        if (!uniquePatients.has(patient.id)) {
          uniquePatients.set(patient.id, {
            id: patient.id,
            name: patient.user?.name || 'Unknown Patient',
            email: patient.user?.email || '',
            dateOfBirth: patient.dateOfBirth || undefined
          });
        }
      });

      const patients = Array.from(uniquePatients.values());
      return NextResponse.json({ patients });
    }

    // Get all appointments for this doctor with patient data
    const appointments = await prisma.appointment.findMany({
      where: { doctorId: doctorProfile.id },
      include: {
        patient: {
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
      },
      orderBy: { scheduledDate: 'desc' }
    });

    // Process appointments to create patient profiles with aggregated data
    const patientsMap = new Map();

    appointments.forEach((appointment: any) => {
      const patient = appointment.patient;
      const patientId = patient.id;

      if (!patientsMap.has(patientId)) {
        // Calculate age from date of birth
        const age = patient.dateOfBirth 
          ? Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
          : null;

        // Initialize patient data
        patientsMap.set(patientId, {
          id: patient.id,
          userId: patient.userId,
          name: patient.user?.name || 'Unknown Patient',
          email: patient.user?.email || '',
          age: age,
          gender: patient.gender || 'Not specified',
          contactInfo: patient.phoneNumber || 'No contact info',
          emergencyContact: patient.emergencyContact || 'Not provided',
          address: patient.address ? `${patient.address}, ${patient.city || ''}, ${patient.state || ''}`.trim() : 'No address',
          bloodType: patient.bloodType || 'Unknown',
          height: patient.height,
          weight: patient.weight,
          allergies: patient.allergies || [],
          chronicConditions: patient.chronicConditions || [],
          currentMedications: patient.currentMedications || [],
          insuranceProvider: patient.insuranceProvider,
          appointments: [],
          totalVisits: 0,
          completedVisits: 0,
          lastVisit: null as string | null,
          nextAppointment: null as string | null,
          hasActiveIssues: false,
          riskLevel: 'LOW' as string,
          conditions: [] as string[],
          recentSymptoms: [] as string[],
          currentPrescriptions: [] as string[]
        });
      }

      const patientData = patientsMap.get(patientId);
      patientData.appointments.push(appointment);
      patientData.totalVisits++;

      // Update visit statistics
      if (appointment.status === 'COMPLETED') {
        patientData.completedVisits++;
        const appointmentDate = appointment.scheduledDate.toISOString().split('T')[0];
        if (!patientData.lastVisit || appointmentDate > patientData.lastVisit) {
          patientData.lastVisit = appointmentDate;
        }
      }

      // Update next appointment
      if (['SCHEDULED', 'CONFIRMED'].includes(appointment.status)) {
        const appointmentDate = appointment.scheduledDate.toISOString().split('T')[0];
        if (!patientData.nextAppointment || appointmentDate < patientData.nextAppointment) {
          patientData.nextAppointment = appointmentDate;
        }
      }

      // Collect conditions from AI summaries
      if (appointment.aiSummary?.possibleConditions) {
        appointment.aiSummary.possibleConditions.forEach((condition: string) => {
          if (!patientData.conditions.includes(condition)) {
            patientData.conditions.push(condition);
          }
        });
      }

      // Collect recent symptoms
      if (appointment.aiSummary?.symptomsList) {
        appointment.aiSummary.symptomsList.forEach((symptom: string) => {
          if (!patientData.recentSymptoms.includes(symptom)) {
            patientData.recentSymptoms.push(symptom);
          }
        });
      }

      // Collect current prescriptions
      if (appointment.prescription?.medications) {
        appointment.prescription.medications.forEach((med: any) => {
          const medication = `${med.medicationName} ${med.dosage} ${med.frequency}`;
          if (!patientData.currentPrescriptions.includes(medication)) {
            patientData.currentPrescriptions.push(medication);
          }
        });
      }

      // Determine if patient has active issues
      if (['IN_PROGRESS', 'SCHEDULED', 'CONFIRMED'].includes(appointment.status) ||
          (appointment.aiSummary?.urgencyLevel && ['HIGH', 'CRITICAL'].includes(appointment.aiSummary.urgencyLevel))) {
        patientData.hasActiveIssues = true;
      }

      // Determine risk level
      if (appointment.aiSummary?.urgencyLevel === 'CRITICAL' || appointment.aiSummary?.urgencyLevel === 'HIGH') {
        patientData.riskLevel = 'HIGH';
      } else if (appointment.aiSummary?.urgencyLevel === 'MEDIUM' && patientData.riskLevel !== 'HIGH') {
        patientData.riskLevel = 'MEDIUM';
      }
    });

    // Convert map to array and format final data
    const patients = Array.from(patientsMap.values()).map(patient => ({
      ...patient,
      condition: patient.conditions.length > 0 
        ? patient.conditions.slice(0, 3).join(', ')
        : patient.chronicConditions.length > 0 
          ? patient.chronicConditions.slice(0, 2).join(', ')
          : 'No known conditions',
      medicalHistory: [
        ...patient.chronicConditions,
        ...patient.conditions
      ].filter((value, index, self) => self.indexOf(value) === index),
      // Don't expose internal arrays in the final response
      appointments: undefined,
      conditions: undefined,
      recentSymptoms: undefined
    }));

    return NextResponse.json({ patients });
  } catch (error) {
    console.error('Error fetching doctor patients:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch patients',
      patients: [] 
    }, { status: 500 });
  }
}