import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding...')

  // Create two doctors
  const hashed = await bcrypt.hash('password123', 12)

  const doc1 = await prisma.user.upsert({
    where: { email: 'dr.sarah@demo.local' },
    update: {},
    create: {
      email: 'dr.sarah@demo.local',
      name: 'Dr. Sarah Johnson',
      password: hashed,
      role: 'DOCTOR',
      isActive: true,
      doctorProfile: {
        create: {
          licenseNumber: 'LIC-SARAH-001',
          specialization: ['Cardiology'],
          qualifications: ['MD'],
          yearsOfExperience: 10,
          consultationFee: 150,
        }
      }
    }
  })

  const doc2 = await prisma.user.upsert({
    where: { email: 'dr.michael@demo.local' },
    update: {},
    create: {
      email: 'dr.michael@demo.local',
      name: 'Dr. Michael Chen',
      password: hashed,
      role: 'DOCTOR',
      isActive: true,
      doctorProfile: {
        create: {
          licenseNumber: 'LIC-MICHAEL-001',
          specialization: ['General Practice'],
          qualifications: ['MBBS'],
          yearsOfExperience: 8,
          consultationFee: 100,
        }
      }
    }
  })

  // Create a patient user
  const patient = await prisma.user.upsert({
    where: { email: 'patient.demo@demo.local' },
    update: {},
    create: {
      email: 'patient.demo@demo.local',
      name: 'Demo Patient',
      password: hashed,
      role: 'PATIENT',
      isActive: true,
      patientProfile: {
        create: {
          // minimal patient profile
          allergies: [],
          chronicConditions: [],
          currentMedications: [],
        }
      }
    }
  })

  // Create a sample appointment
  // Find created patient profile id
  const patientProfile = await prisma.patientProfile.findUnique({ where: { userId: patient.id } })
  // Find doctor profiles for created doctors
  const doc1Profile = await prisma.doctorProfile.findUnique({ where: { userId: doc1.id } })
  const doc2Profile = await prisma.doctorProfile.findUnique({ where: { userId: doc2.id } })
  if (patientProfile) {
    await prisma.appointment.create({
      data: {
        patientId: patientProfile.id,
        doctorId: doc1Profile?.id ?? doc2Profile?.id ?? '',
        scheduledDate: new Date(),
        chiefComplaint: 'Chest pain',
        symptoms: { text: 'Sharp pain in chest for 2 hours' },
        painLevel: 6,
        status: 'SCHEDULED',
      }
    }).catch(e => console.error('Appointment seed error:', e))
  }

  console.log('Seeding finished')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
