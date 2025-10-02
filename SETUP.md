# MediAssist AI - Development Setup Guide

This guide will help you set up the MediAssist AI platform for development.

## 🚀 Quick Start

### 1. Prerequisites

Ensure you have the following installed:
- **Node.js** 18.x or higher
- **PostgreSQL** 14.x or higher
- **Git**
- **npm** or **yarn**

### 2. Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-username/mediassist-ai.git
cd mediassist-ai

# Install dependencies
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/mediassist_ai?schema=public"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-make-it-long-and-random"

# OpenAI API (Required for AI features)
OPENAI_API_KEY="sk-your-openai-api-key"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Application Settings
NODE_ENV="development"
APP_URL="http://localhost:3000"
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Create and run migrations
npm run db:migrate

# (Optional) Open Prisma Studio to view data
npm run db:studio
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🔧 Development Workflow

### Available Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
```

### Project Structure

```
mediassist-ai/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── patient/           # Patient-facing pages
│   │   ├── doctor/            # Doctor-facing pages
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Homepage
│   ├── components/            # Reusable components
│   │   ├── ui/               # Base UI components
│   │   ├── layout/           # Layout components
│   │   └── providers/        # Context providers
│   └── lib/                  # Utilities and configurations
│       ├── auth.ts           # NextAuth configuration
│       ├── prisma.ts         # Prisma client
│       └── utils.ts          # Utility functions
├── prisma/
│   └── schema.prisma         # Database schema
├── public/                   # Static assets
├── Dockerfile               # Docker configuration
├── docker-compose.yml       # Multi-container setup
└── README.md               # Project documentation
```

## 👥 User Accounts for Testing

### Test Patient Account
- **Email**: patient@test.com
- **Password**: password123
- **Role**: PATIENT

### Test Doctor Account
- **Email**: doctor@test.com
- **Password**: password123
- **Role**: DOCTOR
- **License**: MD123456

## 🎯 Key Features Implemented

### ✅ Completed Features

1. **Project Setup**
   - Next.js 14 with TypeScript
   - TailwindCSS for styling
   - Prisma ORM with PostgreSQL
   - Modern UI components with Radix UI

2. **Authentication System**
   - NextAuth.js integration
   - Role-based access control (Patient/Doctor)
   - Google OAuth support
   - Secure password hashing

3. **Patient Interface**
   - Multi-step appointment booking
   - Symptom input with voice recording
   - File upload for medical documents
   - Appointment confirmation system

4. **Doctor Dashboard**
   - Comprehensive appointment management
   - Patient search and filtering
   - AI summary review interface
   - Quick action shortcuts

5. **Database Schema**
   - HIPAA-compliant data structure
   - User profiles and medical records
   - Appointment and prescription management
   - Audit logging for security

6. **Deployment Ready**
   - Docker configuration
   - Docker Compose for multi-container setup
   - Production-ready build process

### 🚧 Pending Implementation

The following features are designed but require additional implementation:

1. **AI Integration**
   - OpenAI GPT integration for symptom analysis
   - Whisper API for voice-to-text conversion
   - Medical summary generation

2. **Voice Comparison Feature**
   - In-person voice recording
   - AI comparison with initial intake
   - Three-level summary generation

3. **Backend APIs**
   - RESTful API endpoints
   - GraphQL integration
   - Real-time WebSocket connections

4. **Security Enhancements**
   - HIPAA-grade encryption
   - Advanced audit logging
   - Multi-factor authentication

## 🔐 Security Considerations

### Development Security
- Never commit `.env` files
- Use strong, unique passwords
- Enable 2FA on all accounts
- Regular dependency updates

### Production Security
- HTTPS/TLS encryption required
- Database encryption at rest
- Regular security audits
- HIPAA compliance validation

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   # Check PostgreSQL is running
   pg_ctl status
   
   # Restart PostgreSQL
   brew services restart postgresql
   ```

2. **Prisma Client Error**
   ```bash
   # Regenerate Prisma client
   npm run db:generate
   ```

3. **Port Already in Use**
   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   ```

4. **Environment Variables Not Loading**
   - Ensure `.env.local` is in the root directory
   - Restart the development server
   - Check for typos in variable names

### Getting Help

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check README.md for detailed information
- **Community**: Join our Discord for real-time support

## 📚 Next Steps

1. **Implement AI Features**: Integrate OpenAI APIs for symptom analysis
2. **Add Real-time Features**: WebSocket connections for live updates
3. **Enhance Security**: Implement HIPAA-grade encryption
4. **Mobile App**: React Native companion app
5. **Analytics**: Add comprehensive reporting dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

### Code Standards
- TypeScript strict mode
- ESLint with Airbnb configuration
- Prettier for code formatting
- Conventional commit messages

---

**Happy coding! 🚀**

For questions or support, please open an issue on GitHub or contact the development team.
