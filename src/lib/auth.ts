import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { prisma, isPrismaClientReady } from "@/lib/prisma"

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

export const authOptions: NextAuthOptions = {
  // Lazily attach PrismaAdapter only when client is ready to avoid module-eval crashes
  adapter: isPrismaClientReady ? PrismaAdapter(prisma) : undefined,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.warn('[NextAuth][Credentials] Missing credentials for authorize()')
            throw new Error('Missing credentials')
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: {
              patientProfile: true,
              doctorProfile: true,
            }
          })

          if (!user) {
            console.warn(`[NextAuth][Credentials] authorize() user not found for email=${credentials.email}`)
            throw new Error('User not found')
          }

          // For OAuth users, password might not be set
          if (user.password) {
            const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
            if (!isPasswordValid) {
              console.warn(`[NextAuth][Credentials] authorize() invalid password for userId=${user.id}`)
              throw new Error('Invalid password')
            }
          }

          // If the client requested a specific role, enforce it here
          if (credentials.role && user.role && credentials.role !== user.role) {
            console.warn(`[NextAuth][Credentials] authorize() role mismatch requested=${credentials.role} stored=${user.role} for email=${credentials.email}`)
            throw new Error(`Role mismatch: this account is registered as ${user.role}`)
          }

          if (!user.isActive) {
            console.warn(`[NextAuth][Credentials] authorize() account deactivated userId=${user.id}`)
            throw new Error('Account is deactivated')
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name ?? "",
            role: user.role,
            image: user.image ?? "",
          }
        } catch (err) {
          // Log the error for debugging but do not expose sensitive info
          console.error('[NextAuth][Credentials] authorize() error:', String(err))
          throw err
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      
      // Log authentication events for security audit
      if (account) {
        await prisma.auditLog.create({
          data: {
            userId: token.id,
            action: "LOGIN",
            resource: "AUTH",
            details: {
              provider: account.provider,
              type: account.type,
            },
            ipAddress: "unknown", // This would be populated in middleware
          },
        }).catch(console.error)
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
    async signIn({ user, account, profile }) {
      // Handle OAuth sign-in
      if (account?.provider === "google") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })

          if (!existingUser) {
            // Create new user with default PATIENT role
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name!,
                image: user.image,
                role: "PATIENT",
                emailVerified: new Date(),
                patientProfile: {
                  create: {}
                }
              }
            })
          }
        } catch (error) {
          console.error("Error creating user:", error)
          return false
        }
      }

      return true
    },
  },
  pages: {
  signIn: "/auth/signin",
  error: "/auth/error",
  },
  events: {
    async signOut({ token }) {
      // Log sign out events
      if (token?.id) {
        await prisma.auditLog.create({
          data: {
            userId: token.id,
            action: "LOGOUT",
            resource: "AUTH",
            details: {},
          },
        }).catch(console.error)
      }
    },
  },
}
