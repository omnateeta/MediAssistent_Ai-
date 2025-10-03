"use client"

import { useState, useEffect } from "react"
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
  SparklesIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline"
import { motion } from "framer-motion"

interface Doctor {
  id: string
  name: string
  specialization: string[]
  consultationFee: number
  isAvailable: boolean
}

interface TimeSlot {
  time: string
  available: boolean
}

export default function BookAppointmentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
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
      router.push("/auth/signin")
      return
    }
    if (session.user.role !== "PATIENT") {
      router.push("/")
      return
    }
  }, [session, status, router])

  // Mock data - in real app, this would come from API
  const specializations = [
    "Cardiology",
    "Dermatology", 
    "Endocrinology",
    "Gastroenterology",
    "General Practice",
    "Neurology",
    "Oncology",
    "Orthopedics",
    "Pediatrics",
    "Psychiatry",
    "Pulmonology",
    "Urology"
  ]

  const mockDoctors: Doctor[] = [
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      specialization: ["Cardiology"],
      consultationFee: 150,
      isAvailable: true,
    },
    {
      id: "2", 
      name: "Dr. Michael Chen",
      specialization: ["General Practice"],
      consultationFee: 100,
      isAvailable: true,
    },
    {
      id: "3",
      name: "Dr. Emily Rodriguez",
      specialization: ["Pediatrics"],
      consultationFee: 120,
      isAvailable: true,
    }
  ]

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

  useEffect(() => {
    if (formData.specialization) {
      // Filter doctors by specialization
      const filteredDoctors = mockDoctors.filter(doctor =>
        doctor.specialization.includes(formData.specialization)
      )
      setDoctors(filteredDoctors)
    }
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
      // Mock API call - in real app, submit to backend
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generate reference ID and redirect to confirmation
      const referenceId = `REF-${Date.now().toString(36).toUpperCase()}`
      router.push(`/patient/appointment-confirmation?ref=${referenceId}`)
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
                <Select 
                  value={formData.specialization}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, specialization: value, doctorId: "" }))}
                >
                  <SelectTrigger label="Specialization">
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {specializations.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {doctors.length > 0 && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Available Doctors</label>
                    {doctors.map((doctor) => (
                      <div
                        key={doctor.id}
                        className={`
                          p-4 border rounded-lg cursor-pointer transition-colors
                          ${formData.doctorId === doctor.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                        onClick={() => setFormData(prev => ({ ...prev, doctorId: doctor.id }))}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">{doctor.name}</h3>
                            <p className="text-sm text-gray-600">{doctor.specialization.join(", ")}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">${doctor.consultationFee}</p>
                            <p className="text-sm text-green-600">Available</p>
                          </div>
                        </div>
                      </div>
                    ))}
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
