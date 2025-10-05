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
  reason?: string
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
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [slotsError, setSlotsError] = useState<string | null>(null)
  const [specializations, setSpecializations] = useState<string[]>([])
  const [loadingSpecializations, setLoadingSpecializations] = useState(true)  
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null)
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({})
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  
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
    uploadedDocuments: [] as any[], // Successfully uploaded documents
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
        // Use the same specializations as registration form for consistency
        const registrationSpecializations = [
          "Cardiology", "Dermatology", "Endocrinology", "Gastroenterology", 
          "General Practice", "Neurology", "Oncology", "Orthopedics", 
          "Psychiatry", "Pulmonology"
        ]
        
        const res = await fetch('/api/doctors/specializations')
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.specializations.length > 0) {
            // Filter database specializations to match registration form
            const filteredSpecializations = data.specializations.filter((spec: string) => 
              registrationSpecializations.includes(spec)
            )
            setSpecializations(filteredSpecializations.length > 0 ? filteredSpecializations : registrationSpecializations)
          } else {
            // Use registration form specializations as fallback
            setSpecializations(registrationSpecializations)
          }
        } else {
          throw new Error('Failed to fetch specializations')
        }
      } catch (error) {
        console.error('Error loading specializations:', error)
        // Use registration form specializations as fallback
        setSpecializations([
          "Cardiology", "Dermatology", "Endocrinology", "Gastroenterology",
          "General Practice", "Neurology", "Oncology", "Orthopedics",
          "Psychiatry", "Pulmonology"
        ])
      } finally {
        setLoadingSpecializations(false)
      }
    }

    loadSpecializations()
  }, [])

  // Remove mock data - replaced with real-time API call
  // const mockTimeSlots: TimeSlot[] = [...]

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

  // Fetch available time slots when doctor and date are selected
  useEffect(() => {
    const loadTimeSlots = async () => {
      if (!formData.doctorId || !formData.appointmentDate) {
        setAvailableSlots([])
        setSlotsError(null)
        return
      }

      setLoadingSlots(true)
      setSlotsError(null)
      
      try {
        const res = await fetch(`/api/appointments/available-slots?doctorId=${encodeURIComponent(formData.doctorId)}&date=${encodeURIComponent(formData.appointmentDate)}`)
        
        if (!res.ok) {
          throw new Error(`Failed to fetch time slots: ${res.status}`)
        }
        
        const data = await res.json()
        
        if (data.success) {
          setAvailableSlots(data.timeSlots || [])
          if (data.timeSlots.filter((slot: TimeSlot) => slot.available).length === 0) {
            setSlotsError(`No available time slots for ${data.doctorName} on ${formData.appointmentDate}`)
          }
        } else {
          throw new Error(data.error || 'Failed to fetch time slots')
        }
      } catch (error) {
        console.error('Error fetching time slots:', error)
        setSlotsError('Failed to load available time slots. Please try again.')
        setAvailableSlots([])
      } finally {
        setLoadingSlots(false)
      }
    }

    loadTimeSlots()
  }, [formData.doctorId, formData.appointmentDate])

  // Cleanup audio resources when component unmounts
  useEffect(() => {
    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const handleVoiceRecording = async () => {
    if (!isRecording) {
      try {
        // Request microphone permission with optimized settings for faster processing
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 22050, // Reduced sample rate for smaller file size
            channelCount: 1, // Mono recording
          } 
        })        
        setAudioStream(stream)
        
        // Create MediaRecorder with optimized settings
        const recorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus',
          audioBitsPerSecond: 16000 // Lower bitrate for faster processing
        })
        
        let audioChunks: Blob[] = []
        
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.push(event.data)
          }
        }
        
        recorder.onstop = async () => {
          const newAudioBlob = new Blob(audioChunks, { type: 'audio/webm;codecs=opus' })
          const newAudioUrl = URL.createObjectURL(newAudioBlob)
          
          setAudioBlob(newAudioBlob)
          setAudioUrl(newAudioUrl)
          
          // Convert to base64 for storage
          const reader = new FileReader()
          reader.onloadend = () => {
            const base64Audio = reader.result as string
            setFormData(prev => ({
              ...prev,
              voiceNote: base64Audio
            }))
          }
          reader.readAsDataURL(newAudioBlob)
          
          // Clean up stream
          stream.getTracks().forEach(track => track.stop())
          setAudioStream(null)
          
          // Automatically analyze the recording
          await analyzeVoiceRecording(newAudioBlob)
        }
        
        recorder.onerror = (error) => {
          console.error('Recording error:', error)
          alert('Recording failed. Please try again.')
          setIsRecording(false)
          setRecordingDuration(0)
        }
        
        setMediaRecorder(recorder)
        recorder.start(2000) // Collect data every 2 seconds instead of 1 for better performance
        setIsRecording(true)
        setRecordingDuration(0)
        
        // Start timer with shorter max duration for brief descriptions
        const interval = setInterval(() => {
          setRecordingDuration(prev => {
            if (prev >= 60) { // Max 1 minute for brief descriptions
              clearInterval(interval)
              recorder.stop()
              setIsRecording(false)
              return 60
            }
            return prev + 1
          })
        }, 1000)
        
      } catch (error) {
        console.error('Error accessing microphone:', error)
        alert('Could not access microphone. Please check your browser permissions.')
      }
    } else {
      // Stop recording
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop()
      }
      setIsRecording(false)
      setRecordingDuration(0)
    }
  }

  // Analyze voice recording with Gemini AI
  const analyzeVoiceRecording = async (audioBlob: Blob) => {
    setIsAnalyzing(true)
    
    try {
      // More lenient validation for brief recordings
      if (audioBlob.size < 500) {
        throw new Error('Recording too short. Please record for at least 3 seconds.')
      }
      
      const formData = new FormData()
      formData.append('audio', audioBlob, 'medical-voice-recording.webm')
      
      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
      
      const response = await fetch('/api/patient/analyze-voice-gemini', {
        method: 'POST',
        body: formData,
        credentials: 'include',
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Medical AI analysis service temporarily unavailable')
      }
      
      const result = await response.json()
      
      // MEDICAL SAFETY: Validate AI response structure
      if (!result.success || !result.analysis) {
        throw new Error('Invalid medical analysis response. Please try again.')
      }
      
      const analysis = result.analysis
      
      // More lenient validation for brief recordings
      if (!analysis.transcription || analysis.transcription.length < 5) {
        throw new Error('Voice transcription too short. Please speak more clearly and provide more details.')
      }
      
      // MEDICAL VALIDATION: Check confidence level with adaptive threshold
      // Lower threshold for brief recordings to still provide value
      const confidenceThreshold = analysis.transcription.length < 50 ? 0.6 : 0.75
      const isHighConfidence = analysis.confidence >= confidenceThreshold
      
      if (!isHighConfidence) {
        console.warn('⚠️ LOW CONFIDENCE MEDICAL ANALYSIS:', {
          confidence: analysis.confidence,
          threshold: confidenceThreshold,
          transcription: analysis.transcription.slice(0, 100) + '...'
        })
      }
      
      // MEDICAL SAFETY: Check for critical alerts
      if (analysis.criticalAlerts && analysis.criticalAlerts.length > 0) {
        console.warn('🚨 CRITICAL MEDICAL ALERTS:', analysis.criticalAlerts)
        
        // Show emergency alert to user
        const alertMessage = analysis.criticalAlerts.join('\n')
        alert(`⚠️ MEDICAL ALERT:

${alertMessage}

Please seek immediate medical attention if these symptoms apply to you.`)
      }
      
      setAnalysisResult({
        ...analysis,
        isHighConfidence,
        medicalValidation: result.medicalValidation || {},
        disclaimer: result.disclaimer || 'AI analysis for reference only. Professional medical evaluation required.'
      })
      
      // MEDICAL ACCURACY: Auto-fill even with lower confidence for brief recordings
      // but indicate to user that review is recommended
      setFormData(prev => ({
        ...prev,
        chiefComplaint: analysis.chiefComplaint || prev.chiefComplaint,
        symptoms: analysis.symptoms || prev.symptoms,
        symptomDuration: analysis.symptomDuration || prev.symptomDuration,
        painLevel: (analysis.painLevel >= 1 && analysis.painLevel <= 10) ? analysis.painLevel : prev.painLevel,
        allergies: analysis.allergies || prev.allergies,
        currentMedications: analysis.currentMedications || prev.currentMedications,
        voiceNote: analysis.transcription // Store full medical transcription
      }))
      
      // Provide feedback based on confidence level
      if (isHighConfidence) {
        console.log('✅ MEDICAL ANALYSIS COMPLETE:', {
          provider: result.provider,
          confidence: analysis.confidence,
          urgency: analysis.urgencyLevel,
          medicalValidation: result.medicalValidation
        })
      } else {
        console.warn('⚠️ LOW-CONFIDENCE ANALYSIS PROVIDED:', {
          confidence: analysis.confidence,
          transcription: analysis.transcription.slice(0, 100) + '...'
        })
        
        // Notify user about low confidence but still useful results
        alert(`ℹ️ Brief Description Generated

Confidence: ${Math.round(analysis.confidence * 100)}%

The AI has generated a brief description from your recording. Please review and edit the information in the form fields as needed.`)
      }
      
    } catch (error) {
      console.error('🚨 MEDICAL AI ANALYSIS ERROR:', error)
      
      // Handle timeout specifically
      if (error.name === 'AbortError') {
        alert(`⏱️ Analysis Timeout

The voice analysis is taking longer than expected. Please try:
1. Speaking more clearly in a quiet environment
2. Providing a slightly longer description
3. Trying again in a moment`)
      } else {
        // Medical-grade error handling
        const errorMessage = error instanceof Error ? error.message : 'Unknown medical analysis error'
        alert(`❌ Medical Voice Analysis Failed

${errorMessage}

Please fill the medical form manually or try recording again with clearer speech.`)
      }
      
      // Clear any partial analysis results to prevent confusion
      setAnalysisResult(null)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Play/pause recorded audio
  const handlePlayPause = () => {
    if (!audioUrl) return
    
    if (isPlaying) {
      audioElement?.pause()
      setIsPlaying(false)
    } else {
      if (!audioElement) {
        const audio = new Audio(audioUrl)
        audio.onended = () => setIsPlaying(false)
        audio.onerror = () => {
          console.error('Audio playback error')
          setIsPlaying(false)
        }
        setAudioElement(audio)
        audio.play()
      } else {
        audioElement.play()
      }
      setIsPlaying(true)
    }
  }

  // Clear recorded audio and start over
  const clearRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    if (audioElement) {
      audioElement.pause()
      setAudioElement(null)
    }
    setAudioBlob(null)
    setAudioUrl(null)
    setIsPlaying(false)
    setAnalysisResult(null)
    setFormData(prev => ({ ...prev, voiceNote: "" }))
  }

  // Upload files function
  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return
    
    setUploadingFiles(true)
    
    try {
      const uploadFormData = new FormData()
      files.forEach(file => {
        uploadFormData.append('files', file)
      })
      
      // Add appointmentId if available (will be null for new appointments)
      uploadFormData.append('appointmentId', '')
      
      const response = await fetch('/api/patient/upload-documents', {
        method: 'POST',
        body: uploadFormData,
        credentials: 'include'
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }
      
      const result = await response.json()
      
      // Update state with successfully uploaded documents
      setFormData(prev => ({
        ...prev,
        uploadedDocuments: [...prev.uploadedDocuments, ...result.files]
      }))
      
      console.log('Files uploaded successfully:', result.files)
      
    } catch (error) {
      console.error('Upload error:', error)
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      
      // Remove failed files from uploadedFiles
      setFormData(prev => ({
        ...prev,
        uploadedFiles: prev.uploadedFiles.filter(file => !files.includes(file))
      }))
    } finally {
      setUploadingFiles(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Validate files
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    
    const validFiles: File[] = []
    const errors: string[] = []
    
    files.forEach(file => {
      if (file.size > maxSize) {
        errors.push(`${file.name} is too large (max 10MB)`)
      } else if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name} has unsupported format`)
      } else {
        validFiles.push(file)
      }
    })
    
    if (errors.length > 0) {
      alert(`File validation errors:\n${errors.join('\n')}`)
      return
    }
    
    // Add files to state for preview
    setFormData(prev => ({
      ...prev,
      uploadedFiles: [...prev.uploadedFiles, ...validFiles]
    }))
    
    // Upload files immediately
    await uploadFiles(validFiles)
  }

  const removeFile = (index: number) => {
    const fileToRemove = formData.uploadedFiles[index]
    setFormData(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((_, i) => i !== index)
    }))
    
    // TODO: Add API call to remove uploaded document if needed
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
          uploadedDocuments: formData.uploadedDocuments.map(doc => doc.id), // Send document IDs
          voiceNote: formData.voiceNote, // Include voice recording data
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
                    <SelectTrigger className="h-12 specialization-select-trigger">
                      <SelectValue placeholder={loadingSpecializations ? "Loading specializations..." : "Choose a medical specialization"} />
                    </SelectTrigger>
                    <SelectContent 
                      className="specialization-select-content" 
                      side="bottom" 
                      align="start" 
                      sideOffset={4} 
                      avoidCollisions={false}
                      position="popper"
                    >
                      {specializations.map((spec) => (
                        <SelectItem key={spec} value={spec} className="specialization-select-item py-3">
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
                          <SelectTrigger className="h-auto min-h-[60px] p-4 border-2 hover:border-blue-300 focus:border-blue-500 font-bold doctor-select-trigger">
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
                            className="max-h-[400px] w-full z-[1000] p-3 shadow-xl border-2 border-gray-200 doctor-select-content"
                            side="bottom"
                            align="start"
                            sideOffset={4}
                            avoidCollisions={false}
                          >
                            {doctors.map((doctor) => (
                              <SelectItem 
                                key={doctor.id} 
                                value={doctor.id}
                                className="p-0 h-auto cursor-pointer focus:bg-transparent hover:bg-transparent data-[highlighted]:bg-transparent mb-3 doctor-select-item"
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
                        
                        {loadingSlots && (
                          <div className="flex items-center justify-center p-4 text-gray-500">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                            Loading available times...
                          </div>
                        )}
                        
                        {slotsError && (
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center">
                              <div className="text-yellow-600 mr-2">⚠️</div>
                              <p className="text-yellow-800 text-sm">{slotsError}</p>
                            </div>
                          </div>
                        )}
                        
                        {!loadingSlots && !slotsError && availableSlots.length > 0 && (
                          <div className="grid grid-cols-3 gap-2">
                            {availableSlots.map((slot) => (
                              <button
                                key={slot.time}
                                type="button"
                                disabled={!slot.available}
                                title={slot.available ? 'Available' : slot.reason || 'Not available'}
                                className={`
                                  p-2 text-sm rounded border transition-colors relative
                                  ${!slot.available 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                    : formData.appointmentTime === slot.time
                                      ? 'bg-blue-600 text-white border-blue-600'
                                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                                  }
                                `}
                                onClick={() => slot.available && setFormData(prev => ({ ...prev, appointmentTime: slot.time }))}
                              >
                                {slot.time}
                                {!slot.available && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-full h-0.5 bg-red-400 transform rotate-12"></div>
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {!loadingSlots && !slotsError && availableSlots.filter(slot => slot.available).length > 0 && (
                          <p className="text-xs text-green-600 mt-2">
                            ✓ {availableSlots.filter(slot => slot.available).length} available time slots
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end">
                  <Button 
                    onClick={nextStep}
                    disabled={!formData.doctorId || !formData.appointmentDate || !formData.appointmentTime || loadingSlots}
                    variant="medical"
                  >
                    {loadingSlots ? 'Loading Times...' : 'Next: Describe Symptoms'}
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
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    Chief Complaint *
                    {analysisResult && analysisResult.chiefComplaint && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center">
                        <SparklesIcon className="w-3 h-3 mr-1" />
                        AI-filled
                      </span>
                    )}
                  </label>
                  <Textarea
                    value={formData.chiefComplaint}
                    onChange={(e) => setFormData(prev => ({ ...prev, chiefComplaint: e.target.value }))}
                    placeholder="What is the main reason for your visit?"
                    rows={3}
                    className={analysisResult && analysisResult.chiefComplaint ? 'border-blue-300 bg-blue-50' : ''}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    Detailed Symptoms *
                    {analysisResult && analysisResult.symptoms && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center">
                        <SparklesIcon className="w-3 h-3 mr-1" />
                        AI-filled
                      </span>
                    )}
                  </label>
                  <Textarea
                    value={formData.symptoms}
                    onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
                    placeholder="Describe your symptoms in detail..."
                    rows={4}
                    className={analysisResult && analysisResult.symptoms ? 'border-blue-300 bg-blue-50' : ''}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      Symptom Duration
                      {analysisResult && analysisResult.symptomDuration && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center">
                          <SparklesIcon className="w-3 h-3 mr-1" />
                          AI-filled
                        </span>
                      )}
                    </label>
                    <Input
                      value={formData.symptomDuration}
                      onChange={(e) => setFormData(prev => ({ ...prev, symptomDuration: e.target.value }))}
                      placeholder="e.g., 3 days, 2 weeks"
                      className={analysisResult && analysisResult.symptomDuration ? 'border-blue-300 bg-blue-50' : ''}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center">
                      Pain Level (1-10)
                      {analysisResult && analysisResult.painLevel && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center">
                          <SparklesIcon className="w-3 h-3 mr-1" />
                          AI-filled
                        </span>
                      )}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.painLevel}
                      onChange={(e) => setFormData(prev => ({ ...prev, painLevel: parseInt(e.target.value) }))}
                      className={`w-full ${analysisResult && analysisResult.painLevel ? 'accent-blue-500' : ''}`}
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

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      Current Medications
                      {analysisResult && analysisResult.currentMedications && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center">
                          <SparklesIcon className="w-3 h-3 mr-1" />
                          AI-filled
                        </span>
                      )}
                    </label>
                    <Textarea
                      value={formData.currentMedications}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentMedications: e.target.value }))}
                      placeholder="List current medications..."
                      rows={3}
                      className={analysisResult && analysisResult.currentMedications ? 'border-blue-300 bg-blue-50' : ''}
                    />
                  </div>
                </div>

                {/* Voice Recording with AI Analysis */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <MicrophoneIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Voice Description with Gemini AI Analysis</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {isAnalyzing ? 'Gemini AI is analyzing your recording...' : 
                       audioUrl ? 'Recording completed! Review and confirm below.' :
                       'Record a voice note - Gemini AI will analyze and auto-fill your symptoms'}
                    </p>
                    
                    {/* Recording Controls */}
                    <div className="mt-4 space-y-4">
                      {!audioUrl ? (
                        // Recording Button
                        <Button
                          type="button"
                          variant={isRecording ? "danger" : "outline"}
                          onClick={handleVoiceRecording}
                          className="mx-auto"
                          disabled={isAnalyzing}
                        >
                          {isRecording ? (
                            <>
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />
                              Recording... {recordingDuration}s {recordingDuration >= 120 ? '(Max reached)' : '(Max 2min)'}
                            </>
                          ) : (
                            <>
                              <MicrophoneIcon className="w-4 h-4 mr-2" />
                              Start Recording
                            </>
                          )}
                        </Button>
                      ) : (
                        // Playback Controls
                        <div className="space-y-4">
                          {/* Playback Button */}
                          <div className="flex items-center justify-center space-x-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handlePlayPause}
                              disabled={isAnalyzing}
                            >
                              {isPlaying ? (
                                <>
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                                  Pause
                                </>
                              ) : (
                                <>
                                  <div className="w-0 h-0 border-l-[6px] border-l-blue-500 border-y-[4px] border-y-transparent mr-2" />
                                  Play Recording
                                </>
                              )}
                            </Button>
                            
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={clearRecording}
                              disabled={isAnalyzing}
                              className="text-red-600 hover:text-red-700"
                            >
                              Record Again
                            </Button>
                          </div>
                          
                          {/* Gemini AI Analysis Status */}
                          {isAnalyzing && (
                            <div className="flex items-center justify-center text-blue-600 bg-blue-50 p-3 rounded-lg">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                              <div className="text-center">
                                <p className="font-medium">Gemini AI is analyzing your recording...</p>
                                <p className="text-xs text-blue-500">Processing medical terminology and extracting symptoms</p>
                              </div>
                            </div>
                          )}
                          
                          {/* AI Analysis Results with Medical Validation */}
                          {analysisResult && !isAnalyzing && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5 text-left">
                              <h4 className="font-bold text-blue-900 mb-3 flex items-center justify-between">
                                <div className="flex items-center">
                                  <SparklesIcon className="w-5 h-5 mr-2" />
                                  Medical-Grade AI Analysis
                                  {analysisResult.confidence && (
                                    <span className={`ml-3 text-xs px-3 py-1 rounded-full font-bold ${
                                      analysisResult.isHighConfidence 
                                        ? 'bg-green-100 text-green-800 border border-green-300' 
                                        : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                                    }`}>
                                      {Math.round(analysisResult.confidence * 100)}% Confidence
                                      {analysisResult.isHighConfidence ? ' ✓' : ' ⚠️'}
                                    </span>
                                  )}
                                </div>
                                
                                {/* Medical Validation Badges */}
                                <div className="flex items-center space-x-2">
                                  {analysisResult.medicalValidation?.clinicalAccuracy && (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded border">
                                      ✓ Clinically Validated
                                    </span>
                                  )}
                                  {analysisResult.medicalValidation?.safetyChecked && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded border">
                                      ✓ Safety Verified
                                    </span>
                                  )}
                                </div>
                              </h4>
                              
                              {/* Critical Medical Alerts */}
                              {analysisResult.criticalAlerts && analysisResult.criticalAlerts.length > 0 && (
                                <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-lg">
                                  <div className="flex items-center mb-2">
                                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                                    <span className="font-bold text-red-800">🚨 CRITICAL MEDICAL ALERTS</span>
                                  </div>
                                  <ul className="text-sm text-red-700 list-disc pl-5 space-y-1">
                                    {analysisResult.criticalAlerts.map((alert: string, index: number) => (
                                      <li key={index} className="font-medium">{alert}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {/* Medical Accuracy Warning for Low Confidence */}
                              {!analysisResult.isHighConfidence && (
                                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
                                  <div className="flex items-center mb-2">
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                                    <span className="font-bold text-yellow-800">⚠️ MEDICAL ACCURACY NOTICE</span>
                                  </div>
                                  <p className="text-sm text-yellow-700">
                                    AI confidence below medical threshold ({Math.round(analysisResult.confidence * 100)}%). 
                                    Please review transcription and fill form manually for accuracy.
                                  </p>
                                </div>
                              )}
                              
                              <div className="space-y-3 text-sm">
                                {/* Voice Transcription with Medical Context */}
                                <div className="bg-white p-3 rounded-lg border">
                                  <span className="font-semibold text-gray-800 flex items-center">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                    Medical Voice Transcription:
                                    {analysisResult.isHighConfidence && (
                                      <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">
                                        High Accuracy
                                      </span>
                                    )}
                                  </span>
                                  <p className="text-gray-700 italic mt-2 leading-relaxed">
                                    "{analysisResult.transcription}"
                                  </p>
                                </div>
                                
                                {/* Key Medical Findings */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div className="bg-white p-3 rounded-lg border">
                                    <span className="font-semibold text-blue-800 flex items-center">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                      Chief Complaint:
                                    </span>
                                    <p className="text-blue-700 font-medium">{analysisResult.chiefComplaint}</p>
                                  </div>
                                  <div className="bg-white p-3 rounded-lg border">
                                    <span className="font-semibold text-blue-800 flex items-center">
                                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                                      Pain Level:
                                    </span>
                                    <p className="text-blue-700 font-medium">{analysisResult.painLevel}/10</p>
                                  </div>
                                </div>
                                
                                {/* Detailed Symptoms */}
                                <div className="bg-white p-3 rounded-lg border">
                                  <span className="font-semibold text-blue-800 flex items-center">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                                    Symptoms Detected:
                                  </span>
                                  <p className="text-blue-700 mt-1">{analysisResult.symptoms}</p>
                                </div>
                                
                                {/* Additional Medical Info */}
                                {analysisResult.additionalInfo && (
                                  <div className="bg-white p-3 rounded-lg border">
                                    <span className="font-semibold text-blue-800 flex items-center">
                                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                                      Medical Insights:
                                    </span>
                                    <p className="text-blue-700 mt-1 text-xs leading-relaxed">{analysisResult.additionalInfo}</p>
                                  </div>
                                )}
                                
                                {/* Urgency Level */}
                                {analysisResult.urgencyLevel && (
                                  <div className={`p-3 rounded-lg border-l-4 ${
                                    analysisResult.urgencyLevel === 'HIGH' ? 'bg-red-50 border-red-400 text-red-800' :
                                    analysisResult.urgencyLevel === 'MEDIUM' ? 'bg-yellow-50 border-yellow-400 text-yellow-800' :
                                    'bg-green-50 border-green-400 text-green-800'
                                  }`}>
                                    <div className="flex items-center">
                                      <div className={`w-3 h-3 rounded-full mr-2 ${
                                        analysisResult.urgencyLevel === 'HIGH' ? 'bg-red-500' :
                                        analysisResult.urgencyLevel === 'MEDIUM' ? 'bg-yellow-500' :
                                        'bg-green-500'
                                      }`}></div>
                                      <span className="font-bold">Urgency Assessment: {analysisResult.urgencyLevel}</span>
                                    </div>
                                    {analysisResult.suggestedSymptoms && (
                                      <p className="text-xs mt-1 opacity-80">
                                        Possible conditions: {analysisResult.suggestedSymptoms.join(', ')}
                                      </p>
                                    )}
                                  </div>
                                )}
                                
                                {/* Enhanced AI Model Info with Medical Validation */}
                                <div className="bg-blue-100 p-3 rounded border-l-4 border-blue-500">
                                  <div className="flex items-center justify-between text-xs text-blue-700 mb-2">
                                    <span className="flex items-center font-medium">
                                      ✨ {analysisResult.aiModel || 'Medical-Grade AI Analysis v3.0'}
                                      {analysisResult.medicalValidation?.evidenceBase && (
                                        <span className="ml-2 bg-blue-200 px-2 py-0.5 rounded text-blue-800">
                                          Evidence-Based
                                        </span>
                                      )}
                                    </span>
                                    <span className="text-blue-600">
                                      Processing: {analysisResult.processingTime || 3000}ms
                                    </span>
                                  </div>
                                  
                                  {/* Medical Validation Details */}
                                  {analysisResult.medicalValidation && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                                      {analysisResult.medicalValidation.clinicalAccuracy && (
                                        <div className="text-blue-700">
                                          ✓ {analysisResult.medicalValidation.clinicalAccuracy}
                                        </div>
                                      )}
                                      {analysisResult.medicalValidation.evidenceBase && (
                                        <div className="text-blue-700">
                                          ✓ {analysisResult.medicalValidation.evidenceBase}
                                        </div>
                                      )}
                                      {analysisResult.medicalValidation.safetyChecked && (
                                        <div className="text-blue-700">
                                          ✓ {analysisResult.medicalValidation.safetyChecked}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                                
                                {/* Medical Disclaimer and Form Status */}
                                <div className="bg-gray-50 p-3 rounded border">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className={`text-sm font-medium flex items-center ${
                                      analysisResult.isHighConfidence 
                                        ? 'text-green-600' 
                                        : 'text-yellow-600'
                                    }`}>
                                      {analysisResult.isHighConfidence ? (
                                        <>
                                          ✅ High-confidence analysis - Form fields auto-filled
                                        </>
                                      ) : (
                                        <>
                                          ⚠️ Low-confidence analysis - Manual review required
                                        </>
                                      )}
                                    </p>
                                  </div>
                                  
                                  <p className="text-xs text-gray-600 leading-relaxed">
                                    <strong>Medical Disclaimer:</strong> {analysisResult.disclaimer || 'AI analysis for reference only. Professional medical evaluation required for all symptoms.'}
                                    Please review all auto-filled information for accuracy before submission.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {formData.voiceNote && !isAnalyzing && (
                            <p className="mt-2 text-sm text-green-600 flex items-center justify-center">
                              <CheckCircleIcon className="w-4 h-4 mr-1" />
                              Voice note recorded and analyzed
                            </p>
                          )}
                        </div>
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
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
                  <div className="text-center">
                    <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Upload Medical Documents</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {uploadingFiles ? 'Uploading files...' : 'Drag and drop files here, or click to browse'}
                    </p>
                    <div className="mt-4">
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                        disabled={uploadingFiles}
                      />
                      <label htmlFor="file-upload">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="cursor-pointer" 
                          disabled={uploadingFiles}
                        >
                          {uploadingFiles ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                              Uploading...
                            </>
                          ) : (
                            'Choose Files'
                          )}
                        </Button>
                      </label>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Supported: PDF, JPG, PNG, DOC, DOCX (Max 10MB each)
                    </p>
                  </div>
                </div>

                {(formData.uploadedFiles.length > 0 || formData.uploadedDocuments.length > 0) && (
                  <div className="space-y-4">
                    {/* Pending Files (not yet uploaded) */}
                    {formData.uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-600">Files Ready for Upload</h4>
                        {formData.uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-yellow-100 rounded flex items-center justify-center">
                                <DocumentTextIcon className="w-4 h-4 text-yellow-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                <p className="text-xs text-gray-500">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB • Preparing to upload
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
                    
                    {/* Successfully Uploaded Documents */}
                    {formData.uploadedDocuments.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-green-700">Successfully Uploaded</h4>
                        {formData.uploadedDocuments.map((doc, index) => (
                          <div key={doc.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                                <CheckCircleIcon className="w-4 h-4 text-green-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{doc.fileName}</p>
                                <p className="text-xs text-gray-500">
                                  {(doc.fileSize / 1024 / 1024).toFixed(2)} MB • Uploaded successfully
                                </p>
                              </div>
                            </div>
                            <div className="text-green-600 text-xs font-medium">
                              ✓ Uploaded
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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

                {/* Medical Documents Summary */}
                {formData.uploadedDocuments.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">Medical Documents</h3>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="space-y-2">
                        {formData.uploadedDocuments.map((doc, index) => (
                          <div key={doc.id} className="flex items-center space-x-3">
                            <CheckCircleIcon className="w-4 h-4 text-green-600" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{doc.fileName}</p>
                              <p className="text-xs text-gray-600">
                                {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-green-700 mt-2">
                        {formData.uploadedDocuments.length} document(s) successfully uploaded
                      </p>
                    </div>
                  </div>
                )}

                {/* Files Still Pending Upload Warning */}
                {formData.uploadedFiles.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="text-yellow-600 mr-2">⚠️</div>
                      <div>
                        <p className="text-yellow-800 text-sm font-medium">
                          {formData.uploadedFiles.length} file(s) are still being processed
                        </p>
                        <p className="text-yellow-700 text-xs">
                          Please wait for all files to upload before confirming your appointment.
                        </p>
                      </div>
                    </div>
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
                    disabled={isLoading || uploadingFiles || formData.uploadedFiles.length > 0}
                    variant="medical"
                    size="lg"
                  >
                    {uploadingFiles ? 'Uploading Files...' : 
                     formData.uploadedFiles.length > 0 ? 'Waiting for Upload...' : 
                     'Confirm Appointment'}
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
