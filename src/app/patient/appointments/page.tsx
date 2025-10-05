"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  CalendarIcon, 
  ClockIcon, 
  UserIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  EyeIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline"
import { motion } from "framer-motion"

interface Appointment {
  id: string
  referenceId: string
  doctorName: string
  specialization: string
  scheduledDate: string
  scheduledTime: string
  status: string
  chiefComplaint: string
  hasAiSummary: boolean
  hasPrescription: boolean
}

export default function PatientAppointmentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [appointments, setAppointments] = useState<Appointment[]>([])

  // Redirect if not authenticated or not a patient
  useEffect(() => {
    if (status === "loading") return
    // Require authentication for the appointments page in all environments.
    if (!session) {
      router.push("/auth/signin/patient")
      return
    }
    if (session.user && session.user.role !== "PATIENT") {
      // Redirect to sign-in with context about expected role instead of sending to home
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

  // Load appointments from API and keep in sync using polling + focus refetch
  useEffect(() => {
    let mounted = true
    let interval: number | undefined

    const mapAppointments = (appts: any[]): Appointment[] =>
      appts.map((a: any) => ({
        id: a.id,
        referenceId: a.referenceId,
        doctorName: a.doctor?.user?.name || 'Unknown',
        specialization: (a.doctor?.specialization || [])[0] || 'General',
        scheduledDate: a.scheduledDate?.split('T')[0] ?? new Date(a.scheduledDate).toISOString().split('T')[0],
        scheduledTime: new Date(a.scheduledDate).toTimeString().slice(0,5) ?? '00:00',
        status: a.status,
        chiefComplaint: a.chiefComplaint || '',
        hasAiSummary: Boolean(a.aiSummary),
        hasPrescription: Boolean(a.prescription),
      }))

    const loadAppointments = async () => {
      try {
        const res = await fetch(`/api/patient/appointments`, { credentials: 'include' })
        if (!res.ok) {
          console.warn('Failed to load appointments:', res.status)
          if (mounted) setAppointments([])
          return
        }

        const json = await res.json()
        const appts = json.appointments || []
        const mapped = mapAppointments(appts)
        if (mounted) setAppointments(mapped)
      } catch (e) {
        console.error('Error fetching appointments:', e)
        if (mounted) setAppointments([])
      }
    }

    // Initial load
    loadAppointments()

    // Poll every 15 seconds to pick up status changes
    interval = window.setInterval(loadAppointments, 15000)

    // Refetch on window focus for near-real-time updates
    const onFocus = () => loadAppointments()
    window.addEventListener('focus', onFocus)

    return () => {
      mounted = false
      if (interval) clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  const filteredAppointments = appointments.filter(appointment => {
    // Exclude cancelled appointments entirely as per requirements
    if (appointment.status === "CANCELLED") return false;
    
    const matchesSearch = 
      appointment.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.referenceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = 
      selectedFilter === "all" ||
      (selectedFilter === "upcoming" && ["SCHEDULED", "CONFIRMED"].includes(appointment.status)) ||
      (selectedFilter === "completed" && appointment.status === "COMPLETED")
    
    return matchesSearch && matchesFilter
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SCHEDULED":
      case "CONFIRMED":
        return <ClockIcon className="w-4 h-4 text-blue-600" />
      case "COMPLETED":
        return <CheckCircleIcon className="w-4 h-4 text-green-600" />
      case "CANCELLED":
        return <XCircleIcon className="w-4 h-4 text-red-600" />
      default:
        return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
      case "CONFIRMED":
        return "text-blue-600 bg-blue-50"
      case "COMPLETED":
        return "text-green-600 bg-green-50"
      case "CANCELLED":
        return "text-red-600 bg-red-50"
      default:
        return "text-yellow-600 bg-yellow-50"
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  My Appointments
                </h1>
                <p className="text-gray-600">
                  View and manage your medical appointments
                </p>
              </div>
              <Button variant="medical" asChild>
                <Link href="/patient/book">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Book New Appointment
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Total Appointments",
              value: appointments.length,
              icon: CalendarIcon,
              color: "text-blue-600 bg-blue-50"
            },
            {
              title: "Upcoming",
              value: appointments.filter(a => ["SCHEDULED", "CONFIRMED"].includes(a.status)).length,
              icon: ClockIcon,
              color: "text-orange-600 bg-orange-50"
            },
            {
              title: "Completed",
              value: appointments.filter(a => a.status === "COMPLETED").length,
              icon: CheckCircleIcon,
              color: "text-green-600 bg-green-50"
            },
            {
              title: "With Prescriptions",
              value: appointments.filter(a => a.hasPrescription).length,
              icon: DocumentTextIcon,
              color: "text-purple-600 bg-purple-50"
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
            <CardTitle>Appointment History</CardTitle>
            <CardDescription>
              Search and filter your appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search appointments..."
                  autoComplete="off"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                {[{ key: "all", label: "All" },
                  { key: "upcoming", label: "Upcoming" },
                  { key: "completed", label: "Completed" }
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

            {/* Appointments List */}
            <div className="space-y-4">
              {filteredAppointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                          <UserIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {appointment.doctorName}
                          </h3>
                          <p className="text-sm text-gray-600">{appointment.specialization}</p>
                        </div>
                        <div className={`flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                          {getStatusIcon(appointment.status)}
                          <span>{appointment.status.replace('_', ' ')}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{appointment.scheduledDate} at {appointment.scheduledTime}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DocumentTextIcon className="w-4 h-4" />
                          <span>Ref: {appointment.referenceId}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {appointment.hasAiSummary ? (
                            <>
                              <CheckCircleIcon className="w-4 h-4 text-green-600" />
                              <span className="text-green-600">AI Summary Available</span>
                            </>
                          ) : (
                            <>
                              <ClockIcon className="w-4 h-4 text-yellow-600" />
                              <span className="text-yellow-600">Processing...</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Chief Complaint:</span> {appointment.chiefComplaint}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link href={`/patient/appointments/${appointment.id}`}>
                          <EyeIcon className="w-4 h-4 mr-1" />
                          View Details
                        </Link>
                      </Button>
                      
                      {appointment.hasPrescription && (
                        <Button
                          variant="medical"
                          size="sm"
                          asChild
                        >
                          <Link href={`/patient/prescriptions/${appointment.id}`}>
                            <DocumentTextIcon className="w-4 h-4 mr-1" />
                            Prescription
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {filteredAppointments.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No appointments found</p>
                  <p className="mb-4">
                    {searchQuery || selectedFilter !== "all" 
                      ? "Try adjusting your search or filter criteria."
                      : "You haven't booked any appointments yet."
                    }
                  </p>
                  <Button variant="medical" asChild>
                    <Link href="/patient/book">
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Book Your First Appointment
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
