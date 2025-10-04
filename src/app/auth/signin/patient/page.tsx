"use client"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import SignInForm from '@/components/auth/SignInForm'
import { HeartIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"
import { motion } from "framer-motion"

export default function PatientSignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/patient/dashboard"

  const [formData, setFormData] = useState({ email: "", password: "" })
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
        role: 'PATIENT',
        redirect: false,
      })

      if ((result as any)?.error) {
        setError((result as any).error)
      } else {
        // create tab token and await it so the auth fallback sees it after redirect
        try {
          const r = await fetch('/api/tab-login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: formData.email, password: formData.password }) })
          const j = await r.json().catch(() => null)
          if (j?.token) { 
            try { 
              sessionStorage.setItem('tab_token', j.token) 
            } catch (e) {
              console.warn('Failed to store tab token:', e)
            }
          }
        } catch (e) {
          console.warn('Failed to create tab token:', e)
        }

        // Wait briefly for next-auth session to become available (poll)
        const waitForSession = async (timeout = 3000) => {
          const start = Date.now()
          while (Date.now() - start < timeout) {
            const s = await getSession()
            if (s && s.user && s.user.role === 'PATIENT') return true
            await new Promise(res => setTimeout(res, 200))
          }
          return false
        }

        const ok = await waitForSession(3000)
        if (!ok) {
          // if session not active yet, send user to sign-in with context
          router.push(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}&expectedRole=PATIENT`)
          return
        }

        router.push(callbackUrl)
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
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
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Patient Sign in</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to your patient account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your patient credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <SignInForm defaultEmail={formData.email} loading={isLoading} submitLabel="Sign In" onSubmit={async ({ email, password }) => {
              // reuse handleSubmit logic: call NextAuth then create tab token and route
              setIsLoading(true)
              setError("")
              try {
                const result = await signIn("credentials", { email, password, role: 'PATIENT', redirect: false })
                if ((result as any)?.error) {
                  setError((result as any).error)
                } else {
                  try {
                    const r = await fetch('/api/tab-login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
                    const j = await r.json()
                    if (j.token) { 
                      try { 
                        sessionStorage.setItem('tab_token', j.token) 
                      } catch (e) {
                        console.warn('Failed to store tab token:', e)
                      }
                    }
                  } catch (e) {
                    console.warn('Failed to create tab token:', e)
                  }

                  // Wait for session to be established
                  const waitForSession = async (timeout = 3000) => {
                    const start = Date.now()
                    while (Date.now() - start < timeout) {
                      const s = await getSession()
                      if (s && s.user && s.user.role === 'PATIENT') return true
                      await new Promise(res => setTimeout(res, 200))
                    }
                    return false
                  }

                  const ok = await waitForSession(3000)
                  if (!ok) {
                    router.push(`/auth/signin/patient?callbackUrl=${encodeURIComponent(callbackUrl)}&expectedRole=PATIENT`)
                    return
                  }

                  router.push(callbackUrl)
                }
              } catch (e) { setError('An unexpected error occurred') }
              setIsLoading(false)
            }} />

            <div className="text-center">
              <span className="text-sm text-gray-600">Don't have an account? <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500">Sign up</Link></span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
