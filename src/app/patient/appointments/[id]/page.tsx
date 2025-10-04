"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  CalendarIcon, 
  ClockIcon, 
  UserIcon,
  DocumentTextIcon,
  EyeIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  MapPinIcon,
  HeartIcon,
  ScaleIcon,
  MicrophoneIcon,
  CloudArrowUpIcon,
  SparklesIcon,
  ClipboardDocumentIcon
} from "@heroicons/react/24/outline"
import { motion } from "framer-motion"

interface AppointmentDetails {
  id: string
  referenceId: string
  scheduledDate: string
  duration: number
  status: string
  type: string
  chiefComplaint: string | null
  symptoms: any
  symptomDuration: string | null
  painLevel: number | null
  patientVoiceNote: string | null
  patientVoiceUrl: string | null
  doctorNotes: string | null
  patientNotes: string | null
  createdAt: string
  updatedAt: string
  doctor: {
    id: string
    licenseNumber: string
    specialization: string[]
    yearsOfExperience: number | null
    hospitalAffiliation: string | null
    consultationFee: number | null
    user: {
      name: string
      email: string
    }
  }
  patient: {
    id: string
    allergies: string[]
    currentMedications: string[]
    user: {
      name: string
      email: string
    }
  }
  medicalDocuments: Array<{
    id: string
    fileName: string
    fileSize: number
    uploadedAt: string
    mimeType: string
  }>
  aiSummary: any | null
  prescription: any | null
}

