"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { 
  CalendarIcon, 
  ClockIcon, 
  UserIcon,
  PhoneIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  BeakerIcon,
  DocumentIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline"
import { motion } from "framer-motion"

interface AppointmentDetail {
  id: string
  referenceId: string
  patientName: string
  patientAge: number
  patientGender: string
  contactInfo: string
  email: string
  scheduledDate: string
  scheduledTime: string
  status: string
  urgencyLevel: string
  chiefComplaint: string
  symptoms: string[]
  medicalHistory: string[]
  currentMedications: string[]
  allergies: string[]
  vitalSigns: {
    bloodPressure: string
    heartRate: string
    temperature: string
    weight: string
    height: string
  }
  hasAiSummary: boolean
  isNewPatient: boolean
  notes: string
  diagnosis: string
  treatment: string
  prescription: string
  followUpDate: string
}

export default function AppointmentDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const appointmentId = params.id as string

  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null)
  const [notes, setNotes] = useState("")
  const [diagnosis, setDiagnosis] = useState("")
  const [treatment, setTreatment] = useState("")
  const [prescription, setPrescription] = useState("")

  // Redirect if not authenticated or not a doctor
  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }
    if (session.user.role !== "DOCTOR") {
      router.push("/")
      return
    }
  }, [session, status, router])

  // Fetch appointment data from API
  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      // Validate appointment ID
      if (!appointmentId) {
        router.push('/doctor/appointments')
        return
      }
      
      // Basic validation of appointment ID format
      if (typeof appointmentId !== 'string' || appointmentId.length < 20) {
        router.push('/doctor/appointments')
        return
      }
      
      try {
        const res = await fetch(`/api/doctor/appointments/${encodeURIComponent(appointmentId)}`, {
          credentials: 'include'
        })
        
        if (!res.ok) {
          if (res.status === 404) {
            // Redirect to appointments page
            router.push('/doctor/appointments')
            return
          }
          throw new Error(`Failed to fetch appointment: ${res.status}`)
        }
        
        const data = await res.json()
        
        if (data.success && data.appointment) {
          setAppointment(data.appointment)
          setNotes(data.appointment.notes || '')
          setDiagnosis(data.appointment.diagnosis || '')
          setTreatment(data.appointment.treatment || '')
          setPrescription(data.appointment.prescription ? 
            data.appointment.prescription.medications.map((med: any) => 
              `${med.name} - ${med.dosage} ${med.frequency}${med.instructions ? ` (${med.instructions})` : ''}`
            ).join('\n') : ''
          )
        } else {
          // Redirect to appointments page on invalid response
          router.push('/doctor/appointments')
        }
      } catch (error) {
        // Redirect to appointments page on error
        router.push('/doctor/appointments')
      }
    }

    fetchAppointmentDetails()
  }, [appointmentId, router])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />
      case "IN_PROGRESS":
        return <ClockIcon className="w-6 h-6 text-blue-500" />
      case "CANCELLED":
        return <XCircleIcon className="w-6 h-6 text-red-500" />
      default:
        return <CalendarIcon className="w-6 h-6 text-gray-500" />
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "HIGH":
        return "bg-red-100 text-red-800 border-red-200"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "LOW":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session || session.user.role !== "DOCTOR") {
    return null
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <ExclamationTriangleIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Appointment Not Found</h3>
            <p className="text-gray-600 mb-4">The requested appointment could not be found.</p>
            <Button asChild>
              <Link href="/doctor/appointments">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Appointments
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link href="/doctor/appointments">
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Back to Appointments
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Appointment Details
                </h1>
                <p className="text-gray-600">
                  {appointment.referenceId} - {appointment.patientName}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {getStatusIcon(appointment.status)}
              <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getUrgencyColor(appointment.urgencyLevel)}`}>
                {appointment.urgencyLevel} Priority
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserIcon className="w-5 h-5 mr-2" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{appointment.patientName}</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Age:</strong> {appointment.patientAge}</p>
                      <p><strong>Gender:</strong> {appointment.patientGender}</p>
                      <p><strong>Phone:</strong> {appointment.contactInfo}</p>
                      <p><strong>Email:</strong> {appointment.email}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Appointment Details</h4>
                    <div className="space-y-2 text-sm">
                      <p className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {new Date(appointment.scheduledDate).toLocaleDateString()}
                      </p>
                      <p className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-2" />
                        {appointment.scheduledTime}
                      </p>
                      {appointment.isNewPatient && (
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          New Patient
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chief Complaint & Symptoms */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BeakerIcon className="w-5 h-5 mr-2" />
                  Chief Complaint & Symptoms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Chief Complaint</h4>
                    <p className="text-gray-700">{appointment.chiefComplaint}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Symptoms</h4>
                    <div className="flex flex-wrap gap-2">
                      {appointment.symptoms.map((symptom, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DocumentTextIcon className="w-5 h-5 mr-2" />
                  Medical History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Medical History</h4>
                    <ul className="space-y-1 text-sm">
                      {appointment.medicalHistory.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Current Medications</h4>
                    <ul className="space-y-1 text-sm">
                      {appointment.currentMedications.map((med, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {med}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Known Allergies</h4>
                  <div className="flex flex-wrap gap-2">
                    {appointment.allergies.map((allergy, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                      >
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Clinical Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Clinical Notes & Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Clinical Notes</label>
                  <Textarea
                    placeholder="Enter clinical observations and notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Diagnosis</label>
                  <Textarea
                    placeholder="Enter diagnosis..."
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Treatment Plan</label>
                  <Textarea
                    placeholder="Enter treatment plan..."
                    value={treatment}
                    onChange={(e) => setTreatment(e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Prescription</label>
                  <Textarea
                    placeholder="Enter prescription details..."
                    value={prescription}
                    onChange={(e) => setPrescription(e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Vital Signs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HeartIcon className="w-5 h-5 mr-2" />
                  Vital Signs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Blood Pressure</span>
                    <span className="font-medium">{appointment.vitalSigns.bloodPressure}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Heart Rate</span>
                    <span className="font-medium">{appointment.vitalSigns.heartRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Temperature</span>
                    <span className="font-medium">{appointment.vitalSigns.temperature}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Weight</span>
                    <span className="font-medium">{appointment.vitalSigns.weight}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Height</span>
                    <span className="font-medium">{appointment.vitalSigns.height}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {appointment.hasAiSummary && (
                  <Button variant="outline" className="w-full justify-start">
                    <DocumentTextIcon className="w-4 h-4 mr-2" />
                    View AI Summary
                  </Button>
                )}
                <Button variant="outline" className="w-full justify-start">
                  <DocumentIcon className="w-4 h-4 mr-2" />
                  Generate Prescription
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Schedule Follow-up
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <ChartBarIcon className="w-4 h-4 mr-2" />
                  View Patient History
                </Button>
              </CardContent>
            </Card>

            {/* Status Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Appointment Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="medical" 
                  className="w-full"
                  disabled={appointment.status === "IN_PROGRESS"}
                >
                  {appointment.status === "IN_PROGRESS" ? "In Progress" : "Start Appointment"}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled={appointment.status === "COMPLETED"}
                >
                  {appointment.status === "COMPLETED" ? "Completed" : "Mark Complete"}
                </Button>
                <Button variant="outline" className="w-full">
                  Save Progress
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
