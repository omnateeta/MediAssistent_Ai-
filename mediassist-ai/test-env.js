require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env', override: false });

console.log('Environment Variables Test:');
console.log('========================');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL length:', process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0);
console.log('USE_TEMP_AUTH:', process.env.USE_TEMP_AUTH);
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);

// Test database connection
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection: SUCCESS');
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`✅ User count in database: ${userCount}`);
    
    // Check if we're using temporary auth
    const shouldUseTempAuth = !process.env.DATABASE_URL || process.env.USE_TEMP_AUTH === '1';
    console.log('shouldUseTempAuth:', shouldUseTempAuth);
  } catch (error) {
    console.log('❌ Database connection FAILED:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();