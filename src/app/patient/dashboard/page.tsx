"use client"

import { useState, useEffect } from "react"
import useAuthGuard from '@/hooks/useAuthGuard'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  CalendarIcon, 
  ClockIcon, 
  UserIcon,
  DocumentTextIcon,
  HeartIcon,
  PlusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BellIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline"
import { motion } from "framer-motion"

interface UpcomingAppointment {
  id: string
  referenceId: string
  doctorName: string
  specialization: string
  scheduledDate: string
  scheduledTime: string
  status: string
}

interface RecentActivity {
  id: string
  type: string
  title: string
  description: string
  date: string
  status: string
}

export default function PatientDashboardPage() {
  const { session, status, checked } = useAuthGuard('PATIENT')
  
  const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  // Mock data - in real app, fetch from API
  useEffect(() => {
    const mockUpcoming: UpcomingAppointment[] = [
      {
        id: "1",
        referenceId: "REF-ABC123",
        doctorName: "Dr. Sarah Johnson",
        specialization: "Cardiology",
        scheduledDate: "2024-10-15",
        scheduledTime: "10:30",
        status: "CONFIRMED"
      },
      {
        id: "2",
        referenceId: "REF-JKL012",
        doctorName: "Dr. Robert Wilson",
        specialization: "Orthopedics",
        scheduledDate: "2024-11-05",
        scheduledTime: "09:00",
        status: "SCHEDULED"
      }
    ]

    const mockActivity: RecentActivity[] = [
      {
        id: "1",
        type: "prescription",
        title: "Prescription Ready",
        description: "Your prescription from Dr. Michael Chen is ready for pickup",
        date: "2024-10-10",
        status: "ready"
      },
      {
        id: "2",
        type: "appointment",
        title: "Appointment Confirmed",
        description: "Your appointment with Dr. Sarah Johnson has been confirmed",
        date: "2024-10-08",
        status: "confirmed"
      },
      {
        id: "3",
        type: "ai_summary",
        title: "AI Analysis Complete",
        description: "Your symptoms have been analyzed and summary is ready for doctor review",
        date: "2024-10-07",
        status: "completed"
      }
    ]

    setUpcomingAppointments(mockUpcoming)
    setRecentActivity(mockActivity)
  }, [])

  // Wait for auth guard to finish checking
  if (!checked) return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  const stats = {
    totalAppointments: 8,
    upcomingAppointments: upcomingAppointments.length,
    completedAppointments: 6,
    activePrescriptions: 2
  }

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {session?.user.name}
            </h1>
            <p className="text-gray-600">
              Here's an overview of your health journey
            </p>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Total Appointments",
              value: stats.totalAppointments,
              icon: CalendarIcon,
              color: "text-blue-600 bg-blue-50",
              href: "/patient/appointments"
            },
            {
              title: "Upcoming",
              value: stats.upcomingAppointments,
              icon: ClockIcon,
              color: "text-orange-600 bg-orange-50",
              href: "/patient/appointments"
            },
            {
              title: "Completed",
              value: stats.completedAppointments,
              icon: CheckCircleIcon,
              color: "text-green-600 bg-green-50",
              href: "/patient/appointments"
            },
            {
              title: "Active Prescriptions",
              value: stats.activePrescriptions,
              icon: DocumentTextIcon,
              color: "text-purple-600 bg-purple-50",
              href: "/patient/prescriptions"
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
                <Link href={stat.href}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
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
                </Link>
              </motion.div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Upcoming Appointments</CardTitle>
                    <CardDescription>
                      Your scheduled medical appointments
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/patient/appointments">
                      View All
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {upcomingAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment, index) => (
                      <motion.div
                        key={appointment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                            <UserIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {appointment.doctorName}
                            </h3>
                            <p className="text-sm text-gray-600">{appointment.specialization}</p>
                            <p className="text-sm text-gray-500">
                              {appointment.scheduledDate} at {appointment.scheduledTime}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            appointment.status === 'CONFIRMED' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {appointment.status}
                          </span>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/patient/appointments/${appointment.id}`}>
                              View
                            </Link>
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">No upcoming appointments</p>
                    <p className="mb-4">Book your next appointment to continue your health journey</p>
                    <Button variant="medical" asChild>
                      <Link href="/patient/book">
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Book Appointment
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="medical" className="w-full justify-start" asChild>
                  <Link href="/patient/book">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Book New Appointment
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/patient/appointments">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    View Appointments
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/patient/prescriptions">
                    <DocumentTextIcon className="w-4 h-4 mr-2" />
                    My Prescriptions
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/patient/records">
                    <ChartBarIcon className="w-4 h-4 mr-2" />
                    Medical Records
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-start space-x-3"
                    >
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${
                        activity.type === 'prescription' ? 'bg-purple-100' :
                        activity.type === 'appointment' ? 'bg-blue-100' :
                        'bg-green-100'
                      }`}>
                        {activity.type === 'prescription' ? (
                          <DocumentTextIcon className={`w-4 h-4 ${
                            activity.type === 'prescription' ? 'text-purple-600' : ''
                          }`} />
                        ) : activity.type === 'appointment' ? (
                          <CalendarIcon className="w-4 h-4 text-blue-600" />
                        ) : (
                          <ChartBarIcon className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.date}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Health Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <HeartIcon className="w-5 h-5 mr-2 text-red-500" />
                  Health Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-900">Stay Hydrated</p>
                    <p className="text-blue-700">Drink at least 8 glasses of water daily for optimal health.</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-900">Regular Exercise</p>
                    <p className="text-green-700">Aim for 30 minutes of moderate exercise most days of the week.</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="font-medium text-purple-900">Quality Sleep</p>
                    <p className="text-purple-700">Get 7-9 hours of quality sleep each night for better health.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
