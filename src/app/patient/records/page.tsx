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
  EyeIcon,
  ArrowDownTrayIcon,
  FolderIcon,
  HeartIcon,
  BeakerIcon,
  CameraIcon
} from "@heroicons/react/24/outline"
import { motion } from "framer-motion"

interface MedicalRecord {
  id: string
  title: string
  recordType: string
  recordDate: string
  description: string
  attachments: string[]
  createdBy?: string
  recordData?: {
    appointmentId?: string
    referenceId?: string
    doctorName?: string
    specialization?: string
    aiSummaryId?: string
    prescriptionId?: string
    urgencyLevel?: string
    confidenceScore?: number
  }
}

export default function PatientRecordsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [records, setRecords] = useState<MedicalRecord[]>([])


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

  // Mock data - in real app, fetch from API
  useEffect(() => {
    // Fetch medical records from API
    async function fetchRecords() {
      if (!session?.user?.id) return;
      try {
        const res = await fetch(`/api/patient/records?userId=${session.user.id}`);
        if (!res.ok) throw new Error("Failed to fetch records");
        const data = await res.json();
        setRecords(data.records || []);
      } catch (err) {
        console.error(err);
        setRecords([]);
      }
    }
    fetchRecords();
  }, [session])

  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (record.recordData?.doctorName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.recordType.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = 
      selectedFilter === "all" ||
      (selectedFilter === "diagnosis" && record.recordType === "DIAGNOSIS") ||
      (selectedFilter === "lab" && record.recordType === "LAB_RESULT") ||
      (selectedFilter === "consultation" && record.recordType === "CONSULTATION") ||
      (selectedFilter === "treatment" && record.recordType === "TREATMENT") ||
      (selectedFilter === "vaccination" && record.recordType === "VACCINATION")
    
    return matchesSearch && matchesFilter
  })

  const getRecordIcon = (recordType: string) => {
    switch (recordType) {
      case "DIAGNOSIS":
        return <HeartIcon className="w-5 h-5 text-green-600" />
      case "LAB_RESULT":
        return <BeakerIcon className="w-5 h-5 text-blue-600" />
      case "CONSULTATION":
        return <UserIcon className="w-5 h-5 text-purple-600" />
      case "TREATMENT":
        return <DocumentTextIcon className="w-5 h-5 text-orange-600" />
      case "VACCINATION":
        return <HeartIcon className="w-5 h-5 text-red-600" />
      default:
        return <FolderIcon className="w-5 h-5 text-gray-600" />
    }
  }

  const getRecordColor = (recordType: string) => {
    switch (recordType) {
      case "DIAGNOSIS":
        return "bg-green-50 border-green-200"
      case "LAB_RESULT":
        return "bg-blue-50 border-blue-200"
      case "CONSULTATION":
        return "bg-purple-50 border-purple-200"
      case "TREATMENT":
        return "bg-orange-50 border-orange-200"
      case "VACCINATION":
        return "bg-red-50 border-red-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
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
              Medical Records
            </h1>
            <p className="text-gray-600">
              Your complete medical history and documents
            </p>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          {[
            {
              title: "Total Records",
              value: records.length,
              icon: FolderIcon,
              color: "text-gray-600 bg-gray-50"
            },
            {
              title: "Diagnoses",
              value: records.filter(r => r.recordType === "DIAGNOSIS").length,
              icon: HeartIcon,
              color: "text-green-600 bg-green-50"
            },
            {
              title: "Lab Results",
              value: records.filter(r => r.recordType === "LAB_RESULT").length,
              icon: BeakerIcon,
              color: "text-blue-600 bg-blue-50"
            },
            {
              title: "Consultations",
              value: records.filter(r => r.recordType === "CONSULTATION").length,
              icon: UserIcon,
              color: "text-purple-600 bg-purple-50"
            },
            {
              title: "Treatments",
              value: records.filter(r => r.recordType === "TREATMENT").length,
              icon: DocumentTextIcon,
              color: "text-orange-600 bg-orange-50"
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
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`p-2 rounded-lg ${stat.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Generate Records from Appointments */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Generate Medical Records</CardTitle>
            <CardDescription>Create medical records from your completed appointments.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Button 
                variant="medical" 
                onClick={async () => {
                  if (!session?.user?.id) return;
                  try {
                    const res = await fetch('/api/patient/generate-records', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ userId: session.user.id })
                    });
                    if (!res.ok) throw new Error('Failed to generate records');
                    const data = await res.json();
                    // Refresh records list
                    const refreshRes = await fetch(`/api/patient/records?userId=${session.user.id}`);
                    if (refreshRes.ok) {
                      const refreshData = await refreshRes.json();
                      setRecords(refreshData.records || []);
                    }
                  } catch (e) {
                    console.error(e);
                  }
                }}
              >
                Generate from Appointments
              </Button>
              <p className="text-sm text-gray-600 flex items-center">
                This will create medical records from your completed appointments with AI summaries and prescriptions.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Medical History</CardTitle>
            <CardDescription>
              Search and filter your medical records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search records, doctors, or descriptions..."
                  autoComplete="off"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {[
                  { key: "all", label: "All" },
                  { key: "diagnosis", label: "Diagnoses" },
                  { key: "lab", label: "Lab Results" },
                  { key: "consultation", label: "Consultations" },
                  { key: "treatment", label: "Treatments" },
                  { key: "vaccination", label: "Vaccinations" }
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

            {/* Records List */}
            <div className="space-y-4">
              {filteredRecords.map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`border rounded-lg p-6 hover:shadow-md transition-shadow ${getRecordColor(record.recordType)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg border">
                        {getRecordIcon(record.recordType)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {record.title}
                          </h3>
                          <span className="px-2 py-1 text-xs font-medium bg-white rounded-full border">
                            {record.recordType.replace('_', ' ')}
                          </span>
                          {record.recordData?.urgencyLevel && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              record.recordData.urgencyLevel === 'HIGH' ? 'bg-red-100 text-red-800' :
                              record.recordData.urgencyLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {record.recordData.urgencyLevel} PRIORITY
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center space-x-1">
                            <CalendarIcon className="w-4 h-4" />
                            <span>{new Date(record.recordDate).toLocaleDateString()}</span>
                          </span>
                          {record.recordData?.doctorName && (
                            <span className="flex items-center space-x-1">
                              <UserIcon className="w-4 h-4" />
                              <span>{record.recordData.doctorName}</span>
                            </span>
                          )}
                          {record.recordData?.specialization && (
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                              {Array.isArray(record.recordData.specialization) 
                                ? record.recordData.specialization[0] 
                                : record.recordData.specialization}
                            </span>
                          )}
                        </div>
                        
                        {/* Appointment Connection */}
                        {record.recordData?.appointmentId && (
                          <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center space-x-2 text-sm">
                              <CalendarIcon className="w-4 h-4 text-blue-600" />
                              <span className="text-blue-800 font-medium">Generated from Appointment</span>
                              {record.recordData.referenceId && (
                                <span className="text-blue-600">#{record.recordData.referenceId}</span>
                              )}
                            </div>
                            {record.recordData.confidenceScore && (
                              <div className="mt-1 text-xs text-blue-700">
                                AI Confidence: {Math.round(record.recordData.confidenceScore * 100)}%
                              </div>
                            )}
                          </div>
                        )}
                        
                        <p className="text-sm text-gray-700 mb-4">
                          {record.description}
                        </p>

                        {/* Attachments */}
                        {record.attachments.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-gray-600">Attachments:</span>
                            <div className="flex space-x-2">
                              {record.attachments.map((attachment, attIndex) => (
                                <span
                                  key={attIndex}
                                  className="inline-flex items-center space-x-1 px-2 py-1 text-xs bg-white rounded border"
                                >
                                  {attachment.includes('.pdf') ? (
                                    <DocumentTextIcon className="w-3 h-3" />
                                  ) : (
                                    <CameraIcon className="w-3 h-3" />
                                  )}
                                  <span>{attachment}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {record.recordData?.appointmentId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <Link href={`/patient/appointments/${record.recordData.appointmentId}`}>
                            <CalendarIcon className="w-4 h-4 mr-1" />
                            View Appointment
                          </Link>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => console.log(`Download record ${record.id}`)}
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link href={`/patient/records/${record.id}`}>
                          <EyeIcon className="w-4 h-4 mr-1" />
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {filteredRecords.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <FolderIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No records found</p>
                  <p className="mb-4">
                    {searchQuery || selectedFilter !== "all" 
                      ? "Try adjusting your search or filter criteria."
                      : "Your medical records will appear here as you visit doctors."
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
