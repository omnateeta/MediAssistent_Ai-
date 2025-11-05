"use client"

import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import SignInForm from '@/components/auth/SignInForm'
import AuthDebug from '@/components/debug/AuthDebug'
import { HeartIcon, CheckCircleIcon } from "@heroicons/react/24/outline"
import { motion } from "framer-motion"

export default function PatientSignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/patient/dashboard"
  const { data: session, status } = useSession()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Debug session state
  useEffect(() => {
    console.log('Patient Sign-In Page - Session status:', status)
    console.log('Patient Sign-In Page - Session data:', session)
    console.log('Patient Sign-In Page - User role:', session?.user?.role)
  }, [session, status])

  // Auto-redirect if already authenticated as patient
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === 'PATIENT') {
      console.log('Already authenticated as patient, redirecting to:', callbackUrl)
      window.location.href = callbackUrl
    }
  }, [status, session, callbackUrl])

  const handleSubmit = async (data: { email: string; password: string; remember?: boolean }) => {
    setIsLoading(true)
    setError("")

    try {
      console.log('Starting sign-in process for patient:', data.email)
      
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        role: 'PATIENT',
        redirect: false,
      })

      console.log('SignIn result:', result)

      if (result?.error) {
        console.error('Sign-in error:', result.error)
        setError(result.error)
        setIsLoading(false)
        return
      }

      // Create fallback session token for multi-role support
      try {
        const tabResponse = await fetch('/api/tab-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: data.email, password: data.password })
        })
        const tabData = await tabResponse.json()
        if (tabData?.token) {
          sessionStorage.setItem('tab_token_PATIENT', tabData.token)
          sessionStorage.setItem('tab_token_current', tabData.token)
        }
      } catch (e) {
        console.warn('Failed to create session token:', e)
      }

      console.log('Sign-in successful, redirecting to:', callbackUrl)
      
      // Force page reload to ensure session is properly established
      window.location.href = callbackUrl
    } catch (err: any) {
      console.error('Sign-in error:', err)
      setError(err?.message || "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // If already authenticated as patient, show dashboard access
  if (status === "authenticated" && session?.user?.role === 'PATIENT') {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex items-center justify-center">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-lg">
                <HeartIcon className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Welcome Back!</h2>
            <p className="mt-2 text-sm text-gray-600">You're already signed in as a patient</p>
          </div>

          <Card>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">Patient access is active</span>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => router.push('/patient/dashboard')}
                  className="w-full" 
                  variant="medical"
                >
                  Go to Patient Dashboard
                </Button>
                
                <Button 
                  onClick={() => router.push('/auth/signin/doctor')}
                  className="w-full" 
                  variant="outline"
                >
                  Sign In as Doctor (Multi-Role)
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-lg">
              <HeartIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Patient Sign In</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your patient dashboard
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Patient Portal Access</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <SignInForm 
              onSubmit={handleSubmit}
              loading={isLoading}
              error={error}
              submitLabel="Sign In as Patient"
              showGoogleSignIn={true}
              autoFocus={true}
            />

            <div className="text-center">
              <span className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                  Sign up
                </Link>
              </span>
            </div>
            
            <div className="text-center pt-4 border-t border-gray-200">
              <div className="space-y-2">
                <p className="text-xs text-gray-500">Need to sign in as a doctor?</p>
                <Link href="/auth/signin/doctor" className="text-sm text-blue-600 hover:text-blue-500 transition-colors">
                  Doctor Sign In →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Debug component for development */}
      <AuthDebug />
    </div>
  )
}
