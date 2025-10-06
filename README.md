# MediAssist AI - Personalized Medical Diagnostics Platform

A comprehensive, AI-powered medical platform designed for hospitals and clinics to automate patient intake, generate intelligent medical summaries, and streamline digital prescription management.

## 🏥 Overview  

MediAssist AI revolutionizes healthcare delivery by combining cutting-edge artificial intelligence with intuitive user experience design. The platform serves both patients and healthcare providers with secure, HIPAA-compliant tools for modern medical practice.

### Key Features 

- **🤖 AI-Powered Diagnostics**: Advanced NLP analysis of patient symptoms
- **🎤 Voice Recognition**: Speech-to-text conversion for natural symptom description
- **📱 Smart Appointment Booking**: Intelligent scheduling with doctor matching
- **📋 Digital Prescriptions**: Secure, digitally-signed prescription management
- **🔒 HIPAA Compliant**: Enterprise-grade security and data protection
- **📊 Real-time Analytics**: Comprehensive dashboards for healthcare providers
- **🌐 Multi-platform**: Responsive design for desktop, tablet, and mobile

## 🚀 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Radix UI** - Accessible component primitives
- **Heroicons** - Beautiful SVG icons

### Backend & Database
- **Node.js** - JavaScript runtime
- **Prisma ORM** - Type-safe database client
- **PostgreSQL** - Robust relational database
- **NextAuth.js** - Authentication and session management
- **bcryptjs** - Password hashing

### AI & Integration
- **OpenAI GPT** - Natural language processing
- **Whisper API** - Speech-to-text conversion
- **LangChain** - AI workflow orchestration

### Security & Deployment
- **JWT** - Secure token-based authentication
- **HTTPS/TLS** - Encrypted data transmission
- **Docker** - Containerized deployment
- **Vercel** - Frontend hosting and deployment

## 📋 Prerequisites

Before running this project, ensure you have:

- **Node.js** 18.x or higher
- **PostgreSQL** 14.x or higher
- **npm** or **yarn** package manager
- **OpenAI API Key** for AI features
- **Google OAuth credentials** (optional)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/mediassist-ai.git
cd mediassist-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/mediassist_ai?schema=public"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OpenAI API
OPENAI_API_KEY="your-openai-api-key"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# File Upload (AWS S3 or similar)
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="mediassist-uploads"

# Encryption Keys (for HIPAA compliance)
ENCRYPTION_KEY="your-256-bit-encryption-key"
JWT_SECRET="your-jwt-secret"

# Application Settings
NODE_ENV="development"
APP_URL="http://localhost:3000"
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed the database
npx prisma db seed
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 👥 User Roles & Features

### 👤 Patients

**Appointment Management**
- Browse available doctors by specialization
- Book appointments with real-time availability
- Receive appointment confirmations and reminders

**Symptom Input**
- Structured digital forms for medical history
- Voice recording for natural symptom description
- File upload for medical reports and images
- Pain level and symptom duration tracking

**AI Analysis Access**
- View AI-generated preliminary assessments
- Access doctor-approved prescriptions only
- Track appointment history and medical records

### 👨‍⚕️ Doctors

**Patient Management**
- Comprehensive dashboard with upcoming appointments
- Patient case reviews with AI-generated summaries
- Search patients by reference ID or name

**AI Summary Review**
- Review AI-analyzed patient symptoms
- Edit, approve, or modify AI recommendations
- Add personal notes and observations

**Prescription Management**
- Create digital prescriptions with e-signatures
- Medication management with dosage instructions
- Share prescriptions via portal, email, or SMS

**Voice Verification (New Feature)**
- Record fresh patient voice notes during visits
- AI comparison with initial intake voice/text
- Three-level summary generation:
  - Key Highlights (bullet points)
  - Brief Explanation (3-5 sentences)
  - Detailed Description (full comparison)

## 🔐 Security Features

### HIPAA Compliance
- **Data Encryption**: AES-256 encryption for sensitive data
- **Access Controls**: Role-based permissions (RBAC)
- **Audit Logging**: Comprehensive activity tracking
- **Secure Transmission**: HTTPS/TLS for all communications

### Authentication & Authorization
- **Multi-Factor Authentication (MFA)**: Enhanced security for doctor accounts
- **Session Management**: Secure JWT-based sessions
- **Password Security**: bcrypt hashing with salt rounds
- **OAuth Integration**: Google OAuth for simplified login

### Data Protection
- **Input Validation**: Comprehensive server-side validation
- **SQL Injection Prevention**: Prisma ORM protection
- **XSS Protection**: Content Security Policy headers
- **Rate Limiting**: API endpoint protection

