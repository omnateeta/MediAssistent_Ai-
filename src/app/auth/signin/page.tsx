"use client"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useSearchParams } from 'next/navigation'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HeartIcon, EyeIcon, EyeSlashIcon, UserIcon, UserGroupIcon } from "@heroicons/react/24/outline"
import { motion } from "framer-motion"

export default function SignInPage() {
  const searchParams = useSearchParams()
  const expectedRole = searchParams.get('expectedRole')
  const callbackUrl = searchParams.get('callbackUrl') || undefined
  const [selectedRole, setSelectedRole] = useState<"PATIENT" | "DOCTOR" | null>(null)

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
          {expectedRole && (
            <div className="mt-3 text-sm bg-yellow-50 border border-yellow-100 text-yellow-800 px-3 py-2 rounded">
              This page requires a <strong>{expectedRole}</strong> account. Please sign in with a {expectedRole.toLowerCase()} account or choose the correct role below.
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Link href={`/auth/signin/patient${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}${expectedRole ? `&expectedRole=${encodeURIComponent(expectedRole)}` : ''}` : ''}`}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                  <UserIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">I'm a Patient</h3>
                  <p className="text-sm text-gray-600">Book appointments and manage your records</p>
                </div>
              </div>
            </motion.div>
          </Link>
          <Link href={`/auth/signin/doctor${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}${expectedRole ? `&expectedRole=${encodeURIComponent(expectedRole)}` : ''}` : ''}`}>
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
