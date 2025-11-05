"use client"

import React from 'react'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

interface PasswordStrengthProps {
  password: string
  show?: boolean
}

interface PasswordRequirement {
  test: (password: string) => boolean
  message: string
  id: string
}

const passwordRequirements: PasswordRequirement[] = [
  {
    id: 'length',
    test: (password) => password.length >= 8,
    message: 'At least 8 characters long'
  },
  {
    id: 'uppercase',
    test: (password) => /[A-Z]/.test(password),
    message: 'Contains uppercase letter (A-Z)'
  },
  {
    id: 'lowercase',
    test: (password) => /[a-z]/.test(password),
    message: 'Contains lowercase letter (a-z)'
  },
  {
    id: 'number',
    test: (password) => /\d/.test(password),
    message: 'Contains at least one number (0-9)'
  },
  {
    id: 'special',
    test: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
    message: 'Contains special character (!@#$%^&*)'
  }
]

export default function PasswordStrength({ password, show = true }: PasswordStrengthProps) {
  if (!show || !password) return null

  const getStrengthScore = (): number => {
    return passwordRequirements.reduce((score, req) => {
      return score + (req.test(password) ? 1 : 0)
    }, 0)
  }

  const getStrengthLabel = (score: number): { label: string; color: string } => {
    if (score <= 1) return { label: 'Very Weak', color: 'text-red-600' }
    if (score <= 2) return { label: 'Weak', color: 'text-red-500' }
    if (score <= 3) return { label: 'Fair', color: 'text-yellow-500' }
    if (score <= 4) return { label: 'Good', color: 'text-blue-500' }
    return { label: 'Strong', color: 'text-green-600' }
  }

  const score = getStrengthScore()
  const strength = getStrengthLabel(score)
  const progressPercentage = (score / passwordRequirements.length) * 100

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">Password Strength:</span>
        <span className={`text-sm font-semibold ${strength.color}`}>
          {strength.label}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <motion.div
          className={`h-2 rounded-full transition-all duration-300 ${
            score <= 1 ? 'bg-red-500' :
            score <= 2 ? 'bg-red-400' :
            score <= 3 ? 'bg-yellow-400' :
            score <= 4 ? 'bg-blue-500' :
            'bg-green-500'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Requirements checklist */}
      <div className="space-y-2">
        {passwordRequirements.map((requirement) => {
          const isValid = requirement.test(password)
          return (
            <motion.div
              key={requirement.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              {isValid ? (
                <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
              ) : (
                <XCircleIcon className="w-4 h-4 text-gray-300 flex-shrink-0" />
              )}
              <span className={`text-sm ${
                isValid ? 'text-green-700 line-through' : 'text-gray-600'
              }`}>
                {requirement.message}
              </span>
            </motion.div>
          )
        })}
      </div>

      {score === passwordRequirements.length && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-center"
        >
          <span className="text-sm font-medium text-green-800">
            🎉 Excellent! Your password meets all security requirements.
          </span>
        </motion.div>
      )}
    </motion.div>
  )
}