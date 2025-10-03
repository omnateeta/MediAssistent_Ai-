"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  DocumentTextIcon, 
  MagnifyingGlassIcon,
  CalendarIcon,
  UserIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  ArrowDownTrayIcon, // Use this as the download icon
  ShareIcon,
  PrinterIcon
} from "@heroicons/react/24/outline"
import { motion } from "framer-motion"

interface Prescription {
  id: string
  referenceId: string
  doctorName: string
  specialization: string
  issuedDate: string
  status: string
  medications: {
    name: string
    dosage: string
    frequency: string
    duration: string
  }[]
  instructions: string
  appointmentDate: string
}

export default function PatientPrescriptionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])

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

  // Mock data - in real app, fetch from API
  useEffect(() => {
    const mockPrescriptions: Prescription[] = [
      {
        id: "1",
        referenceId: "REF-DEF456",
        doctorName: "Dr. Michael Chen",
        specialization: "General Practice",
        issuedDate: "2024-10-10",
        status: "ACTIVE",
        appointmentDate: "2024-10-10",
        medications: [
          {
            name: "Lisinopril",
            dosage: "10mg",
            frequency: "Once daily",
            duration: "30 days"
          },
          {
            name: "Metformin",
            dosage: "500mg",
            frequency: "Twice daily with meals",
            duration: "30 days"
          }
        ],
        instructions: "Take medications as prescribed. Monitor blood pressure daily. Follow up in 4 weeks."
      },
      {
        id: "2",
        referenceId: "REF-GHI789",
        doctorName: "Dr. Emily Rodriguez",
        specialization: "Dermatology",
        issuedDate: "2024-09-28",
        status: "COMPLETED",
        appointmentDate: "2024-09-28",
        medications: [
          {
            name: "Hydrocortisone Cream",
            dosage: "1%",
            frequency: "Apply twice daily",
            duration: "14 days"
          }
        ],
        instructions: "Apply cream to affected areas only. Avoid contact with eyes. Discontinue if irritation worsens."
      },
      {
        id: "3",
        referenceId: "REF-MNO345",
        doctorName: "Dr. Sarah Johnson",
        specialization: "Cardiology",
        issuedDate: "2024-08-15",
        status: "EXPIRED",
        appointmentDate: "2024-08-15",
        medications: [
          {
            name: "Atorvastatin",
            dosage: "20mg",
            frequency: "Once daily at bedtime",
            duration: "90 days"
          }
        ],
        instructions: "Take with or without food. Avoid grapefruit juice. Regular liver function tests required."
      }
    ]

    setPrescriptions(mockPrescriptions)
  }, [])

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = 
      prescription.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prescription.referenceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prescription.medications.some(med => 
        med.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    
    const matchesFilter = 
      selectedFilter === "all" ||
      (selectedFilter === "active" && prescription.status === "ACTIVE") ||
      (selectedFilter === "completed" && prescription.status === "COMPLETED") ||
      (selectedFilter === "expired" && prescription.status === "EXPIRED")
    
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "text-green-600 bg-green-50 border-green-200"
      case "COMPLETED":
        return "text-blue-600 bg-blue-50 border-blue-200"
      case "EXPIRED":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircleIcon className="w-4 h-4 text-green-600" />
      case "COMPLETED":
        return <CheckCircleIcon className="w-4 h-4 text-blue-600" />
      case "EXPIRED":
        return <ClockIcon className="w-4 h-4 text-red-600" />
      default:
        return <ClockIcon className="w-4 h-4 text-gray-600" />
    }
  }

  const handleDownload = (prescriptionId: string) => {
    // Mock download functionality
    console.log(`Downloading prescription ${prescriptionId}`)
    alert("Download functionality would be implemented here")
  }

  const handleShare = (prescriptionId: string) => {
    // Mock share functionality
    console.log(`Sharing prescription ${prescriptionId}`)
    alert("Share functionality would be implemented here")
  }

  const handlePrint = (prescriptionId: string) => {
    // Mock print functionality
    console.log(`Printing prescription ${prescriptionId}`)
    window.print()
  }

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Prescriptions
            </h1>
            <p className="text-gray-600">
              View and manage your digital prescriptions
            </p>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Total Prescriptions",
              value: prescriptions.length,
              icon: DocumentTextIcon,
              color: "text-blue-600 bg-blue-50"
            },
            {
              title: "Active",
              value: prescriptions.filter(p => p.status === "ACTIVE").length,
              icon: CheckCircleIcon,
              color: "text-green-600 bg-green-50"
            },
            {
              title: "Completed",
              value: prescriptions.filter(p => p.status === "COMPLETED").length,
              icon: CheckCircleIcon,
              color: "text-blue-600 bg-blue-50"
            },
            {
              title: "Expired",
              value: prescriptions.filter(p => p.status === "EXPIRED").length,
              icon: ClockIcon,
              color: "text-red-600 bg-red-50"
            }
          ].map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${stat.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Prescription History</CardTitle>
            <CardDescription>
              Search and manage your prescriptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search prescriptions, medications, or doctors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                {[
                  { key: "all", label: "All" },
                  { key: "active", label: "Active" },
                  { key: "completed", label: "Completed" },
                  { key: "expired", label: "Expired" }
                ].map((filter) => (
                  <Button
                    key={filter.key}
                    variant={selectedFilter === filter.key ? "medical" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFilter(filter.key)}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Prescriptions List */}
            <div className="space-y-6">
              {filteredPrescriptions.map((prescription, index) => (
                <motion.div
                  key={prescription.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                        <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {prescription.doctorName}
                          </h3>
                          <span className={`flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(prescription.status)}`}>
                            {getStatusIcon(prescription.status)}
                            <span>{prescription.status}</span>
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{prescription.specialization}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <CalendarIcon className="w-4 h-4" />
                            <span>Issued: {prescription.issuedDate}</span>
                          </span>
                          <span>Ref: {prescription.referenceId}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(prescription.id)}
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(prescription.id)}
                      >
                        <ShareIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePrint(prescription.id)}
                      >
                        <PrinterIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link href={`/patient/prescriptions/${prescription.id}`}>
                          <EyeIcon className="w-4 h-4 mr-1" />
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {/* Medications */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-3">Prescribed Medications</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {prescription.medications.map((medication, medIndex) => (
                        <div key={medIndex} className="bg-gray-50 p-4 rounded-lg">
                          <h5 className="font-medium text-gray-900 mb-2">{medication.name}</h5>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p><span className="font-medium">Dosage:</span> {medication.dosage}</p>
                            <p><span className="font-medium">Frequency:</span> {medication.frequency}</p>
                            <p><span className="font-medium">Duration:</span> {medication.duration}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Doctor's Instructions</h4>
                    <p className="text-sm text-blue-800">{prescription.instructions}</p>
                  </div>
                </motion.div>
              ))}
              
              {filteredPrescriptions.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No prescriptions found</p>
                  <p className="mb-4">
                    {searchQuery || selectedFilter !== "all" 
                      ? "Try adjusting your search or filter criteria."
                      : "You don't have any prescriptions yet."
                    }
                  </p>
                  <Button variant="medical" asChild>
                    <Link href="/patient/book">
                      Book an appointment to get started
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
