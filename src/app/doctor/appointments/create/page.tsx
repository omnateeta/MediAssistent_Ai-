"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  CalendarIcon, 
  ClockIcon, 
  UserIcon,
  ArrowLeftIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline"
import { motion } from "framer-motion"

interface Patient {
  id: string
  name: string
  email: string
  dateOfBirth?: string
}

export default function CreateAppointmentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [step, setStep] = useState(1)
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    patientId: "",
    appointmentDate: "",
    appointmentTime: "",
    chiefComplaint: "",
    symptoms: "",
    symptomDuration: "",
    painLevel: 1,
    notes: ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdAppointment, setCreatedAppointment] = useState<any>(null)

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

  // Load patients
  useEffect(() => {
    const loadPatients = async () => {
      if (status !== "authenticated" || !session || session.user.role !== "DOCTOR") return
      
      try {
        setLoading(true)
        // Use the basic parameter to get simplified patient list
        const res = await fetch("/api/doctor/patients?basic=true")
        if (!res.ok) throw new Error("Failed to load patients")
        
        const data = await res.json()
        setPatients(data.patients || [])
      } catch (error) {
        console.error("Error loading patients:", error)
        // Show error in UI instead of using toast
      } finally {
        setLoading(false)
      }
    }

    loadPatients()
  }, [session, status])

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {}
    
    if (step === 1) {
      if (!formData.patientId) newErrors.patientId = "Please select a patient"
      if (!formData.appointmentDate) newErrors.appointmentDate = "Please select a date"
      if (!formData.appointmentTime) newErrors.appointmentTime = "Please select a time"
    }
    
    if (step === 2) {
      if (!formData.chiefComplaint) newErrors.chiefComplaint = "Please enter the chief complaint"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handlePainLevelChange = (level: number) => {
    setFormData(prev => ({ ...prev, painLevel: level }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep(3)) return
    
    setIsSubmitting(true)
    
    try {
      const res = await fetch("/api/doctor/appointments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(formData)
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to create appointment")
      }
      
      setCreatedAppointment(data.appointment)
      // Show success in UI instead of using toast
    } catch (error) {
      console.error("Error creating appointment:", error)
      // Show error in UI instead of using toast
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPatientAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return "N/A"
    const dob = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const monthDiff = today.getMonth() - dob.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--
    }
    return `${age} years`
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

  if (createdAppointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircleIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Appointment Created Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                The appointment has been scheduled for {createdAppointment.patient.user.name}.
              </p>
              
              <div className="bg-blue-50 rounded-lg p-6 mb-6 text-left">
                <h3 className="font-semibold text-blue-900 mb-3">Appointment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Patient:</span>
                    <p className="text-blue-900">{createdAppointment.patient.user.name}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Doctor:</span>
                    <p className="text-blue-900">{createdAppointment.doctor.user.name}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Date & Time:</span>
                    <p className="text-blue-900">
                      {new Date(createdAppointment.scheduledDate).toLocaleDateString()} at{" "}
                      {new Date(createdAppointment.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Status:</span>
                    <p className="text-blue-900">{createdAppointment.status}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" asChild>
                  <Link href="/doctor/appointments">
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back to Appointments
                  </Link>
                </Button>
                <Button variant="medical" asChild>
                  <Link href={`/doctor/appointments/${createdAppointment.id}`}>
                    View Appointment Details
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Create New Appointment
              </h1>
              <p className="text-gray-600">
                Schedule an appointment for one of your patients
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/doctor/appointments">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Appointments
              </Link>
            </Button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex flex-col items-center z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  step === num 
                    ? "bg-blue-600 text-white" 
                    : step > num 
                      ? "bg-green-600 text-white" 
                      : "bg-white border-2 border-gray-300 text-gray-500"
                }`}>
                  {step > num ? (
                    <CheckCircleIcon className="w-6 h-6" />
                  ) : (
                    <span className="font-medium">{num}</span>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {num === 1 && "Patient & Time"}
                  {num === 2 && "Symptoms"}
                  {num === 3 && "Review"}
                </span>
              </div>
            ))}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0"></div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && "Select Patient & Time"}
              {step === 2 && "Describe Symptoms"}
              {step === 3 && "Review & Confirm"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Choose a patient and schedule the appointment time"}
              {step === 2 && "Enter the patient's symptoms and complaints"}
              {step === 3 && "Review all appointment details before confirming"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              {/* Step 1: Patient & Time Selection */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Patient Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Patient *
                    </label>
                    {loading ? (
                      <div className="animate-pulse">
                        <div className="h-10 bg-gray-200 rounded"></div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <select
                          name="patientId"
                          value={formData.patientId}
                          onChange={handleChange}
                          className={`w-full p-2 border rounded-md ${
                            errors.patientId ? "border-red-500" : "border-gray-300"
                          }`}
                        >
                          <option value="">Select a patient</option>
                          {patients.map((patient) => (
                            <option key={patient.id} value={patient.id}>
                              {patient.name} ({patient.email})
                            </option>
                          ))}
                        </select>
                        {errors.patientId && (
                          <p className="text-red-500 text-sm">{errors.patientId}</p>
                        )}
                        
                        {/* Patient Info Preview */}
                        {formData.patientId && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-2">Selected Patient</h4>
                            {(() => {
                              const patient = patients.find(p => p.id === formData.patientId)
                              return patient ? (
                                <div className="flex items-center space-x-3">
                                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                                    <UserIcon className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{patient.name}</p>
                                    <p className="text-sm text-gray-600">
                                      {patient.email} • Age: {getPatientAge(patient.dateOfBirth)}
                                    </p>
                                  </div>
                                </div>
                              ) : null
                            })()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Appointment Date *
                      </label>
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          type="date"
                          name="appointmentDate"
                          value={formData.appointmentDate}
                          onChange={handleChange}
                          className={`pl-10 ${errors.appointmentDate ? "border-red-500" : ""}`}
                        />
                      </div>
                      {errors.appointmentDate && (
                        <p className="text-red-500 text-sm mt-1">{errors.appointmentDate}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Appointment Time *
                      </label>
                      <div className="relative">
                        <ClockIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          type="time"
                          name="appointmentTime"
                          value={formData.appointmentTime}
                          onChange={handleChange}
                          className={`pl-10 ${errors.appointmentTime ? "border-red-500" : ""}`}
                        />
                      </div>
                      {errors.appointmentTime && (
                        <p className="text-red-500 text-sm mt-1">{errors.appointmentTime}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Symptoms Input */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Chief Complaint */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chief Complaint *
                    </label>
                    <Textarea
                      name="chiefComplaint"
                      value={formData.chiefComplaint}
                      onChange={handleChange}
                      placeholder="What is the main reason for this appointment?"
                      rows={3}
                      className={errors.chiefComplaint ? "border-red-500" : ""}
                    />
                    {errors.chiefComplaint && (
                      <p className="text-red-500 text-sm mt-1">{errors.chiefComplaint}</p>
                    )}
                  </div>

                  {/* Symptoms */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Detailed Symptoms
                    </label>
                    <Textarea
                      name="symptoms"
                      value={formData.symptoms}
                      onChange={handleChange}
                      placeholder="Describe the patient's symptoms in detail..."
                      rows={4}
                    />
                  </div>

                  {/* Symptom Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Symptom Duration
                    </label>
                    <Input
                      type="text"
                      name="symptomDuration"
                      value={formData.symptomDuration}
                      onChange={handleChange}
                      placeholder="e.g., 3 days, 2 weeks, 1 month"
                    />
                  </div>

                  {/* Pain Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pain Level: {formData.painLevel}/10
                    </label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => handlePainLevelChange(level)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            formData.painLevel === level
                              ? level <= 3
                                ? "bg-green-500 text-white"
                                : level <= 6
                                ? "bg-yellow-500 text-white"
                                : "bg-red-500 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>No pain</span>
                      <span>Severe pain</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Review & Confirm */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Patient Info */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-3">Patient Information</h3>
                    {(() => {
                      const patient = patients.find(p => p.id === formData.patientId)
                      return patient ? (
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                            <UserIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{patient.name}</p>
                            <p className="text-sm text-gray-600">
                              {patient.email} • Age: {getPatientAge(patient.dateOfBirth)}
                            </p>
                          </div>
                        </div>
                      ) : null
                    })()}
                  </div>

                  {/* Appointment Details */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-3">Appointment Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700 font-medium">Date:</span>
                        <p className="text-blue-900">
                          {new Date(formData.appointmentDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Time:</span>
                        <p className="text-blue-900">{formData.appointmentTime}</p>
                      </div>
                    </div>
                  </div>

                  {/* Symptoms Summary */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-3">Symptoms Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-blue-700 font-medium">Chief Complaint:</span>
                        <p className="text-blue-900">{formData.chiefComplaint}</p>
                      </div>
                      {formData.symptoms && (
                        <div>
                          <span className="text-blue-700 font-medium">Detailed Symptoms:</span>
                          <p className="text-blue-900">{formData.symptoms}</p>
                        </div>
                      )}
                      {formData.symptomDuration && (
                        <div>
                          <span className="text-blue-700 font-medium">Duration:</span>
                          <p className="text-blue-900">{formData.symptomDuration}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-blue-700 font-medium">Pain Level:</span>
                        <p className="text-blue-900">{formData.painLevel}/10</p>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Doctor Notes
                    </label>
                    <Textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Any additional notes for this appointment..."
                      rows={3}
                    />
                  </div>

                  {/* Confirmation */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-medium text-yellow-800 mb-2">Confirm Appointment</h3>
                    <p className="text-sm text-yellow-700">
                      Please review all details carefully before confirming. Once created, the appointment will be visible to the patient.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={step === 1}
                >
                  Previous
                </Button>
                
                {step < 3 ? (
                  <Button
                    type="button"
                    variant="medical"
                    onClick={nextStep}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="medical"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating..." : "Confirm & Create Appointment"}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}