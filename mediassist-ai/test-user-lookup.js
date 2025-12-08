const { PrismaClient } = require('@prisma/client');

async function testUserLookup() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing user lookup in database...');
    
    // List all users
    const users = await prisma.user.findMany({
      include: {
        patientProfile: true,
        doctorProfile: true
      }
    });
    
    console.log(`Found ${users.length} users in database:`);
    
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - Active: ${user.isActive}`);
      if (user.patientProfile) {
        console.log(`  Patient profile: ${user.patientProfile ? 'Exists' : 'None'}`);
      }
      if (user.doctorProfile) {
        console.log(`  Doctor profile: ${user.doctorProfile ? 'Exists' : 'None'}`);
      }
    });
    
    // Try to find a specific user
    if (users.length > 0) {
      const testUser = users[0];
      console.log(`\nTesting lookup for user: ${testUser.email}`);
      
      const foundUser = await prisma.user.findUnique({
        where: { email: testUser.email },
        include: {
          patientProfile: true,
          doctorProfile: true
        }
      });
      
      if (foundUser) {
        console.log('✅ User found successfully!');
        console.log(`Email: ${foundUser.email}`);
        console.log(`Role: ${foundUser.role}`);
        console.log(`Active: ${foundUser.isActive}`);
      } else {
        console.log('❌ User not found during lookup');
      }
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testUserLookup();