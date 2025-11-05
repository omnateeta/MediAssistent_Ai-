"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestAuthPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Test Page</CardTitle>
            <CardDescription>
              Test the authentication system and view session data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {session ? (
              <div>
                <h3 className="text-lg font-semibold text-green-600 mb-4">✅ Signed In Successfully!</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><strong>Name:</strong> {session.user.name}</p>
                  <p><strong>Email:</strong> {session.user.email}</p>
                  <p><strong>Role:</strong> {session.user.role}</p>
                  <p><strong>ID:</strong> {session.user.id}</p>
                </div>

                <div className="flex gap-4 mt-6">
                  <Button onClick={() => signOut()} variant="outline">
                    Sign Out
                  </Button>
                  
                  {session.user.role === 'PATIENT' && (
                    <Button asChild variant="medical">
                      <a href="/patient/dashboard">Go to Patient Dashboard</a>
                    </Button>
                  )}
                  
                  {session.user.role === 'DOCTOR' && (
                    <Button asChild variant="medical">
                      <a href="/doctor/dashboard">Go to Doctor Dashboard</a>
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-red-600 mb-4">❌ Not Signed In</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Test Accounts:</h4>
                    <div className="bg-blue-50 p-4 rounded-lg space-y-2 text-sm">
                      <p><strong>Patient:</strong> patient@test.com / password123</p>
                      <p><strong>Doctor:</strong> doctor@test.com / password123</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      onClick={() => signIn("credentials", { 
                        email: "patient@test.com", 
                        password: "password123",
                        callbackUrl: "/test-auth"
                      })}
                      variant="outline"
                    >
                      Quick Sign In (Patient)
                    </Button>
                    
                    <Button 
                      onClick={() => signIn("credentials", { 
                        email: "doctor@test.com", 
                        password: "password123",
                        callbackUrl: "/test-auth"
                      })}
                      variant="outline"
                    >
                      Quick Sign In (Doctor)
                    </Button>
                  </div>

                  <div className="flex gap-4">
                    <Button asChild variant="medical">
                      <a href="/auth/signin">Go to Sign In Page</a>
                    </Button>
                    
                    <Button asChild variant="outline">
                      <a href="/auth/signup">Go to Sign Up Page</a>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t pt-6">
              <h4 className="font-medium mb-2">Debug Information:</h4>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                {JSON.stringify({ session, status }, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
