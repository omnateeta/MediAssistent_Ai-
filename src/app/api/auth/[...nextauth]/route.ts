import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth-temp"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
