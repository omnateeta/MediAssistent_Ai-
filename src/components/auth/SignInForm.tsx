"use client"

import React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

type Props = {
  defaultEmail?: string
  onSubmit: (data: { email: string; password: string; remember?: boolean }) => Promise<void>
  loading?: boolean
  submitLabel?: string
}

export default function SignInForm({ defaultEmail = '', onSubmit, loading = false, submitLabel = 'Sign In' }: Props) {
  const [email, setEmail] = React.useState(defaultEmail)
  const [password, setPassword] = React.useState('')
  const [show, setShow] = React.useState(false)
  const [remember, setRemember] = React.useState(false)
  const [error, setError] = React.useState('')

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email) return setError('Email is required')
    if (!password) return setError('Password is required')
    try {
      await onSubmit({ email, password, remember })
    } catch (err: any) {
      setError(err?.message || 'Sign in failed')
    }
  }

  return (
    <form onSubmit={handle} className="space-y-4">
      {error && <div className="text-sm text-red-600">{error}</div>}

      <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />

      <div className="relative">
        <Input label="Password" type={show ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        <button type="button" className="absolute right-3 top-9 text-gray-400 hover:text-gray-600" onClick={() => setShow(!show)}>
          {show ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          Remember me
        </label>
        <a href="/auth/forgot-password" className="text-sm text-blue-600">Forgot?</a>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <Button type="submit" loading={loading} variant="medical">{submitLabel}</Button>
        <Button type="button" variant="outline" onClick={() => window.location.href = '/api/auth/signin/google'}>Sign in with Google</Button>
      </div>
    </form>
  )
}
