"use client"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HeartIcon, EyeIcon, EyeSlashIcon, UserIcon, UserGroupIcon } from "@heroicons/react/24/outline"
import { motion } from "framer-motion"

export default function SignInPage() {
<<<<<<< HEAD
  const [selectedRole, setSelectedRole] = useState<"PATIENT" | "DOCTOR" | null>(null)
=======
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const from = searchParams.get("from") || null
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        setError(result.error)
      } else {
        // If credentials sign-in succeeded, redirect to callbackUrl (or role-specific)
        if (callbackUrl && callbackUrl !== '/') {
          // callbackUrl may be an encoded pathname from booking page
          try {
            const decoded = decodeURIComponent(callbackUrl)
            router.push(decoded)
            return
          } catch (e) {
            // fallthrough
          }
        }

        // Get the updated session to check user role as fallback
        const session = await getSession()
        if (session?.user.role === 'DOCTOR') {
          router.push('/doctor/dashboard')
        } else {
          router.push('/patient/dashboard')
        }
      }
    } catch (error) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn("google", { callbackUrl })
    } catch (error) {
      setError("Failed to sign in with Google")
      setIsLoading(false)
    }
  }
>>>>>>> 364e8688f32e1851dc0d38b962a011e4c9a4446e

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <div className="flex items-center justify-center">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg">
              <HeartIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Sign in</h2>
          <p className="mt-2 text-sm text-gray-600">Choose your role to sign in</p>
        </div>

<<<<<<< HEAD
        <div className="grid grid-cols-1 gap-4">
          <Link href="/auth/signin/patient">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                  <UserIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">I'm a Patient</h3>
                  <p className="text-sm text-gray-600">Book appointments and manage your records</p>
                </div>
=======
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {from === 'booking' && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md text-sm">
                You need to sign in to complete your booking. After sign in you'll be returned to the booking page.
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
>>>>>>> 364e8688f32e1851dc0d38b962a011e4c9a4446e
              </div>
            </motion.div>
          </Link>
          <Link href="/auth/signin/doctor">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                  <UserGroupIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">I'm a Doctor</h3>
                  <p className="text-sm text-gray-600">Manage patients and prescriptions</p>
                </div>
              </div>
            </motion.div>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