export default function PatientAppointmentDetailsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const appointmentId = params.id as string
  
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Authentication check
  useEffect(() => {
    if (status === "loading") return
    
    if (!session) {
      router.push("/auth/signin/patient")
      return
    }
    
    if (session.user?.role !== "PATIENT") {
      router.push("/auth/signin/patient")
      return
    }
  }, [session, status, router])

  // Fetch appointment details
  useEffect(() => {
    if (!session || !appointmentId) return

    const fetchAppointmentDetails = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/patient/appointments/${appointmentId}`, {
          credentials: 'include'
        })

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Appointment not found')
          }
          throw new Error('Failed to fetch appointment details')
        }

        const data = await response.json()
        setAppointment(data.appointment)
      } catch (err) {
        console.error('Error fetching appointment:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchAppointmentDetails()
  }, [session, appointmentId])

  // Helper functions
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
      case 'CONFIRMED':
        return <ClockIcon className="w-5 h-5 text-blue-600" />
      case 'COMPLETED':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />
      case 'CANCELLED':
        return <XCircleIcon className="w-5 h-5 text-red-600" />
      default:
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
      case 'CONFIRMED':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'COMPLETED':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointment details...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Appointment Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The appointment you are looking for does not exist.'}</p>
          <Button asChild>
            <Link href="/patient/appointments">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Appointments
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-4">
              <Button variant="outline" asChild>
                <Link href="/patient/appointments">
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Back to Appointments
                </Link>
              </Button>
              
              <div className={`flex items-center px-3 py-1 rounded-full border ${getStatusColor(appointment.status)}`}>
                {getStatusIcon(appointment.status)}
                <span className="ml-2 font-medium">{appointment.status}</span>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Appointment Details
            </h1>
            <p className="text-gray-600">
              Reference ID: {appointment.referenceId}
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Appointment Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CalendarIcon className="w-5 h-5 mr-2" />
                    Appointment Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Schedule Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <CalendarIcon className="w-4 h-4 text-gray-500 mr-2" />
                          <span>{formatDate(appointment.scheduledDate)}</span>
                        </div>
                        <div className="flex items-center">
                          <ClockIcon className="w-4 h-4 text-gray-500 mr-2" />
                          <span>{formatTime(appointment.scheduledDate)} ({appointment.duration} minutes)</span>
                        </div>
                        <div className="flex items-center">
                          <ClipboardDocumentIcon className="w-4 h-4 text-gray-500 mr-2" />
                          <span>{appointment.type}</span>
                        </div>

                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Doctor Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <UserIcon className="w-4 h-4 text-gray-500 mr-2" />
                          <span className="font-medium">{appointment.doctor.user.name}</span>
                        </div>
                        <div className="flex items-center">
                          <ClipboardDocumentIcon className="w-4 h-4 text-gray-500 mr-2" />
                          <span>{appointment.doctor.specialization.join(", ")}</span>
                        </div>
                        {appointment.doctor.yearsOfExperience && (
                          <div className="flex items-center">
                            <span className="w-4 h-4 text-gray-500 mr-2">📊</span>
                            <span>{appointment.doctor.yearsOfExperience} years experience</span>
                          </div>
                        )}
                        {appointment.doctor.hospitalAffiliation && (
                          <div className="flex items-center">
                            <MapPinIcon className="w-4 h-4 text-gray-500 mr-2" />
                            <span>{appointment.doctor.hospitalAffiliation}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Chief Complaint and Symptoms */}
            {(appointment.chiefComplaint || appointment.symptoms) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <HeartIcon className="w-5 h-5 mr-2" />
                      Medical Information Submitted
                    </CardTitle>
                    <CardDescription>
                      Information you provided during booking
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {appointment.chiefComplaint && (
                      <div>
                        <h4 className="font-semibold mb-2">Chief Complaint</h4>
                        <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">
                          {appointment.chiefComplaint}
                        </p>
                      </div>
                    )}
                    
                    {appointment.symptoms && (
                      <div>
                        <h4 className="font-semibold mb-2">Detailed Symptoms</h4>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          {typeof appointment.symptoms === 'string' ? (
                            <p className="text-gray-700">{appointment.symptoms}</p>
                          ) : (
                            <div className="space-y-2">
                              {appointment.symptoms.text && (
                                <p className="text-gray-700">{appointment.symptoms.text}</p>
                              )}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                                {appointment.symptoms.duration && (
                                  <div className="text-sm">
                                    <span className="font-medium text-gray-600">Duration:</span>
                                    <p className="text-gray-700">{appointment.symptoms.duration}</p>
                                  </div>
                                )}
                                {appointment.symptoms.painLevel && (
                                  <div className="text-sm">
                                    <span className="font-medium text-gray-600">Pain Level:</span>
                                    <p className="text-gray-700">{appointment.symptoms.painLevel}/10</p>
                                  </div>
                                )}
                                {appointment.symptoms.specialization && (
                                  <div className="text-sm">
                                    <span className="font-medium text-gray-600">Related to:</span>
                                    <p className="text-gray-700">{appointment.symptoms.specialization}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {appointment.symptomDuration && (
                        <div>
                          <h4 className="font-semibold mb-2">Symptom Duration</h4>
                          <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg">
                            {appointment.symptomDuration}
                          </p>
                        </div>
                      )}
                      
                      {appointment.painLevel && (
                        <div>
                          <h4 className="font-semibold mb-2">Pain Level</h4>
                          <div className="bg-red-50 p-3 rounded-lg">
                            <div className="flex items-center">
                              <ScaleIcon className="w-4 h-4 text-red-600 mr-2" />
                              <span className="text-gray-700 font-medium">
                                {appointment.painLevel}/10
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Voice Recording */}
            {appointment.patientVoiceNote && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MicrophoneIcon className="w-5 h-5 mr-2" />
                      Voice Recording & AI Analysis
                    </CardTitle>
                    <CardDescription>
                      Your voice recording and AI medical analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                        <SparklesIcon className="w-4 h-4 mr-2" />
                        AI Transcription
                      </h4>
                      <p className="text-blue-800 italic leading-relaxed">
                        "{appointment.patientVoiceNote}"
                      </p>
                    </div>
                    
                    {appointment.patientVoiceUrl && (
                      <div className="mt-4">
                        <audio controls className="w-full">
                          <source src={appointment.patientVoiceUrl} type="audio/webm" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Medical Documents */}
            {appointment.medicalDocuments && appointment.medicalDocuments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CloudArrowUpIcon className="w-5 h-5 mr-2" />
                      Uploaded Medical Documents
                    </CardTitle>
                    <CardDescription>
                      Documents you submitted with this appointment
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {appointment.medicalDocuments.map((doc, index) => (
                        <div 
                          key={doc.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                        >
                          <div className="flex items-center space-x-3">
                            <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="font-medium text-gray-900">{doc.fileName}</p>
                              <p className="text-sm text-gray-500">
                                {formatFileSize(doc.fileSize)} • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <EyeIcon className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Doctor's Notes */}
            {appointment.doctorNotes && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <DocumentTextIcon className="w-5 h-5 mr-2" />
                      Doctor's Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="text-green-800">{appointment.doctorNotes}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Patient Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Patient Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Patient Name</span>
                    <p className="text-gray-900">{appointment.patient.user.name}</p>
                  </div>
                  
                  {appointment.patient.allergies && appointment.patient.allergies.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Allergies</span>
                      <div className="space-y-1">
                        {appointment.patient.allergies.map((allergy, index) => (
                          <span key={index} className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full mr-1">
                            {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {appointment.patient.currentMedications && appointment.patient.currentMedications.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Current Medications</span>
                      <div className="space-y-1">
                        {appointment.patient.currentMedications.map((medication, index) => (
                          <span key={index} className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mr-1">
                            {medication}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {appointment.aiSummary && (
                    <Button variant="outline" className="w-full justify-start">
                      <SparklesIcon className="w-4 h-4 mr-2" />
                      View AI Summary
                    </Button>
                  )}
                  
                  {appointment.prescription && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href={`/patient/prescriptions/${appointment.id}`}>
                        <DocumentTextIcon className="w-4 h-4 mr-2" />
                        View Prescription
                      </Link>
                    </Button>
                  )}
                  
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/patient/book">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Book Follow-up
                    </Link>
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href={`tel:${appointment.doctor.user.email}`}>
                      <PhoneIcon className="w-4 h-4 mr-2" />
                      Contact Doctor
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Appointment Timeline */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Appointment Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Appointment Booked</p>
                        <p className="text-xs text-gray-500">
                          {new Date(appointment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {appointment.status === 'COMPLETED' && (
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">Appointment Completed</p>
                          <p className="text-xs text-gray-500">
                            {new Date(appointment.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  )
}