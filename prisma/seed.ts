import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Comprehensive doctor data with all major specializations
const doctorSeedData = [
  {
    email: "dr.sarah.cardio@mediassist.ai",
    name: "Dr. Sarah Johnson",
    role: "DOCTOR",
    isActive: true,
    doctorProfile: {
      licenseNumber: "MD-CARD-2023-001",
      specialization: ["Cardiology"],
      yearsOfExperience: 15,
      consultationFee: 200,
      hospitalAffiliation: "Heart Care Medical Center",
      qualifications: ["MD", "Cardiology Fellowship", "Board Certified Cardiologist"],
      languagesSpoken: ["English", "Spanish"],
      isAvailable: true,
      isVerified: true
    }
  },
  {
    email: "dr.michael.gp@mediassist.ai",
    name: "Dr. Michael Chen",
    role: "DOCTOR",
    isActive: true,
    doctorProfile: {
      licenseNumber: "MD-GP-2023-002",
      specialization: ["General Practice"],
      yearsOfExperience: 12,
      consultationFee: 120,
      hospitalAffiliation: "Community Health Center",
      qualifications: ["MBBS", "Family Medicine"],
      languagesSpoken: ["English", "Mandarin"],
      isAvailable: true,
      isVerified: true
    }
  },
  {
    email: "dr.emily.derm@mediassist.ai",
    name: "Dr. Emily Rodriguez",
    role: "DOCTOR",
    isActive: true,
    doctorProfile: {
      licenseNumber: "MD-DERM-2023-003",
      specialization: ["Dermatology"],
      yearsOfExperience: 10,
      consultationFee: 180,
      hospitalAffiliation: "Skin & Beauty Institute",
      qualifications: ["MD", "Dermatology Residency", "Cosmetic Dermatology"],
      languagesSpoken: ["English", "Spanish"],
      isAvailable: true,
      isVerified: true
    }
  },
  {
    email: "dr.david.endo@mediassist.ai",
    name: "Dr. David Kumar",
    role: "DOCTOR",
    isActive: true,
    doctorProfile: {
      licenseNumber: "MD-ENDO-2023-004",
      specialization: ["Endocrinology"],
      yearsOfExperience: 13,
      consultationFee: 190,
      hospitalAffiliation: "Diabetes & Hormone Center",
      qualifications: ["MD", "Endocrinology Fellowship", "Diabetes Specialist"],
      languagesSpoken: ["English", "Hindi"],
      isAvailable: true,
      isVerified: true
    }
  },
  {
    email: "dr.lisa.gastro@mediassist.ai",
    name: "Dr. Lisa Thompson",
    role: "DOCTOR",
    isActive: true,
    doctorProfile: {
      licenseNumber: "MD-GAST-2023-005",
      specialization: ["Gastroenterology"],
      yearsOfExperience: 11,
      consultationFee: 185,
      hospitalAffiliation: "Digestive Health Clinic",
      qualifications: ["MD", "Gastroenterology Fellowship", "Hepatology"],
      languagesSpoken: ["English"],
      isAvailable: true,
      isVerified: true
    }
  },
  {
    email: "dr.james.neuro@mediassist.ai",
    name: "Dr. James Wilson",
    role: "DOCTOR",
    isActive: true,
    doctorProfile: {
      licenseNumber: "MD-NEUR-2023-006",
      specialization: ["Neurology"],
      yearsOfExperience: 16,
      consultationFee: 220,
      hospitalAffiliation: "Brain & Spine Institute",
      qualifications: ["MD", "PhD Neuroscience", "Board Certified Neurologist"],
      languagesSpoken: ["English", "French"],
      isAvailable: true,
      isVerified: true
    }
  },
  {
    email: "dr.maria.onco@mediassist.ai",
    name: "Dr. Maria Garcia",
    role: "DOCTOR",
    isActive: true,
    doctorProfile: {
      licenseNumber: "MD-ONCO-2023-007",
      specialization: ["Oncology"],
      yearsOfExperience: 14,
      consultationFee: 250,
      hospitalAffiliation: "Cancer Treatment Center",
      qualifications: ["MD", "Medical Oncology Fellowship", "Hematology-Oncology"],
      languagesSpoken: ["English", "Spanish"],
      isAvailable: true,
      isVerified: true
    }
  },
  {
    email: "dr.robert.ortho@mediassist.ai",
    name: "Dr. Robert Anderson",
    role: "DOCTOR",
    isActive: true,
    doctorProfile: {
      licenseNumber: "MD-ORTH-2023-008",
      specialization: ["Orthopedics"],
      yearsOfExperience: 18,
      consultationFee: 195,
      hospitalAffiliation: "Sports Medicine Institute",
      qualifications: ["MD", "Orthopedic Surgery", "Sports Medicine"],
      languagesSpoken: ["English"],
      isAvailable: true,
      isVerified: true
    }
  },
  {
    email: "dr.susan.peds@mediassist.ai",
    name: "Dr. Susan Lee",
    role: "DOCTOR",
    isActive: true,
    doctorProfile: {
      licenseNumber: "MD-PEDS-2023-009",
      specialization: ["Pediatrics"],
      yearsOfExperience: 9,
      consultationFee: 140,
      hospitalAffiliation: "Children's Medical Center",
      qualifications: ["MD", "Pediatrics Residency", "Child Development"],
      languagesSpoken: ["English", "Korean"],
      isAvailable: true,
      isVerified: true
    }
  },
  {
    email: "dr.alex.psych@mediassist.ai",
    name: "Dr. Alex Martinez",
    role: "DOCTOR",
    isActive: true,
    doctorProfile: {
      licenseNumber: "MD-PSYC-2023-010",
      specialization: ["Psychiatry"],
      yearsOfExperience: 12,
      consultationFee: 175,
      hospitalAffiliation: "Mental Health Institute",
      qualifications: ["MD", "Psychiatry Residency", "Cognitive Behavioral Therapy"],
      languagesSpoken: ["English", "Spanish"],
      isAvailable: true,
      isVerified: true
    }
  },
  {
    email: "dr.jennifer.pulm@mediassist.ai",
    name: "Dr. Jennifer Brown",
    role: "DOCTOR",
    isActive: true,
    doctorProfile: {
      licenseNumber: "MD-PULM-2023-011",
      specialization: ["Pulmonology"],
      yearsOfExperience: 11,
      consultationFee: 190,
      hospitalAffiliation: "Respiratory Care Center",
      qualifications: ["MD", "Pulmonary Medicine Fellowship", "Critical Care"],
      languagesSpoken: ["English"],
      isAvailable: true,
      isVerified: true
    }
  },
  {
    email: "dr.kevin.uro@mediassist.ai",
    name: "Dr. Kevin Davis",
    role: "DOCTOR",
    isActive: true,
    doctorProfile: {
      licenseNumber: "MD-URO-2023-012",
      specialization: ["Urology"],
      yearsOfExperience: 13,
      consultationFee: 185,
      hospitalAffiliation: "Urology Specialists Group",
      qualifications: ["MD", "Urology Residency", "Minimally Invasive Surgery"],
      languagesSpoken: ["English"],
      isAvailable: true,
      isVerified: true
    }
  },
  {
    email: "dr.anna.ophthal@mediassist.ai",
    name: "Dr. Anna Taylor",
    role: "DOCTOR",
    isActive: true,
    doctorProfile: {
      licenseNumber: "MD-OPHT-2023-013",
      specialization: ["Ophthalmology"],
      yearsOfExperience: 10,
      consultationFee: 170,
      hospitalAffiliation: "Eye Care Institute",
      qualifications: ["MD", "Ophthalmology Residency", "Retinal Surgery"],
      languagesSpoken: ["English"],
      isAvailable: true,
      isVerified: true
    }
  },
  {
    email: "dr.thomas.ent@mediassist.ai",
    name: "Dr. Thomas White",
    role: "DOCTOR",
    isActive: true,
    doctorProfile: {
      licenseNumber: "MD-ENT-2023-014",
      specialization: ["ENT (Otolaryngology)"],
      yearsOfExperience: 14,
      consultationFee: 165,
      hospitalAffiliation: "Head & Neck Surgery Center",
      qualifications: ["MD", "ENT Residency", "Head and Neck Surgery"],
      languagesSpoken: ["English"],
      isAvailable: true,
      isVerified: true
    }
  },
  {
    email: "dr.rachel.rheum@mediassist.ai",
    name: "Dr. Rachel Green",
    role: "DOCTOR",
    isActive: true,
    doctorProfile: {
      licenseNumber: "MD-RHEU-2023-015",
      specialization: ["Rheumatology"],
      yearsOfExperience: 12,
      consultationFee: 180,
      hospitalAffiliation: "Arthritis & Rheumatology Center",
      qualifications: ["MD", "Rheumatology Fellowship", "Autoimmune Disorders"],
      languagesSpoken: ["English"],
      isAvailable: true,
      isVerified: true
    }
  }
]

