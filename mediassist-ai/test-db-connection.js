const { PrismaClient } = require('@prisma/client');

// Load environment variables
require('dotenv').config();

async function testConnection() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('Attempting to connect to database...');
    console.log('Database URL:', process.env.DATABASE_URL);
    
    // Test the connection
    const result = await prisma.$queryRaw`SELECT 1`;
    console.log('Database connection successful!', result);
  } catch (error) {
    console.error('Database connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error meta:', error.meta);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();