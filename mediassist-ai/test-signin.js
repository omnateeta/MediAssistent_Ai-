require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env', override: false });

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSignIn(email) {
  try {
    console.log(`Testing sign-in for: ${email}`);
    
    // Check if user exists in database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        patientProfile: true,
        doctorProfile: true,
      }
    });
    
    if (!user) {
      console.log('❌ User not found in database');
      return;
    }
    
    console.log('✅ User found in database');
    console.log(`  Role: ${user.role}`);
    console.log(`  Active: ${user.isActive}`);
    console.log(`  Has password: ${!!user.password}`);
    console.log(`  Patient profile: ${!!user.patientProfile}`);
    console.log(`  Doctor profile: ${!!user.doctorProfile}`);
    
    // Test case sensitivity
    console.log('\nTesting case sensitivity...');
    const lowercaseUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    
    const uppercaseUser = await prisma.user.findUnique({
      where: { email: email.toUpperCase() }
    });
    
    console.log(`  Lowercase lookup: ${!!lowercaseUser}`);
    console.log(`  Uppercase lookup: ${!!uppercaseUser}`);
    
  } catch (error) {
    console.error('❌ Error during sign-in test:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Test with a known user from our database
testSignIn('test@gmail.com');