async function main() {
  console.log('Seeding comprehensive doctor database...')

  const hashed = await bcrypt.hash('password123', 12)

  // Create all doctors
  for (const doctorData of doctorSeedData) {
    await prisma.user.upsert({
      where: { email: doctorData.email },
      update: {},
      create: {
        email: doctorData.email,
        name: doctorData.name,
        password: hashed,
        role: doctorData.role as any,
        isActive: doctorData.isActive,
        doctorProfile: {
          create: doctorData.doctorProfile
        }
      }
    })
    console.log(`✓ Created doctor: ${doctorData.name} (${doctorData.doctorProfile.specialization.join(', ')})`)
  }

  // Create demo patient users
  const patients = [
    {
      email: 'patient.demo@mediassist.ai',
      name: 'Demo Patient',
    },
    {
      email: 'jane.doe@mediassist.ai',
      name: 'Jane Doe',
    },
    {
      email: 'john.smith@mediassist.ai',
      name: 'John Smith',
    }
  ]

  for (const patientData of patients) {
    await prisma.user.upsert({
      where: { email: patientData.email },
      update: {},
      create: {
        email: patientData.email,
        name: patientData.name,
        password: hashed,
        role: 'PATIENT',
        isActive: true,
        patientProfile: {
          create: {
            allergies: [],
            chronicConditions: [],
            currentMedications: [],
          }
        }
      }
    })
    console.log(`✓ Created patient: ${patientData.name}`)
  }

  // Get a sample doctor and patient for appointment demo
  const sampleDoctor = await prisma.doctorProfile.findFirst({
    where: { isAvailable: true, isVerified: true }
  })
  const samplePatient = await prisma.patientProfile.findFirst()

  if (sampleDoctor && samplePatient) {
    // Create some sample appointments
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0)

    await prisma.appointment.create({
      data: {
        patientId: samplePatient.id,
        doctorId: sampleDoctor.id,
        scheduledDate: tomorrow,
        chiefComplaint: 'Annual checkup',
        symptoms: { text: 'Routine health examination' },
        painLevel: 1,
        status: 'SCHEDULED',
      }
    }).catch(e => console.error('Appointment seed error:', e))

    console.log('✓ Created sample appointment')
  }

  // Verify specializations
  const allSpecializations = await prisma.doctorProfile.findMany({
    where: { isAvailable: true, isVerified: true },
    select: { specialization: true }
  })
  
  const uniqueSpecs = [...new Set(allSpecializations.flatMap(p => p.specialization))]
  console.log(`\n✓ Available specializations (${uniqueSpecs.length}):`, uniqueSpecs.sort())
  
  console.log('\n🎉 Comprehensive seeding completed successfully!')
}

main()
  .catch(e => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    console.log('\n📦 Database connection closed.')
  })
