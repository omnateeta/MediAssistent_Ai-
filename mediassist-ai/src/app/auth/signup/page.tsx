"use client"

import { useState, useEffect } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import PasswordStrength from "@/components/auth/PasswordStrength"
import { HeartIcon, EyeIcon, EyeSlashIcon, UserIcon, UserGroupIcon, CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline"
import { motion, AnimatePresence } from "framer-motion"

type UserRole = "PATIENT" | "DOCTOR"

export default function SignUpPage() {
  const router = useRouter()
  
  const [step, setStep] = useState(1)
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    licenseNumber: "",
    specialization: "",
    hospitalAffiliation: "",
    dateOfBirth: "",
    phoneNumber: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(null)
  const [showPasswordStrength, setShowPasswordStrength] = useState(false)

  // Email validation and availability check
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const checkEmailAvailability = async (email: string) => {
    if (!validateEmail(email)) {
      setIsEmailAvailable(null)
      return
    }

    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await response.json()
      setIsEmailAvailable(data.available)
    } catch (error) {
      setIsEmailAvailable(null)
    }
  }

  // Debounced email check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.email) {
        checkEmailAvailability(formData.email)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [formData.email])

  const handleRoleSelection = (role: UserRole) => {
    setSelectedRole(role)
    setStep(2)
    setError("")
    setSuccess("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    if (!selectedRole) {
      setError('Please select a role')
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: selectedRole }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data?.message || 'Registration failed')
        setIsLoading(false)
        return
      }

      setSuccess("Account created successfully! Signing you in...")

      // Auto sign in
      const result = await signIn("credentials", {
        email: formData.email.toLowerCase(),
        password: formData.password,
        role: selectedRole,
        redirect: false,
      })

      if (result?.error) {
        setError(`Account created but sign-in failed: ${result.error}`)
        setTimeout(() => router.push('/auth/signin'), 3000)
        setIsLoading(false)
        return
      }

      // Redirect to dashboard
      setTimeout(() => {
        const dashboardUrl = selectedRole === 'DOCTOR' ? '/doctor/dashboard' : '/patient/dashboard'
        router.push(dashboardUrl)
      }, 1000)

    } catch (error: any) {
      setError(error.message || "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

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
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join MediAssist AI and transform your healthcare experience
          </p>
        </div>

        <Card>
          {step === 1 ? (
            <>
              <CardHeader>
                <CardTitle>Choose Your Role</CardTitle>
                <CardDescription>Select how you'll be using MediAssist AI</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRoleSelection("PATIENT")}
                  className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                      <UserIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">I'm a Patient</h3>
                      <p className="text-sm text-gray-600">
                        Book appointments, manage health records, and get AI-powered health insights
                      </p>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRoleSelection("DOCTOR")}
                  className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                      <UserGroupIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">I'm a Doctor</h3>
                      <p className="text-sm text-gray-600">
                        Review AI summaries, manage patients, and create digital prescriptions
                      </p>
                    </div>
                  </div>
                </motion.button>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle>
                  {selectedRole === "DOCTOR" ? "Doctor Registration" : "Patient Registration"}
                </CardTitle>
                <CardDescription>Complete your profile to get started</CardDescription>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {setStep(1); setError(""); setSuccess("");}}
                  className="w-fit"
                >
                  ← Back to role selection
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-red-800 font-medium">Registration Failed</p>
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </motion.div>
                  )}

                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-green-800 font-medium">Success!</p>
                        <p className="text-sm text-green-700">{success}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Full Name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    autoComplete="name"
                  />

                  <div className="relative">
                    <Input
                      label="Email Address"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter your email"
                      autoComplete="email"
                      className={isEmailAvailable === false ? 'border-red-500' : isEmailAvailable === true ? 'border-green-500' : ''}
                    />
                    {formData.email && (
                      <div className="absolute right-3 top-9">
                        {isEmailAvailable === true ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        ) : isEmailAvailable === false ? (
                          <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                        ) : null}
                      </div>
                    )}
                    {isEmailAvailable === false && (
                      <p className="text-sm text-red-600 mt-1">This email is already registered</p>
                    )}
                    {isEmailAvailable === true && (
                      <p className="text-sm text-green-600 mt-1">Email is available</p>
                    )}
                  </div>

                  <div className="relative">
                    <Input
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      onFocus={() => setShowPasswordStrength(true)}
                      placeholder="Create a secure password"
                      autoComplete="new-password"
                      className="pr-12"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>

                  <PasswordStrength 
                    password={formData.password} 
                    show={showPasswordStrength && formData.password.length > 0}
                  />

                  <div className="relative">
                    <Input
                      label="Confirm Password"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      className="pr-12"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                    {formData.password && formData.confirmPassword && formData.password === formData.confirmPassword && (
                      <p className="text-sm text-green-600 mt-1">Passwords match</p>
                    )}
                    {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-sm text-red-600 mt-1">Passwords do not match</p>
                    )}
                  </div>

                  {selectedRole === "DOCTOR" ? (
                    <>
                      <Input
                        label="Medical License Number"
                        type="text"
                        required
                        value={formData.licenseNumber}
                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                        placeholder="Enter your license number"
                        autoComplete="off"
                      />
                      
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Medical Specialization *</label>
                        <Select 
                          value={formData.specialization}
                          onValueChange={(value) => setFormData({ ...formData, specialization: value })}
                          required
                        >
                          <SelectTrigger className="h-12 border-2 hover:border-blue-300 focus:border-blue-500 font-bold">
                            <SelectValue placeholder="🩺 Choose your medical specialization" className="font-bold" />
                          </SelectTrigger>
                          <SelectContent 
                            className="max-h-[300px] w-full z-[1000] bg-gray-50 p-2 shadow-xl border-2 border-gray-200"
                            side="bottom"
                            align="start"
                            sideOffset={4}
                            avoidCollisions={false}
                          >
                            {["Cardiology", "Dermatology", "Endocrinology", "Gastroenterology", "General Practice", "Neurology", "Oncology", "Orthopedics", "Psychiatry", "Pulmonology"].map((specialization) => (
                              <SelectItem 
                                key={specialization} 
                                value={specialization}
                                className="p-0 h-auto cursor-pointer focus:bg-transparent hover:bg-transparent data-[highlighted]:bg-transparent mb-2"
                              >
                                <div className="w-full p-3 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-300 bg-white">
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                      <span className="text-base">🩺</span>
                                    </div>
                                    <span className="font-bold text-gray-900 text-base">{specialization}</span>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Input
                        label="Hospital/Clinic Affiliation (Optional)"
                        type="text"
                        value={formData.hospitalAffiliation}
                        onChange={(e) => setFormData({ ...formData, hospitalAffiliation: e.target.value })}
                        placeholder="Enter your workplace"
                        autoComplete="organization"
                      />
                    </>
                  ) : (
                    <>
                      <Input
                        label="Date of Birth (Optional)"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        autoComplete="bday"
                      />
                      <Input
                        label="Phone Number (Optional)"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        placeholder="Enter your phone number"
                        autoComplete="tel"
                      />
                    </>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold"
                    variant="medical"
                    loading={isLoading}
                    disabled={isLoading || isEmailAvailable === false}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>

                <div className="text-center">
                  <span className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link href="/auth/signin" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                      Sign in
                    </Link>
                  </span>
                </div>

                <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    By creating an account, you agree to our{" "}
                    <a href="/terms" className="text-blue-600 hover:text-blue-500">Terms of Service</a>
                    {" "}and{" "}
                    <a href="/privacy" className="text-blue-600 hover:text-blue-500">Privacy Policy</a>
                  </p>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  )
}