## 🎨 UI/UX Design

### Design System
- **Color Palette**: Medical-themed blue/green gradients with soft pastels
- **Typography**: Inter font family for readability
- **Components**: Consistent design language with Radix UI
- **Animations**: Smooth Framer Motion transitions

### Accessibility
- **WCAG 2.1 Compliant**: AA accessibility standards
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Semantic HTML and ARIA labels
- **High Contrast Mode**: Enhanced visibility options

### Responsive Design
- **Mobile-First**: Optimized for all device sizes
- **Progressive Enhancement**: Works without JavaScript
- **Touch-Friendly**: Large tap targets and gestures
- **Fast Loading**: Optimized images and code splitting

## 🤖 AI Features

### Natural Language Processing
- **Symptom Analysis**: Extract structured data from free-text descriptions
- **Medical Entity Recognition**: Identify conditions, medications, and symptoms
- **Risk Assessment**: Urgency level classification
- **Treatment Suggestions**: Evidence-based preliminary recommendations

### Voice Processing
- **Speech-to-Text**: High-accuracy medical transcription
- **Voice Comparison**: Compare patient voice notes over time
- **Multi-language Support**: International patient support
- **Noise Filtering**: Clear audio processing in clinical environments

### Machine Learning
- **Continuous Learning**: Model improvement from anonymized data
- **Confidence Scoring**: AI prediction reliability metrics
- **Pattern Recognition**: Identify symptom correlations
- **Personalization**: Tailored recommendations based on patient history

## 📊 API Documentation

### Authentication Endpoints
```
POST /api/auth/register - User registration
POST /api/auth/signin - User login
POST /api/auth/signout - User logout
GET /api/auth/session - Get current session
```

### Patient Endpoints
```
GET /api/patient/profile - Get patient profile
PUT /api/patient/profile - Update patient profile
GET /api/patient/appointments - List patient appointments
POST /api/patient/appointments - Create new appointment
GET /api/patient/prescriptions - Get patient prescriptions
```

### Doctor Endpoints
```
GET /api/doctor/dashboard - Doctor dashboard data
GET /api/doctor/patients - List assigned patients
GET /api/doctor/appointments - Doctor's appointments
PUT /api/doctor/appointments/:id - Update appointment
POST /api/doctor/prescriptions - Create prescription
```

### AI Endpoints
```
POST /api/ai/analyze-symptoms - Analyze patient symptoms
POST /api/ai/voice-to-text - Convert voice to text
POST /api/ai/compare-voice - Compare voice recordings
GET /api/ai/summary/:id - Get AI summary
```

## 🧪 Testing

### Running Tests
```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

### Test Structure
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full user workflow testing
- **Security Tests**: Vulnerability and penetration testing

## 🚀 Deployment

### Docker Deployment

```bash
# Build Docker image
docker build -t mediassist-ai .

# Run container
docker run -p 3000:3000 mediassist-ai
```

### Kubernetes Deployment

```bash
# Apply Kubernetes configurations
kubectl apply -f k8s/

# Check deployment status
kubectl get pods
```

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Monitoring and logging setup
- [ ] Backup strategy implemented
- [ ] Security scanning completed
- [ ] Performance testing passed
- [ ] HIPAA compliance verified

## 🔧 Development

### Project Structure
```
mediassist-ai/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utility functions and configurations
│   └── types/               # TypeScript type definitions
├── prisma/                  # Database schema and migrations
├── public/                  # Static assets
├── docs/                    # Documentation
└── tests/                   # Test files
```

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Airbnb configuration with custom rules
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality assurance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [API Documentation](docs/api.md)
- [Deployment Guide](docs/deployment.md)
- [Security Guidelines](docs/security.md)
- [Troubleshooting](docs/troubleshooting.md)

### Community
- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: Community Q&A and ideas
- **Discord**: Real-time developer chat
- **Email**: support@mediassist-ai.com

## 🙏 Acknowledgments

- **OpenAI** for GPT and Whisper APIs
- **Vercel** for Next.js framework
- **Prisma** for database tooling
- **Radix UI** for accessible components
- **Healthcare community** for valuable feedback

---

**⚠️ Important Notice**: This is a demonstration project. For production use in healthcare environments, ensure proper medical device certification, regulatory compliance, and professional medical oversight.

**🔒 Privacy**: Patient data privacy and security are paramount. Always follow HIPAA guidelines and local healthcare regulations when handling medical information.