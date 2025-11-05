"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function useAuthGuard(requiredRole?: string) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    let mounted = true
    async function check() {
      if (status === 'loading') return

      // If we have a valid next-auth session, ensure role matches
      if (session) {
        if (requiredRole && session.user.role !== requiredRole) {
          // Redirect to sign-in with context about the expected role so the user sees correct guidance
          try {
            const returnTo = typeof window !== 'undefined' ? window.location.pathname + window.location.search : undefined
            const cb = returnTo ? `?callbackUrl=${encodeURIComponent(returnTo)}` : ''
            
            // If we know the required role, redirect directly to the specific signin page
            if (requiredRole === 'PATIENT') {
              router.push(`/auth/signin/patient${cb}`)
            } else if (requiredRole === 'DOCTOR') {
              router.push(`/auth/signin/doctor${cb}`)
            } else {
              const expected = `&expectedRole=${encodeURIComponent(requiredRole)}`
              router.push(`/auth/signin${cb}${expected}`)
            }
          } catch (e) {
            router.push('/auth/signin')
          }
          return
        }
        if (mounted) setChecked(true)
        return
      }

      // No next-auth session: try per-tab token fallback (best-effort)
      try {
        const token = typeof window !== 'undefined' ? sessionStorage.getItem('tab_token') : null
        if (token) {
          const res = await fetch(`/api/tab-session?token=${encodeURIComponent(token)}`)
          if (res.ok) {
            const j = await res.json()
            if (j?.valid) {
              // If role is required, verify
              if (requiredRole && j.session?.role !== requiredRole) {
                router.push('/')
                return
              }
              if (mounted) setChecked(true)
              return
            }
          }
        }
      } catch (e) {
        // ignore and fallthrough to redirect
      }

      // No valid session found -> redirect to sign-in and preserve return path
      try {
        const returnTo = typeof window !== 'undefined' ? window.location.pathname + window.location.search : undefined
        const cb = returnTo ? `?callbackUrl=${encodeURIComponent(returnTo)}` : ''
        
        // If we know the required role, redirect directly to the specific signin page
        if (requiredRole === 'PATIENT') {
          router.push(`/auth/signin/patient${cb}`)
        } else if (requiredRole === 'DOCTOR') {
          router.push(`/auth/signin/doctor${cb}`)
        } else {
          // No specific role required, go to main signin page
          const expected = requiredRole ? `&expectedRole=${encodeURIComponent(requiredRole)}` : ''
          router.push(`/auth/signin${cb}${expected}`)
        }
      } catch (e) {
        router.push('/auth/signin')
      }
    }

    check()
    return () => { mounted = false }
  }, [session, status, router, requiredRole])

  return { session, status, checked }
}
