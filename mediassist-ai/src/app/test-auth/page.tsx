"use client"

import { useState, useEffect } from "react"
import { useSession, signIn, signOut } from "next-auth/react"

export default function TestAuthPage() {
  const { data: session, status } = useSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    
    try {
      console.log("Attempting sign in with:", { email, password })
      const res = await signIn("credentials", {
        email,
        password,
        role: "PATIENT",
        redirect: false,
      })
      console.log("Sign in result:", res)
      setResult(res)
    } catch (error) {
      console.error("Sign in error:", error)
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Authentication Test</h1>
      
      {status === "loading" ? (
        <p>Loading session...</p>
      ) : status === "authenticated" ? (
        <div className="space-y-4">
          <p className="text-green-600">Authenticated as: {session.user.email}</p>
          <p>Role: {session.user.role}</p>
          <button 
            onClick={() => signOut()} 
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-red-600">Not authenticated</p>
          
          <form onSubmit={handleSignIn} className="space-y-4 max-w-md">
            <div>
              <label className="block mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          
          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h2 className="font-bold mb-2">Result:</h2>
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}