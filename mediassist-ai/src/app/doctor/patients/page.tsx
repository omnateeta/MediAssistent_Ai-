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
  UserGroupIcon, 
  MagnifyingGlassIcon,
  EyeIcon,
  CalendarIcon,
  PhoneIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  UserIcon,
  ClockIcon,
  HeartIcon
} from "@heroicons/react/24/outline"
import { motion } from "framer-motion"

interface Patient {
  id: string
  userId: string
  name: string
  age: number | null
  gender: string
  contactInfo: string
  email: string
  lastVisit: string | null
  nextAppointment: string | null
  condition: string
  riskLevel: string
  totalVisits: number
  completedVisits: number
  hasActiveIssues: boolean
  emergencyContact: string
  address: string
  bloodType: string
  height: number | null
  weight: number | null
  medicalHistory: string[]
  currentMedications: string[]
  currentPrescriptions: string[]
  allergies: string[]
  chronicConditions: string[]
  insuranceProvider: string | null
}

export default function DoctorPatientsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [selectedRisk, setSelectedRisk] = useState("all")
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  // Fetch real-time patients data from API
  useEffect(() => {
    async function fetchPatients() {
      if (!session?.user?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch('/api/doctor/patients', {
          credentials: 'include'
        });
        
        if (res.status === 401) {
          router.push('/auth/signin');
          return;
        }
        
        const data = await res.json();
        
        if (data.error) {
          setError(data.error);
        } else {
          setPatients(data.patients || []);
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
        setError('Failed to load patients. Please try again.');
        setPatients([]);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user?.role === 'DOCTOR') {
      fetchPatients();
      
      // Poll for updates every 30 seconds
      const interval = setInterval(fetchPatients, 30000);
      return () => clearInterval(interval);
    }
  }, [session, router]);

  // Filter patients based on search and filters
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.condition.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = selectedFilter === "all" || 
      (selectedFilter === "active" && patient.hasActiveIssues) ||
      (selectedFilter === "upcoming" && patient.nextAppointment)
    
    const matchesRisk = selectedRisk === "all" || patient.riskLevel === selectedRisk
    
    return matchesSearch && matchesFilter && matchesRisk
  })

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
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

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patients...</p>
        </div>
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
                Patient Directory
              </h1>
              <p className="text-gray-600">
                Manage and review your patient records ({patients.length} total patients)
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={async () => {
                  setLoading(true);
                  setError(null);
                  try {
                    const res = await fetch('/api/doctor/patients', { credentials: 'include' });
                    const data = await res.json();
                    if (data.error) {
                      setError(data.error);
                    } else {
                      setPatients(data.patients || []);
                    }
                  } catch (error) {
                    setError('Failed to refresh patients');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
              >
                <ClockIcon className="w-4 h-4 mr-2" />
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/doctor/dashboard">
                  <ChartBarIcon className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/doctor/appointments">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Appointments
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
                <UserGroupIcon className="w-8 h-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Patients</p>
                  <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">High Risk</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {patients.filter(p => p.riskLevel === "HIGH").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CalendarIcon className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Upcoming Appointments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {patients.filter(p => p.nextAppointment).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <HeartIcon className="w-8 h-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Issues</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {patients.filter(p => p.hasActiveIssues).length}
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
                  placeholder="Search patients, email, or conditions..."
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
                  <SelectItem value="all">All Patients</SelectItem>
                  <SelectItem value="active">Active Issues</SelectItem>
                  <SelectItem value="upcoming">Upcoming Appointments</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedRisk} onValueChange={setSelectedRisk}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by risk level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="HIGH">High Risk</SelectItem>
                  <SelectItem value="MEDIUM">Medium Risk</SelectItem>
                  <SelectItem value="LOW">Low Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Patients List */}
        <Card>
          <CardHeader>
            <CardTitle>Patients ({filteredPatients.length})</CardTitle>
            <CardDescription>
              Review and manage your patient records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPatients.map((patient, index) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <UserIcon className="w-10 h-10 text-gray-400 bg-gray-100 rounded-full p-2" />
                      
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {patient.name}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRiskColor(patient.riskLevel)}`}>
                            {patient.riskLevel} Risk
                          </span>
                          {patient.hasActiveIssues && (
                            <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                              Active Issues
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                          <div className="text-sm text-gray-600">
                            <p><strong>Age:</strong> {patient.age || 'Unknown'} | <strong>Gender:</strong> {patient.gender}</p>
                            <p className="flex items-center mt-1">
                              <PhoneIcon className="w-4 h-4 mr-1" />
                              {patient.contactInfo}
                            </p>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p><strong>Total Visits:</strong> {patient.totalVisits} ({patient.completedVisits} completed)</p>
                            <p><strong>Last Visit:</strong> {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'No visits yet'}</p>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-2">
                          <strong>Conditions:</strong> {patient.condition}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          {patient.nextAppointment && (
                            <span className="flex items-center text-blue-600">
                              <CalendarIcon className="w-4 h-4 mr-1" />
                              Next: {new Date(patient.nextAppointment).toLocaleDateString()}
                            </span>
                          )}
                          {patient.allergies && patient.allergies.length > 0 && patient.allergies[0] !== "None known" && (
                            <span className="flex items-center text-red-600">
                              <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                              Allergies: {patient.allergies.slice(0, 2).join(', ')}
                            </span>
                          )}
                          {patient.bloodType && patient.bloodType !== 'Unknown' && (
                            <span className="flex items-center text-purple-600">
                              <HeartIcon className="w-4 h-4 mr-1" />
                              Blood Type: {patient.bloodType}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link href={`/patient/${patient.userId}`}>
                          <EyeIcon className="w-4 h-4 mr-1" />
                          View Details
                        </Link>
                      </Button>
                      
                      {patient.nextAppointment && (
                        <Button
                          variant="medical"
                          size="sm"
                          asChild
                        >
                          <Link href={`/doctor/appointments`}>
                            <CalendarIcon className="w-4 h-4 mr-1" />
                            Appointments
                          </Link>
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link href={`/doctor/patients/${patient.id}/history`}>
                          <DocumentTextIcon className="w-4 h-4 mr-1" />
                          History
                        </Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {filteredPatients.length === 0 && !loading && (
                <div className="text-center py-12 text-gray-500">
                  <UserGroupIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">
                    {error ? 'Error loading patients' : 'No patients found'}
                  </h3>
                  <p className="mb-4">
                    {error ? error :
                     searchQuery || selectedFilter !== "all" || selectedRisk !== "all"
                      ? "Try adjusting your search criteria"
                      : "No patients have appointments with you yet"}
                  </p>
                  {error && (
                    <Button 
                      variant="medical" 
                      onClick={() => window.location.reload()}
                    >
                      Try Again
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}