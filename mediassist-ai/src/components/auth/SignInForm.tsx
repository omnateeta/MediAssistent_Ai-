"use client"

import React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { EyeIcon, EyeSlashIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

type Props = {
  defaultEmail?: string
  onSubmit: (data: { email: string; password: string; remember?: boolean }) => Promise<void>
  loading?: boolean
  submitLabel?: string
  error?: string
  showGoogleSignIn?: boolean
  autoFocus?: boolean
}

export default function SignInForm({ 
  defaultEmail = '', 
  onSubmit, 
  loading = false, 
  submitLabel = 'Sign In',
  error: externalError,
  showGoogleSignIn = true,
  autoFocus = false
}: Props) {
  const [email, setEmail] = React.useState(defaultEmail)
  const [password, setPassword] = React.useState('')
  const [show, setShow] = React.useState(false)
  const [remember, setRemember] = React.useState(false)
  const [error, setError] = React.useState('')
  const [emailFocused, setEmailFocused] = React.useState(false)
  const [passwordFocused, setPasswordFocused] = React.useState(false)
  const [isValidEmail, setIsValidEmail] = React.useState(false)
  const [attemptCount, setAttemptCount] = React.useState(0)
  const [lastAttemptTime, setLastAttemptTime] = React.useState<number | null>(null)

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Rate limiting
  const isRateLimited = (): boolean => {
    if (attemptCount >= 5 && lastAttemptTime) {
      const timeSinceLastAttempt = Date.now() - lastAttemptTime
      return timeSinceLastAttempt < 300000 // 5 minutes
    }
    return false
  }

  // Handle email change with validation
  React.useEffect(() => {
    setIsValidEmail(validateEmail(email))
  }, [email])

  // Use external error if provided
  React.useEffect(() => {
    if (externalError) {
      setError(externalError)
    }
  }, [externalError])

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Rate limiting check
    if (isRateLimited()) {
      setError('Too many failed attempts. Please wait 5 minutes before trying again.')
      return
    }
    
    // Validation
    if (!email.trim()) {
      setError('Email address is required')
      return
    }
    
    if (!isValidEmail) {
      setError('Please enter a valid email address')
      return
    }
    
    if (!password) {
      setError('Password is required')
      return
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    try {
      await onSubmit({ email: email.trim().toLowerCase(), password, remember })
      setAttemptCount(0) // Reset on success
    } catch (err: any) {
      setAttemptCount(prev => prev + 1)
      setLastAttemptTime(Date.now())
      setError(err?.message || 'Sign in failed. Please check your credentials and try again.')
    }
  }

  const getRemainingCooldown = (): number => {
    if (!lastAttemptTime || attemptCount < 5) return 0
    const elapsed = Date.now() - lastAttemptTime
    const remaining = Math.max(0, 300000 - elapsed) // 5 minutes
    return Math.ceil(remaining / 1000)
  }

  const cooldownSeconds = getRemainingCooldown()

  return (
    <form onSubmit={handle} className="space-y-4">
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
              <p className="text-sm text-red-800 font-medium">Sign In Failed</p>
              <p className="text-sm text-red-700">{error}</p>
              {attemptCount >= 3 && attemptCount < 5 && (
                <p className="text-xs text-red-600 mt-1">
                  {5 - attemptCount} attempts remaining before temporary lockout
                </p>
              )}
              {cooldownSeconds > 0 && (
                <p className="text-xs text-red-600 mt-1">
                  Account temporarily locked. Try again in {Math.floor(cooldownSeconds / 60)}:{(cooldownSeconds % 60).toString().padStart(2, '0')}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <Input 
          label="Email Address" 
          type="email" 
          required 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(false)}
          autoComplete="email"
          autoFocus={autoFocus}
          className={`transition-all duration-200 ${
            emailFocused ? 'border-blue-500 ring-2 ring-blue-200' : ''
          } ${
            email && !isValidEmail ? 'border-red-500' : ''
          } ${
            email && isValidEmail ? 'border-green-500' : ''
          }`}
          placeholder="Enter your email address"
        />
        {email && (
          <div className="absolute right-3 top-9">
            {isValidEmail ? (
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
            ) : (
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
            )}
          </div>
        )}
        {email && !isValidEmail && (
          <p className="text-sm text-red-600 mt-1">Please enter a valid email address</p>
        )}
      </div>

      <div className="relative">
        <Input 
          label="Password" 
          type={show ? 'text' : 'password'} 
          required 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
          autoComplete="current-password"
          className={`transition-all duration-200 pr-12 ${
            passwordFocused ? 'border-blue-500 ring-2 ring-blue-200' : ''
          }`}
          placeholder="Enter your password"
        />
        <button 
          type="button" 
          className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors" 
          onClick={() => setShow(!show)}
          tabIndex={-1}
        >
          {show ? (
            <EyeSlashIcon className="w-5 h-5" />
          ) : (
            <EyeIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input 
            type="checkbox" 
            checked={remember} 
            onChange={(e) => setRemember(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-gray-700">Remember me for 30 days</span>
        </label>
        <a 
          href="/auth/forgot-password" 
          className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
        >
          Forgot password?
        </a>
      </div>

      <div className="space-y-3">
        <Button 
          type="submit" 
          loading={loading} 
          variant="medical"
          className="w-full h-12 text-base font-semibold"
          disabled={loading || cooldownSeconds > 0 || !email || !password || !isValidEmail}
        >
          {loading ? 'Signing in...' : submitLabel}
        </Button>
        
        {showGoogleSignIn && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-12"
              onClick={() => window.location.href = '/api/auth/signin/google'}
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>
          </>
        )}
      </div>

      {attemptCount > 0 && attemptCount < 5 && (
        <div className="text-center">
          <p className="text-xs text-gray-500">
            {attemptCount === 1 ? '1 failed attempt' : `${attemptCount} failed attempts`}
          </p>
        </div>
      )}
    </form>
  )
}
