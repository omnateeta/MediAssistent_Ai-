"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

export default function AuthDebug() {
  const { data: session, status } = useSession()
  const [tokenInfo, setTokenInfo] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const patientToken = sessionStorage.getItem('tab_token_PATIENT')
      const doctorToken = sessionStorage.getItem('tab_token_DOCTOR')
      const currentToken = sessionStorage.getItem('tab_token_current')
      
      setTokenInfo({
        patientToken: patientToken ? 'Present' : 'None',
        doctorToken: doctorToken ? 'Present' : 'None',
        currentToken: currentToken ? 'Present' : 'None'
      })
    }
  }, [])

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h4 className="font-bold mb-2">🔍 Auth Debug</h4>
      <div className="space-y-1">
        <p><strong>Status:</strong> {status}</p>
        <p><strong>User ID:</strong> {session?.user?.id || 'None'}</p>
        <p><strong>User Role:</strong> {session?.user?.role || 'None'}</p>
        <p><strong>User Email:</strong> {session?.user?.email || 'None'}</p>
        <p><strong>Session Valid:</strong> {session ? 'Yes' : 'No'}</p>
        <hr className="my-2 border-gray-600" />
        <p><strong>Patient Token:</strong> {tokenInfo?.patientToken || 'Loading...'}</p>
        <p><strong>Doctor Token:</strong> {tokenInfo?.doctorToken || 'Loading...'}</p>
        <p><strong>Current Token:</strong> {tokenInfo?.currentToken || 'Loading...'}</p>
      </div>
    </div>
  )
}