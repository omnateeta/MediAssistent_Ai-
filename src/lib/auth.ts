import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

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
  adapter: PrismaAdapter(prisma),
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
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            patientProfile: true,
            doctorProfile: true,
          }
        })

        if (!user) {
          throw new Error("User not found")
        }

        // For OAuth users, password might not be set
        if (user.password) {
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          if (!isPasswordValid) {
            throw new Error("Invalid password")
          }
        }

        if (!user.isActive) {
          throw new Error("Account is deactivated")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? "",
          role: user.role,
          image: user.image ?? "",
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
