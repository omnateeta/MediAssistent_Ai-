"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  ExclamationTriangleIcon,
  ChartBarIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline"
import { motion } from "framer-motion"

interface Appointment {
  id: string
  referenceId: string
  patientName: string
  patientAge: number
  scheduledDate: string
  scheduledTime: string
  status: string
  urgencyLevel: string
  chiefComplaint: string
  hasAiSummary: boolean
  isNewPatient: boolean
  contactInfo: string
}

export default function DoctorAppointmentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [selectedDate, setSelectedDate] = useState("")
  const [appointments, setAppointments] = useState<Appointment[]>([])

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

  // Load appointments from API and keep in sync using polling + focus refetch
  useEffect(() => {
    let mounted = true
    let interval: number | undefined

    const mapAppointments = (appts: any[]): Appointment[] =>
      appts.map((a: any) => ({
        id: a.id,
        referenceId: a.referenceId || `APPT-${String(a.id).slice(0,8)}`,
        patientName: a.patient?.user?.name || a.patient?.name || 'Unknown',
        patientAge: a.patient?.age ?? 0,
        scheduledDate: a.scheduledDate ? new Date(a.scheduledDate).toISOString().split('T')[0] : '',
        scheduledTime: a.scheduledDate ? new Date(a.scheduledDate).toTimeString().slice(0,5) : '00:00',
        status: a.status ?? 'SCHEDULED',
        urgencyLevel: a.aiSummary?.urgencyLevel ?? 'LOW',
        chiefComplaint: a.chiefComplaint ?? '',
        hasAiSummary: Boolean(a.aiSummary),
        isNewPatient: Boolean(a.patient?.isNewPatient),
        contactInfo: a.patient?.phoneNumber || a.patient?.user?.email || '',
      }))

    const loadAppointments = async () => {
      try {
        const res = await fetch(`/api/doctor/appointments`, { credentials: 'include' })
        if (res.status === 401) {
          // Not authenticated - send to sign in with callback so doctor returns here after login
          const cb = encodeURIComponent(window.location.pathname + window.location.search)
          router.push(`/auth/signin/doctor?callbackUrl=${cb}`)
          return
        }

        const json = await res.json()
        const appts = json.appointments || []
        const mapped = mapAppointments(appts)
        if (mounted) setAppointments(mapped)
      } catch (e) {
        console.error('Error fetching doctor appointments:', e)
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
  }, [router])

  // Filter appointments based on search and filters
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.referenceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = selectedFilter === "all" || appointment.status === selectedFilter
    const matchesDate = !selectedDate || appointment.scheduledDate === selectedDate
    
    return matchesSearch && matchesFilter && matchesDate
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case "IN_PROGRESS":
        return <ClockIcon className="w-5 h-5 text-blue-500" />
      case "CANCELLED":
        return <XCircleIcon className="w-5 h-5 text-red-500" />
      default:
        return <CalendarIcon className="w-5 h-5 text-gray-500" />
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Appointment Management
              </h1>
              <p className="text-gray-600">
                Manage and review your patient appointments
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link href="/doctor/dashboard">
                  <ChartBarIcon className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              {/* Add Create Appointment button */}
              <Button variant="medical" asChild>
                <Link href="/doctor/appointments/create">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create Appointment
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/doctor/patients">
                  <UserGroupIcon className="w-4 h-4 mr-2" />
                  Patient Directory
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CalendarIcon className="w-8 h-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {appointments.filter(a => a.scheduledDate === "2024-10-15").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <ClockIcon className="w-8 h-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {appointments.filter(a => a.status === "IN_PROGRESS").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircleIcon className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed Today</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {appointments.filter(a => a.status === "COMPLETED" && a.scheduledDate === "2024-10-15").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">High Priority</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {appointments.filter(a => a.urgencyLevel === "HIGH").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search patients, reference ID, or complaints..."
                  autoComplete="off"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Appointments</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                placeholder="Filter by date"
              />
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card>
          <CardHeader>
            <CardTitle>Appointments ({filteredAppointments.length})</CardTitle>
            <CardDescription>
              Review and manage your patient appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAppointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(appointment.status)}
                      
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {appointment.patientName}
                          </h3>
                          {appointment.isNewPatient && (
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              New Patient
                            </span>
                          )}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getUrgencyColor(appointment.urgencyLevel)}`}>
                            {appointment.urgencyLevel} Priority
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Ref:</strong> {appointment.referenceId} | 
                          <strong> Age:</strong> {appointment.patientAge} | 
                          <strong> Contact:</strong> {appointment.contactInfo}
                        </p>
                        <p className="text-sm text-gray-700 mb-2">
                          <strong>Chief Complaint:</strong> {appointment.chiefComplaint}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-1" />
                            {new Date(appointment.scheduledDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            {appointment.scheduledTime}
                          </span>
                          {appointment.hasAiSummary && (
                            <span className="flex items-center text-blue-600">
                              <DocumentTextIcon className="w-4 h-4 mr-1" />
                              AI Summary Available
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        appointment.status === 'COMPLETED' 
                          ? 'bg-green-100 text-green-800' 
                          : appointment.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800'
                          : appointment.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {appointment.status.replace('_', ' ')}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link href={`/doctor/appointments/${appointment.id}`}>
                          <EyeIcon className="w-4 h-4 mr-1" />
                          View Details
                        </Link>
                      </Button>
                      
                      {appointment.hasAiSummary && (
                        <Button
                          variant="medical"
                          size="sm"
                          asChild
                        >
                          <Link href={`/doctor/appointments/${appointment.id}/summary`}>
                            <DocumentTextIcon className="w-4 h-4 mr-1" />
                            AI Summary
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {filteredAppointments.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">No appointments found</h3>
                  <p className="mb-4">
                    {searchQuery || selectedFilter !== "all" || selectedDate
                      ? "Try adjusting your search criteria"
                      : "No appointments scheduled for the selected criteria"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
