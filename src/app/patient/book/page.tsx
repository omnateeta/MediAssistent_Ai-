"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  CalendarIcon, 
  ClockIcon, 
  UserIcon,
  MicrophoneIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
  SparklesIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline"
import { motion } from "framer-motion"

interface Doctor {
  id: string
  userId: string
  name: string
  email: string
  specialization: string[]
  consultationFee: number
  isAvailable: boolean
  isVerified: boolean
  yearsOfExperience?: number
  hospitalAffiliation?: string
  qualifications?: string[]
  languagesSpoken?: string[]
}

interface TimeSlot {
  time: string
  available: boolean
}

export default function BookAppointmentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [doctorsError, setDoctorsError] = useState<string | null>(null)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [specializations, setSpecializations] = useState<string[]>([])
  const [loadingSpecializations, setLoadingSpecializations] = useState(true)  
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  
  const [formData, setFormData] = useState({
    specialization: "",
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    chiefComplaint: "",
    symptoms: "",
    symptomDuration: "",
    painLevel: 1,
    allergies: "",
    currentMedications: "",
    voiceNote: "",
    uploadedFiles: [] as File[],
  })

  // Redirect if not authenticated or not a patient
  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin/patient")
      return
    }
    if (session.user.role !== "PATIENT") {
      try {
        const returnTo = typeof window !== 'undefined' ? window.location.pathname + window.location.search : undefined
        const cb = returnTo ? `?callbackUrl=${encodeURIComponent(returnTo)}` : ''
        const expected = `&expectedRole=PATIENT`
        router.push(`/auth/signin/patient${cb}`)
      } catch (e) {
        router.push('/auth/signin/patient')
      }
      return
    }
  }, [session, status, router])

  // Load available specializations from database
  useEffect(() => {
    const loadSpecializations = async () => {
      try {
        const res = await fetch('/api/doctors/specializations')
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.specializations.length > 0) {
            setSpecializations(data.specializations)
          } else {
            // Fallback to predefined list if no doctors in database
            setSpecializations([
              "Cardiology", "Dermatology", "Endocrinology", "Gastroenterology",
              "General Practice", "Neurology", "Oncology", "Orthopedics",
              "Pediatrics", "Psychiatry", "Pulmonology", "Urology"
            ])
          }
        } else {
          throw new Error('Failed to fetch specializations')
        }
      } catch (error) {
        console.error('Error loading specializations:', error)
        // Fallback to predefined list
        setSpecializations([
          "Cardiology", "Dermatology", "Endocrinology", "Gastroenterology",
          "General Practice", "Neurology", "Oncology", "Orthopedics",
          "Pediatrics", "Psychiatry", "Pulmonology", "Urology"
        ])
      } finally {
        setLoadingSpecializations(false)
      }
    }

    loadSpecializations()
  }, [])

  const mockTimeSlots: TimeSlot[] = [
    { time: "09:00", available: true },
    { time: "09:30", available: true },
    { time: "10:00", available: false },
    { time: "10:30", available: true },
    { time: "11:00", available: true },
    { time: "11:30", available: false },
    { time: "14:00", available: true },
    { time: "14:30", available: true },
    { time: "15:00", available: true },
    { time: "15:30", available: false },
    { time: "16:00", available: true },
    { time: "16:30", available: true },
  ]

  // Fetch doctors based on selected specialization from real database
  useEffect(() => {
    const loadDoctors = async () => {
      if (!formData.specialization) {
        setDoctors([])
        setDoctorsError(null)
        return
      }

      setLoadingDoctors(true)
      setDoctorsError(null)
      
      try {
        const res = await fetch(`/api/doctors/by-specialization?specialization=${encodeURIComponent(formData.specialization)}`)
        
        if (!res.ok) {
          throw new Error(`Failed to fetch doctors: ${res.status}`)
        }
        
        const data = await res.json()
        
        if (data.success) {
          setDoctors(data.doctors || [])
          if (data.doctors.length === 0) {
            setDoctorsError(`No doctors available for ${formData.specialization} specialization`)
          }
        } else {
          throw new Error(data.error || 'Failed to fetch doctors')
        }
      } catch (error) {
        console.error('Error fetching doctors:', error)
        setDoctorsError('Failed to load doctors. Please try again.')
        setDoctors([])
      } finally {
        setLoadingDoctors(false)
      }
    }

    loadDoctors()
  }, [formData.specialization])

  useEffect(() => {
    if (formData.appointmentDate) {
      setAvailableSlots(mockTimeSlots)
    }
  }, [formData.appointmentDate])

  const handleVoiceRecording = () => {
    if (!isRecording) {
      setIsRecording(true)
      setRecordingDuration(0)
      
      // Mock recording - in real app, use Web Audio API
      const interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)
      
      setTimeout(() => {
        setIsRecording(false)
        clearInterval(interval)
        setFormData(prev => ({
          ...prev,
          voiceNote: "Voice note recorded successfully (mock)"
        }))
      }, 5000) // Auto-stop after 5 seconds for demo
    } else {
      setIsRecording(false)
      setRecordingDuration(0)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({
      ...prev,
      uploadedFiles: [...prev.uploadedFiles, ...files]
    }))
  }

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    
    try {
      // Submit to backend API to create appointment
      const res = await fetch('/api/patient/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // include credentials (cookies) so server-side session is available to the API
        credentials: 'include',
        body: JSON.stringify({
          specialization: formData.specialization,
          doctorId: formData.doctorId,
          appointmentDate: formData.appointmentDate,
          appointmentTime: formData.appointmentTime,
          chiefComplaint: formData.chiefComplaint,
          symptoms: formData.symptoms,
          symptomDuration: formData.symptomDuration,
          painLevel: formData.painLevel,
          allergies: formData.allergies,
          currentMedications: formData.currentMedications,
        })
      })

      if (!res.ok) {
        // If user is not authenticated, redirect to sign-in
        if (res.status === 401) {
          const cb = encodeURIComponent(pathname || '/patient/book')
          router.push(`/auth/signin/patient?callbackUrl=${cb}&from=booking`)
          return
        }

        const err = await res.json().catch(() => ({}))
        console.error('Create appointment failed:', res.status, err)
        throw new Error(err?.error || 'Failed to create appointment')
      }

      const data = await res.json()
      const appointmentId = data?.appointment?.id

      // Redirect to confirmation with appointment id
      router.push(`/patient/appointment-confirmation?ref=${appointmentId || 'REF-' + Date.now().toString(36).toUpperCase()}`)
    } catch (error) {
      console.error("Error booking appointment:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    if (step < 4) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                  ${step >= stepNumber 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`
                    w-16 h-1 mx-2
                    ${step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Select Doctor</span>
            <span>Symptoms</span>
            <span>Upload Files</span>
            <span>Confirm</span>
          </div>
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Step 1: Doctor Selection */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5" />
                  Select Doctor & Appointment Time
                </CardTitle>
                <CardDescription>
                  Choose your preferred specialization, doctor, and appointment time
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Medical Specialization</label>
                  <Select 
                    value={formData.specialization}
                    onValueChange={(value) => {
                      setFormData(prev => ({ 
                        ...prev, 
                        specialization: value, 
                        doctorId: "" // Clear doctor selection when specialization changes
                      }))
                    }}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder={loadingSpecializations ? "Loading specializations..." : "Choose a medical specialization"} />
                    </SelectTrigger>
                    <SelectContent>
                      {specializations.map((spec) => (
                        <SelectItem key={spec} value={spec} className="py-3">
                          <div className="flex items-center">
                            <span className="mr-2">🩺</span>
                            {spec}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.specialization && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Available Doctors</label>
                    
                    {loadingDoctors && (
                      <div className="flex items-center justify-center p-8 text-gray-500">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                        Loading doctors for {formData.specialization}...
                      </div>
                    )}
                    
                    {doctorsError && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center">
                          <div className="text-yellow-600 mr-2">⚠️</div>
                          <p className="text-yellow-800 text-sm">{doctorsError}</p>
                        </div>
                        <p className="text-yellow-700 text-xs mt-1">
                          Please try selecting a different specialization or contact support.
                        </p>
                      </div>
                    )}
                    
                    {!loadingDoctors && !doctorsError && doctors.length > 0 && (
                      <div className="space-y-4">
                        <Select 
                          value={formData.doctorId}
                          onValueChange={(value) => {
                            setFormData(prev => ({ ...prev, doctorId: value }))
                          }}
                          disabled={loadingDoctors}
                        >
                          <SelectTrigger className="h-auto min-h-[60px] p-4 border-2 hover:border-blue-300 focus:border-blue-500 font-bold">
                            <SelectValue placeholder="👨‍⚕️ Choose your doctor" className="font-bold">
                              {formData.doctorId && (
                                <div className="flex justify-between items-center w-full">
                                  <div className="text-left">
                                    <p className="font-bold text-gray-900 text-base">
                                      👨‍⚕️ {doctors.find(d => d.id === formData.doctorId)?.name}
                                    </p>
                                    <p className="text-sm text-blue-700 font-bold">
                                      {doctors.find(d => d.id === formData.doctorId)?.specialization.join(", ")}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-black text-green-800 text-lg">
                                      ${doctors.find(d => d.id === formData.doctorId)?.consultationFee}
                                    </p>
                                    <div className="flex items-center justify-end mt-1">
                                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                                      <p className="text-xs text-green-600 font-bold">Available</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent 
                            className="max-h-[400px] w-full z-[1000] bg-gray-50 p-3 shadow-xl border-2 border-gray-200"
                            side="bottom"
                            align="start"
                            sideOffset={4}
                            avoidCollisions={false}
                          >
                            {doctors.map((doctor) => (
                              <SelectItem 
                                key={doctor.id} 
                                value={doctor.id}
                                className="p-0 h-auto cursor-pointer focus:bg-transparent hover:bg-transparent data-[highlighted]:bg-transparent mb-3"
                              >
                                <div className="w-full p-5 border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all duration-300 bg-white shadow-sm">
                                  <div className="flex justify-between items-start w-full">
                                    <div className="flex-1 text-left">
                                      <div className="flex items-center mb-3">
                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mr-4 shadow-sm">
                                          <span className="text-xl">🩺</span>
                                        </div>
                                        <div>
                                          <h3 className="font-bold text-gray-900 text-lg">{doctor.name}</h3>
                                          <p className="text-base text-blue-700 font-bold">{doctor.specialization.join(", ")}</p>
                                        </div>
                                      </div>
                                      
                                      <div className="space-y-2 ml-16">
                                        {doctor.hospitalAffiliation && (
                                          <div className="flex items-center text-sm text-gray-700 font-semibold">
                                            <span className="mr-3 text-base">🏥</span>
                                            <span>{doctor.hospitalAffiliation}</span>
                                          </div>
                                        )}
                                        
                                        <div className="flex items-center space-x-6">
                                          {doctor.yearsOfExperience && (
                                            <div className="flex items-center text-sm text-gray-700 font-semibold">
                                              <span className="mr-2 text-base">📅</span>
                                              <span>{doctor.yearsOfExperience} years exp.</span>
                                            </div>
                                          )}
                                          {doctor.isVerified && (
                                            <div className="flex items-center text-sm text-green-700 font-bold">
                                              <span className="mr-2 text-base">✅</span>
                                              <span>Verified Doctor</span>
                                            </div>
                                          )}
                                        </div>
                                        
                                        {doctor.qualifications && doctor.qualifications.length > 0 && (
                                          <div className="flex items-center text-sm text-gray-700 font-medium">
                                            <span className="mr-3 text-base">🎓</span>
                                            <span className="font-semibold">{doctor.qualifications.slice(0, 2).join(", ")}{doctor.qualifications.length > 2 && '...'}</span>
                                          </div>
                                        )}
                                        
                                        {doctor.languagesSpoken && doctor.languagesSpoken.length > 0 && (
                                          <div className="flex items-center text-sm text-gray-700 font-medium">
                                            <span className="mr-3 text-base">🌐</span>
                                            <span className="font-semibold">{doctor.languagesSpoken.slice(0, 3).join(", ")}{doctor.languagesSpoken.length > 3 && '...'}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="text-right ml-6">
                                      <div className="bg-gradient-to-r from-green-200 to-green-300 px-4 py-3 rounded-xl mb-3 text-center shadow-md border border-green-300">
                                        <div className="text-2xl font-black text-green-900">${doctor.consultationFee}</div>
                                        <div className="text-sm text-green-800 font-bold">Consultation Fee</div>
                                      </div>
                                      <div className="flex items-center justify-center bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                        <span className="text-sm text-green-700 font-bold">Available Now</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {/* Selected Doctor Details Box */}
                        {formData.doctorId && (
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-2">Selected Doctor Details</h4>
                            {(() => {
                              const selectedDoctor = doctors.find(d => d.id === formData.doctorId)
                              return selectedDoctor ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p><span className="font-medium text-blue-800">Doctor:</span> {selectedDoctor.name}</p>
                                    <p><span className="font-medium text-blue-800">Specialization:</span> {selectedDoctor.specialization.join(", ")}</p>
                                    {selectedDoctor.hospitalAffiliation && (
                                      <p><span className="font-medium text-blue-800">Hospital:</span> {selectedDoctor.hospitalAffiliation}</p>
                                    )}
                                  </div>
                                  <div>
                                    <p><span className="font-medium text-blue-800">Consultation Fee:</span> ${selectedDoctor.consultationFee}</p>
                                    {selectedDoctor.yearsOfExperience && (
                                      <p><span className="font-medium text-blue-800">Experience:</span> {selectedDoctor.yearsOfExperience} years</p>
                                    )}
                                    {selectedDoctor.languagesSpoken && selectedDoctor.languagesSpoken.length > 0 && (
                                      <p><span className="font-medium text-blue-800">Languages:</span> {selectedDoctor.languagesSpoken.join(", ")}</p>
                                    )}
                                  </div>
                                </div>
                              ) : null
                            })()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {formData.doctorId && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Appointment Date"
                      type="date"
                      required
                      value={formData.appointmentDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, appointmentDate: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                    />

                    {availableSlots.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Available Times</label>
                        <div className="grid grid-cols-3 gap-2">
                          {availableSlots.map((slot) => (
                            <button
                              key={slot.time}
                              type="button"
                              disabled={!slot.available}
                              className={`
                                p-2 text-sm rounded border transition-colors
                                ${!slot.available 
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                  : formData.appointmentTime === slot.time
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                                }
                              `}
                              onClick={() => setFormData(prev => ({ ...prev, appointmentTime: slot.time }))}
                            >
                              {slot.time}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end">
                  <Button 
                    onClick={nextStep}
                    disabled={!formData.doctorId || !formData.appointmentDate || !formData.appointmentTime}
                    variant="medical"
                  >
                    Next: Describe Symptoms
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Symptoms Input */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5" />
                  Describe Your Symptoms
                </CardTitle>
                <CardDescription>
                  Provide detailed information about your symptoms for AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Textarea
                  label="Chief Complaint"
                  required
                  value={formData.chiefComplaint}
                  onChange={(e) => setFormData(prev => ({ ...prev, chiefComplaint: e.target.value }))}
                  placeholder="What is the main reason for your visit?"
                  rows={3}
                />

                <Textarea
                  label="Detailed Symptoms"
                  required
                  value={formData.symptoms}
                  onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
                  placeholder="Describe your symptoms in detail..."
                  rows={4}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Symptom Duration"
                    value={formData.symptomDuration}
                    onChange={(e) => setFormData(prev => ({ ...prev, symptomDuration: e.target.value }))}
                    placeholder="e.g., 3 days, 2 weeks"
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pain Level (1-10)</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.painLevel}
                      onChange={(e) => setFormData(prev => ({ ...prev, painLevel: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>1 (Mild)</span>
                      <span className="font-medium">{formData.painLevel}</span>
                      <span>10 (Severe)</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Textarea
                    label="Known Allergies"
                    value={formData.allergies}
                    onChange={(e) => setFormData(prev => ({ ...prev, allergies: e.target.value }))}
                    placeholder="List any allergies..."
                    rows={3}
                  />

                  <Textarea
                    label="Current Medications"
                    value={formData.currentMedications}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentMedications: e.target.value }))}
                    placeholder="List current medications..."
                    rows={3}
                  />
                </div>

                {/* Voice Recording */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <MicrophoneIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Voice Description</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Record a voice note describing your symptoms
                    </p>
                    <div className="mt-4">
                      <Button
                        type="button"
                        variant={isRecording ? "danger" : "outline"}
                        onClick={handleVoiceRecording}
                        className="mx-auto"
                      >
                        {isRecording ? (
                          <>
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />
                            Recording... {recordingDuration}s
                          </>
                        ) : (
                          <>
                            <MicrophoneIcon className="w-4 h-4 mr-2" />
                            {formData.voiceNote ? "Re-record" : "Start Recording"}
                          </>
                        )}
                      </Button>
                      {formData.voiceNote && (
                        <p className="mt-2 text-sm text-green-600 flex items-center justify-center">
                          <CheckCircleIcon className="w-4 h-4 mr-1" />
                          Voice note recorded
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                  <Button 
                    onClick={nextStep}
                    disabled={!formData.chiefComplaint || !formData.symptoms}
                    variant="medical"
                  >
                    Next: Upload Files
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: File Upload */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CloudArrowUpIcon className="w-5 h-5" />
                  Upload Medical Documents
                </CardTitle>
                <CardDescription>
                  Upload any relevant medical reports, images, or documents (optional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Upload Files</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Drag and drop files here, or click to browse
                    </p>
                    <div className="mt-4">
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload">
                        <Button type="button" variant="outline" className="cursor-pointer">
                          Choose Files
                        </Button>
                      </label>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Supported: PDF, JPG, PNG, DOC, DOCX (Max 10MB each)
                    </p>
                  </div>
                </div>

                {formData.uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Uploaded Files</h4>
                    {formData.uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                            <DocumentTextIcon className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                  <Button onClick={nextStep} variant="medical">
                    Next: Review & Confirm
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5" />
                  Review & Confirm Appointment
                </CardTitle>
                <CardDescription>
                  Please review your appointment details before confirming
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Appointment Summary */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-3">Appointment Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700 font-medium">Doctor:</span>
                      <p className="text-blue-900">
                        {doctors.find(d => d.id === formData.doctorId)?.name}
                      </p>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Specialization:</span>
                      <p className="text-blue-900">{formData.specialization}</p>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Date & Time:</span>
                      <p className="text-blue-900">
                        {formData.appointmentDate} at {formData.appointmentTime}
                      </p>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Consultation Fee:</span>
                      <p className="text-blue-900">
                        ${doctors.find(d => d.id === formData.doctorId)?.consultationFee}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Symptoms Summary */}
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Symptoms Summary</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Chief Complaint:</span>
                      <p className="text-sm text-gray-900">{formData.chiefComplaint}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Symptoms:</span>
                      <p className="text-sm text-gray-900">{formData.symptoms}</p>
                    </div>
                    {formData.symptomDuration && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Duration:</span>
                        <p className="text-sm text-gray-900">{formData.symptomDuration}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-sm font-medium text-gray-700">Pain Level:</span>
                      <p className="text-sm text-gray-900">{formData.painLevel}/10</p>
                    </div>
                  </div>
                </div>

                {/* Files Summary */}
                {formData.uploadedFiles.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Uploaded Files</h3>
                    <p className="text-sm text-gray-600">
                      {formData.uploadedFiles.length} file(s) uploaded
                    </p>
                  </div>
                )}

                {formData.voiceNote && (
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    Voice note recorded
                  </div>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    loading={isLoading}
                    variant="medical"
                    size="lg"
                  >
                    Confirm Appointment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  )
}
