"use client"

import { useState, useEffect } from "react"
import useAuthGuard from '@/hooks/useAuthGuard'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  CalendarIcon, 
  UserGroupIcon, 
  ClockIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon
} from "@heroicons/react/24/outline"
import { motion } from "framer-motion"

interface Appointment {
  id: string
  referenceId: string
  patientName: string
  scheduledDate: string
  scheduledTime: string
  status: string
  urgencyLevel: string
  chiefComplaint: string
  hasAiSummary: boolean
  isNewPatient: boolean
}

interface DashboardStats {
  todayAppointments: number
  pendingReviews: number
  totalPatients: number
  completedToday: number
}



export default function DoctorDashboardPage() {
  const { session, status, checked } = useAuthGuard('DOCTOR')
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    pendingReviews: 0,
    totalPatients: 0,
    completedToday: 0
  })
  // Fetch real data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/doctor/appointments')
        if (response.ok) {
          const data = await response.json()
          const appointmentsData: Appointment[] = data.appointments.map((appt: any) => ({
            id: appt.id,
            referenceId: appt.referenceId,
            patientName: appt.patient.user.name || 'Unknown Patient',
            scheduledDate: new Date(appt.scheduledDate).toISOString().split('T')[0],
            scheduledTime: new Date(appt.scheduledDate).toTimeString().slice(0, 5),
            status: appt.status,
            urgencyLevel: appt.aiSummary?.urgencyLevel || 'LOW',
            chiefComplaint: appt.chiefComplaint || 'No complaint specified',
            hasAiSummary: !!appt.aiSummary,
            isNewPatient: false // TODO: Implement logic to check if new patient
          }))

          setAppointments(appointmentsData)

          // Calculate stats
          const today = new Date().toISOString().split('T')[0]
          const todayAppts = appointmentsData.filter(appt => appt.scheduledDate === today)
          const pendingReviews = appointmentsData.filter(appt => ['SCHEDULED', 'CONFIRMED'].includes(appt.status)).length
          const totalPatients = new Set(appointmentsData.map(appt => appt.patientName)).size
          const completedToday = todayAppts.filter(appt => appt.status === 'COMPLETED').length

          setStats({
            todayAppointments: todayAppts.length,
            pendingReviews,
            totalPatients,
            completedToday
          })
        }
      } catch (error) {
        console.error('Error fetching appointments:', error)
        // Keep empty state on error
      }
    }

    fetchData()
  }, [])

  if (!checked) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.referenceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = 
      selectedFilter === "all" ||
      (selectedFilter === "pending" && appointment.status === "SCHEDULED") ||
      (selectedFilter === "in-progress" && appointment.status === "IN_PROGRESS") ||
      (selectedFilter === "completed" && appointment.status === "COMPLETED") ||
      (selectedFilter === "high-priority" && appointment.urgencyLevel === "HIGH")
    
    return matchesSearch && matchesFilter
  })

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case "HIGH": return "text-red-600 bg-red-50 border-red-200"
      case "MEDIUM": return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "LOW": return "text-green-600 bg-green-50 border-green-200"
      default: return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED": return "text-blue-600 bg-blue-50"
      case "IN_PROGRESS": return "text-orange-600 bg-orange-50"
      case "COMPLETED": return "text-green-600 bg-green-50"
      case "CANCELLED": return "text-red-600 bg-red-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4"
          >
            <img
              src="/file.svg"
              alt="Smart Medical AI Assistant"
              className="w-20 h-20 rounded-lg shadow-md border border-gray-200 bg-white"
              style={{ objectFit: 'contain' }}
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                Smart Medical <span className="text-blue-600">AI Assistant</span>
              </h1>
              <p className="text-gray-600">
                Welcome back, {session?.user.name}
              </p>
              <p className="text-gray-500 text-sm">
                Here's what's happening with your patients today
              </p>
            </div>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Today's Appointments",
              value: stats.todayAppointments,
              icon: CalendarIcon,
              color: "text-blue-600 bg-blue-50"
            },
            {
              title: "Pending Reviews",
              value: stats.pendingReviews,
              icon: ExclamationTriangleIcon,
              color: "text-yellow-600 bg-yellow-50"
            },
            {
              title: "Total Patients",
              value: stats.totalPatients,
              icon: UserGroupIcon,
              color: "text-green-600 bg-green-50"
            },
            {
              title: "Completed Today",
              value: stats.completedToday,
              icon: CheckCircleIcon,
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
            <CardTitle>Patient Appointments</CardTitle>
            <CardDescription>
              Manage your appointments and review AI-generated summaries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by patient name, reference ID, or symptoms..."
                  autoComplete="off"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                {[
                  { key: "all", label: "All" },
                  { key: "pending", label: "Pending" },
                  { key: "in-progress", label: "In Progress" },
                  { key: "high-priority", label: "High Priority" },
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
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
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
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                          {appointment.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
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
                              <ChartBarIcon className="w-4 h-4 text-green-600" />
                              <span className="text-green-600">AI Summary Ready</span>
                            </>
                          ) : (
                            <>
                              <ClockIcon className="w-4 h-4 text-yellow-600" />
                              <span className="text-yellow-600">Processing...</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <p className="mt-2 text-sm text-gray-700">
                        <span className="font-medium">Chief Complaint:</span> {appointment.chiefComplaint}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link href={`/doctor/appointments/${appointment.id}`}>
                          <EyeIcon className="w-4 h-4 mr-1" />
                          Review
                        </Link>
                      </Button>
                      
                      {appointment.hasAiSummary && (
                        <Button
                          variant="medical"
                          size="sm"
                          asChild
                        >
                          <Link href={`/doctor/ai-summary/${appointment.id}`}>
                            <ChartBarIcon className="w-4 h-4 mr-1" />
                            AI Summary
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {filteredAppointments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <UserGroupIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No appointments found matching your criteria.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/doctor/appointments">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  View All Appointments
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/doctor/patients">
                  <UserGroupIcon className="w-4 h-4 mr-2" />
                  Patient Directory
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/doctor/prescriptions">
                  <DocumentTextIcon className="w-4 h-4 mr-2" />
                  Prescription History
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Prescription issued for John Smith</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>AI summary reviewed for Sarah Johnson</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>New appointment booked with Michael Chen</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>AI Processing</span>
                  <span className="text-green-600 font-medium">Online</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Voice Recognition</span>
                  <span className="text-green-600 font-medium">Online</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Database</span>
                  <span className="text-green-600 font-medium">Healthy</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last Backup</span>
                  <span className="text-gray-600">2 hours ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
