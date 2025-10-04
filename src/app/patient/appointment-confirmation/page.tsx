"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircleIcon, CalendarIcon, UserIcon, ClockIcon, DocumentTextIcon } from "@heroicons/react/24/outline"
import { motion } from "framer-motion"

interface AppointmentDetails {
  id: string
  referenceId: string
  scheduledDate: string
  status: string
  chiefComplaint: string
  symptoms: any
  doctor: {
    user: {
      name: string
      email: string
    }
    specialization: string[]
    consultationFee: number
    hospitalAffiliation: string
  }
  medicalDocuments: Array<{
    id: string
    fileName: string
    fileSize: number
    uploadedAt: string
  }>
}

export default function AppointmentConfirmationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const appointmentRef = searchParams.get('ref')
  
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "loading") return
    
    if (!session) {
      router.push("/auth/signin/patient")
      return
    }
    
    if (session.user.role !== "PATIENT") {
      router.push("/auth/signin/patient")
      return
    }

    // Fetch appointment details
    if (appointmentRef) {
      fetchAppointmentDetails()
    } else {
      setError("No appointment reference provided")
      setLoading(false)
    }
  }, [session, status, appointmentRef])

  const fetchAppointmentDetails = async () => {
    try {
      const response = await fetch(`/api/patient/appointments/${appointmentRef}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setAppointment(data.appointment)
      } else {
        // If specific appointment not found, redirect to appointments list
        console.log("Appointment not found, redirecting to appointments")
        setTimeout(() => {
          router.push("/patient/appointments")
        }, 3000)
      }
    } catch (error) {
      console.error("Error fetching appointment:", error)
      setError("Failed to load appointment details")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => router.push("/patient/dashboard")}>
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Success Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
              className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"
            >
              <CheckCircleIcon className="w-10 h-10 text-green-600" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Appointment Confirmed!
            </h1>
            <p className="text-lg text-gray-600">
              Your appointment has been successfully scheduled
            </p>
            {appointmentRef && (
              <p className="text-sm text-gray-500 mt-2">
                Reference: <span className="font-mono font-medium">{appointmentRef}</span>
              </p>
            )}
          </div>

          {/* Appointment Details */}
          {appointment ? (
            <div className="space-y-6">
              {/* Main Appointment Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    Appointment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Doctor</label>
                        <p className="text-lg font-semibold text-gray-900">
                          {appointment.doctor.user.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {appointment.doctor.specialization.join(", ")}
                        </p>
                        {appointment.doctor.hospitalAffiliation && (
                          <p className="text-sm text-gray-500">
                            {appointment.doctor.hospitalAffiliation}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500">Consultation Fee</label>
                        <p className="text-lg font-semibold text-green-600">
                          ${appointment.doctor.consultationFee}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Date & Time</label>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatDate(appointment.scheduledDate)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatTime(appointment.scheduledDate)}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500">Status</label>
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Symptoms Summary */}
              {appointment.chiefComplaint && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DocumentTextIcon className="w-5 h-5" />
                      Symptoms Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Chief Complaint</label>
                        <p className="text-gray-900">{appointment.chiefComplaint}</p>
                      </div>
                      {appointment.symptoms?.text && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Detailed Symptoms</label>
                          <p className="text-gray-900">{appointment.symptoms.text}</p>
                        </div>
                      )}
                      {appointment.symptoms?.duration && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Duration</label>
                          <p className="text-gray-900">{appointment.symptoms.duration}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Uploaded Documents */}
              {appointment.medicalDocuments && appointment.medicalDocuments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DocumentTextIcon className="w-5 h-5" />
                      Uploaded Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {appointment.medicalDocuments.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{doc.fileName}</p>
                            <p className="text-sm text-gray-500">
                              {(doc.fileSize / 1024 / 1024).toFixed(2)} MB • 
                              Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <CheckCircleIcon className="w-5 h-5 text-green-600" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircleIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Appointment Scheduled Successfully!
                </h2>
                <p className="text-gray-600 mb-4">
                  Your appointment has been created and you will receive a confirmation email shortly.
                </p>
                <p className="text-sm text-gray-500">
                  Redirecting to your appointments...
                </p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button
              onClick={() => router.push("/patient/appointments")}
              variant="default"
              size="lg"
            >
              View All Appointments
            </Button>
            <Button
              onClick={() => router.push("/patient/dashboard")}
              variant="outline"
              size="lg"
            >
              Return to Dashboard
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}