# 🚀 Quick Fix Guide - MediAssist AI

## Issues Fixed

### ✅ 1. Viewport Metadata Warning
- **Fixed**: Moved viewport configuration to separate export in `src/app/layout.tsx`
- **Status**: ✅ Resolved

### ✅ 2. Registration API 500 Error
- **Fixed**: Added better error handling and database connection checks
- **Status**: ✅ Improved with detailed error messages

## 🔧 Setup Instructions

### Step 1: Environment Configuration
```bash
# Copy the environment template
cp .env.example .env.local

# Edit .env.local with your database credentials
# Minimum required:
DATABASE_URL="postgresql://username:password@localhost:5432/mediassist_ai?schema=public"
NEXTAUTH_SECRET="your-very-long-random-secret-key-here"
```

### Step 2: Database Setup
```bash
# Option A: Use our setup script (recommended)
npm run db:setup

# Option B: Manual setup
npm run db:generate
npm run db:migrate
```

### Step 3: Start Development Server
```bash
npm run dev
```

## 🐛 Troubleshooting

### Database Connection Issues

1. **PostgreSQL not running?**
   ```bash
   # On macOS with Homebrew
   brew services start postgresql
   
   # On Windows
   net start postgresql-x64-14
   
   # On Linux
   sudo systemctl start postgresql
   ```

2. **Database doesn't exist?**
   ```sql
   -- Connect to PostgreSQL and create database
   CREATE DATABASE mediassist_ai;
   ```

3. **Wrong credentials?**
   - Check your DATABASE_URL in `.env.local`
   - Ensure username/password are correct
   - Verify the database name exists

### API Registration Error

The registration endpoint now provides detailed error messages:

- **503**: Database connection failed
- **400**: Validation errors (missing fields, invalid email, etc.)
- **409**: User already exists
- **500**: Internal server error (with details in development)

### Quick Test

1. **Health Check**: Visit `http://localhost:3000/api/health`
   - Should return: `{"status":"healthy"}`

2. **Registration Test**: Try creating a user through the signup page
   - If it fails, check the browser console for detailed error messages

## 🎯 What's Working Now

- ✅ Viewport metadata properly configured
- ✅ Better error handling in registration API
- ✅ Database connection testing
- ✅ Detailed error messages for debugging
- ✅ Health check endpoint for monitoring

## 🚀 Next Steps

1. Set up your database connection
2. Run the setup script: `npm run db:setup`
3. Start the dev server: `npm run dev`
4. Test registration at: `http://localhost:3000/auth/signup`

## 📞 Still Having Issues?

If you're still experiencing problems:

1. Check the terminal output for detailed error messages
2. Verify your `.env.local` configuration
3. Ensure PostgreSQL is running and accessible
4. Try the health check endpoint first: `/api/health`

The application is now much more robust and will provide clear error messages to help you debug any remaining issues!
