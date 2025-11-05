#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏥 MediAssist AI - Database Setup');
console.log('================================\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!');
  console.log('📝 Please create .env.local with your database configuration:');
  console.log('');
  console.log('DATABASE_URL="postgresql://username:password@localhost:5432/mediassist_ai?schema=public"');
  console.log('NEXTAUTH_SECRET="your-secret-key-here"');
  console.log('');
  process.exit(1);
}

try {
  console.log('🔧 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('\n📊 Running database migrations...');
  execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
  
  console.log('\n✅ Database setup completed successfully!');
  console.log('🚀 You can now run: npm run dev');
  
} catch (error) {
  console.error('\n❌ Database setup failed:', error.message);
  console.log('\n🔍 Troubleshooting tips:');
  console.log('1. Make sure PostgreSQL is running');
  console.log('2. Check your DATABASE_URL in .env.local');
  console.log('3. Ensure the database exists');
  console.log('4. Verify database credentials');
  process.exit(1);
}
