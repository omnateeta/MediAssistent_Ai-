const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with dummy data...');

  // Create a dummy user
  const user = await prisma.user.upsert({
    where: { email: 'patient@example.com' },
    update: {},
    create: {
      email: 'patient@example.com',
      name: 'Demo Patient',
      password: null,
      role: 'PATIENT',
    },
  });

  // Create a patient profile if missing
  const patientProfile = await prisma.patientProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      dateOfBirth: new Date('1990-01-01'),
      gender: 'OTHER',
      phoneNumber: '555-0100',
      address: '123 Demo St',
      city: 'Demo City',
      country: 'US',
      allergies: [],
      chronicConditions: [],
      currentMedications: [],
    },
  });

  // Create couple of medical records
  await prisma.medicalRecord.createMany({
    data: [
      {
        id: `rec_${Date.now()}_1`,
        patientId: patientProfile.id,
        recordType: 'DIAGNOSIS',
        title: 'Annual Checkup 2024',
        description: 'Routine annual physical. All vitals normal.',
        attachments: [],
        recordDate: new Date('2024-06-15'),
      },
      {
        id: `rec_${Date.now()}_2`,
        patientId: patientProfile.id,
        recordType: 'LAB_RESULT',
        title: 'Blood Test Results',
        description: 'Cholesterol slightly elevated.',
        attachments: ['lab-results-2024.pdf'],
        recordDate: new Date('2024-06-20'),
      },
    ],
    skipDuplicates: true,
  });

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
