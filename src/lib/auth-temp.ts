import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"

// Temporary auth configuration without Prisma
// This allows testing the UI while resolving database connection issues

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      image?: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: string
    image?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
  }
}

// Mock user database for testing - this will store registered users
const mockUsers: Array<{
  id: string
  email: string
  name: string
  password: string
  role: string
  isActive: boolean
}> = [
  {
    id: "1",
    email: "patient@test.com",
    name: "Test Patient",
    password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm", // password123
    role: "PATIENT",
    isActive: true
  },
  {
    id: "2", 
    email: "doctor@test.com",
    name: "Dr. Test Doctor",
    password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm", // password123
    role: "DOCTOR",
    isActive: true
  }
]

// Function to add new users from registration
export function addMockUser(userData: {
  email: string
  name: string
  password: string
  role: string
}) {
  const newUser = {
    id: `user_${Date.now()}`,
    email: userData.email,
    name: userData.name,
    password: userData.password,
    role: userData.role,
    isActive: true
  }
  
  // Check if user already exists
  const existingUser = mockUsers.find(u => u.email === userData.email)
  if (!existingUser) {
    mockUsers.push(newUser)
  }
  
  return newUser
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Only enable Google OAuth if credentials are provided
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET 
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          })
        ]
      : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials")
        }

        // Find user in mock database
        const user = mockUsers.find(u => u.email === credentials.email)

        if (!user) {
          throw new Error("User not found")
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        if (!isPasswordValid) {
          throw new Error("Invalid password")
        }

        if (!user.isActive) {
          throw new Error("Account is deactivated")
        }

        // If the client requested a specific role, enforce it here
        if (credentials.role && user.role && credentials.role !== user.role) {
          throw new Error(`Role mismatch: this account is registered as ${user.role}`)
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    },
    async signIn({ user, account }) {
      // Handle OAuth sign-in
      if (account?.provider === "google") {
        // Check if user already exists in mock database
        const existingUser = mockUsers.find(u => u.email === user.email)
        
        if (!existingUser) {
          // Create new mock user with PATIENT role by default
          const newUser = {
            id: `google_${Date.now()}`,
            email: user.email!,
            name: user.name!,
            password: "", // No password for OAuth users
            role: "PATIENT",
            isActive: true
          }
          mockUsers.push(newUser)
        }
        return true
      }
      return true
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
}