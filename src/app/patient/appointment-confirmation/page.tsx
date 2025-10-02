"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  CheckCircleIcon, 
  CalendarIcon, 
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  ShareIcon,
  PrinterIcon
} from "@heroicons/react/24/outline"
import { motion } from "framer-motion"

export default function AppointmentConfirmationPage() {
  const searchParams = useSearchParams()
  const referenceId = searchParams.get("ref")

  // Mock appointment data - in real app, fetch from API using reference ID
  const appointmentData = {
    referenceId: referenceId || "REF-ABC123",
    doctorName: "Dr. Sarah Johnson",
    specialization: "Cardiology",
    date: "2024-10-15",
    time: "10:30 AM",
    consultationFee: 150,
    status: "CONFIRMED",
    estimatedDuration: "30 minutes",
    location: "MediAssist Clinic - Room 205",
    instructions: [
      "Please arrive 15 minutes before your appointment time",
      "Bring a valid ID and insurance card",
      "Fast for 8 hours if blood tests are required",
      "Bring any current medications you are taking"
    ]
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MediAssist AI Appointment Confirmation',
          text: `Appointment confirmed with ${appointmentData.doctorName} on ${appointmentData.date} at ${appointmentData.time}. Reference: ${appointmentData.referenceId}`,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(
        `Appointment confirmed with ${appointmentData.doctorName} on ${appointmentData.date} at ${appointmentData.time}. Reference: ${appointmentData.referenceId}`
      )
      alert('Appointment details copied to clipboard!')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
            <CheckCircleIcon className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Appointment Confirmed!
          </h1>
          <p className="text-lg text-gray-600">
            Your appointment has been successfully booked
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="mb-6">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-t-lg">
              <CardTitle className="text-xl">Appointment Details</CardTitle>
              <CardDescription className="text-blue-100">
                Reference ID: {appointmentData.referenceId}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Doctor Information */}
              <div className="flex items-start space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                  <UserIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{appointmentData.doctorName}</h3>
                  <p className="text-gray-600">{appointmentData.specialization}</p>
                  <p className="text-sm text-gray-500">{appointmentData.location}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${appointmentData.consultationFee}</p>
                  <p className="text-sm text-gray-500">Consultation Fee</p>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Date</p>
                    <p className="text-gray-600">
                      {new Date(appointmentData.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <ClockIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Time</p>
                    <p className="text-gray-600">
                      {appointmentData.time} ({appointmentData.estimatedDuration})
                    </p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-center p-3 bg-green-50 rounded-lg">
                <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-medium text-green-800">
                  Status: {appointmentData.status}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5" />
                Important Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {appointmentData.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">{instruction}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <Button
              variant="outline"
              onClick={handleShare}
              className="flex items-center justify-center gap-2"
            >
              <ShareIcon className="w-4 h-4" />
              Share Details
            </Button>
            <Button
              variant="outline"
              onClick={handlePrint}
              className="flex items-center justify-center gap-2"
            >
              <PrinterIcon className="w-4 h-4" />
              Print Confirmation
            </Button>
          </div>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-blue-600">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">AI Analysis in Progress</p>
                  <p className="text-sm text-gray-600">
                    Our AI is analyzing your symptoms and will prepare a preliminary summary for your doctor.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-blue-600">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Appointment Reminder</p>
                  <p className="text-sm text-gray-600">
                    You'll receive email and SMS reminders 24 hours and 2 hours before your appointment.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-blue-600">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Doctor Consultation</p>
                  <p className="text-sm text-gray-600">
                    Your doctor will review the AI summary and provide personalized care during your visit.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button asChild variant="medical" className="flex-1">
              <Link href="/patient/appointments">
                View My Appointments
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/patient/book">
                Book Another Appointment
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
