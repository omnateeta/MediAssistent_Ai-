"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  HeartIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  SparklesIcon,
  CalendarIcon,
  DocumentTextIcon,
  MicrophoneIcon,
  CloudArrowUpIcon,
  ChartBarIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline"
import { motion } from "framer-motion"

export default function HomePage() {
  const { data: session } = useSession()

  const features = [
    {
      icon: CalendarIcon,
      title: "Smart Appointment Booking",
      description: "Easy scheduling with doctor specialization matching and real-time availability."
    },
    {
      icon: MicrophoneIcon,
      title: "Voice-Powered Intake",
      description: "Record symptoms naturally with AI-powered voice-to-text transcription."
    },
    {
      icon: SparklesIcon,
      title: "AI Medical Analysis",
      description: "Advanced NLP generates preliminary diagnoses and treatment suggestions."
    },
    {
      icon: CloudArrowUpIcon,
      title: "Secure File Upload",
      description: "Upload medical reports, images, and documents with HIPAA compliance."
    },
    {
      icon: DocumentTextIcon,
      title: "Digital Prescriptions",
      description: "Doctor-approved digital prescriptions with e-signature and sharing."
    },
    {
      icon: ShieldCheckIcon,
      title: "HIPAA Compliant",
      description: "Enterprise-grade security with end-to-end encryption and audit logs."
    }
  ]

  const stats = [
    { label: "Patient Satisfaction", value: "98%" },
    { label: "Time Saved", value: "60%" },
    { label: "Accuracy Rate", value: "95%" },
    { label: "Hospitals Using", value: "500+" }
  ]

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(/backgroundimg.jpg)',
        backgroundSize: 'contain',
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'scroll',
        minHeight: '100vh',
        width: '100vw',
      }}
    >
      {/* Overlay for light effect */}
      <div className="absolute inset-0 bg-white/40 pointer-events-none z-0" />
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                    <span className="block">Smart Medical</span>
                    <span className="block bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                      AI Assistant
                    </span>
                  </h1>
                  <p className="mt-6 text-lg text-gray-600 sm:text-xl">
                    Revolutionize healthcare with AI-powered patient intake, intelligent diagnostics,
                    and seamless digital prescriptions. Built for hospitals and clinics.
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    {session ? (
                      <Button size="xl" variant="medical" asChild>
                        <Link href={session.user.role === 'DOCTOR' ? '/doctor/dashboard' : '/patient/book'}>
                          Go to Dashboard
                        </Link>
                      </Button>
                    ) : (
                      <>
                        <Button size="xl" variant="medical" asChild>
                          <Link href="/auth/signin?callbackUrl=%2Fpatient%2Fdashboard">Get Started Free</Link>
                        </Button>
                        <Button size="xl" variant="outline" asChild>
                          <Link href="/demo">Watch Demo</Link>
                        </Button>
                      </>
                    )}
                  </div>
                </motion.div>
              </div>

              <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md"
                >
                  <div className="relative block w-full bg-white rounded-lg overflow-hidden">
                    <div className="bg-gradient-to-br from-blue-600 to-green-600 px-6 py-8">
                      <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg mb-4 mx-auto">
                        <HeartIcon className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-white text-center">MediAssist AI</h3>
                      <p className="text-blue-100 text-center mt-2">Intelligent Healthcare Platform</p>
                    </div>
                    <div className="px-6 py-4 space-y-3">
                      <div className="flex items-center space-x-3">
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-gray-600">AI-Powered Diagnostics</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-gray-600">Voice Recognition</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-gray-600">Digital Prescriptions</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-gray-600">HIPAA Compliant</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-white py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-blue-600">{stat.value}</div>
                  <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Comprehensive Healthcare Solution
              </h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                From patient intake to prescription delivery, our AI-powered platform
                streamlines every aspect of medical care.
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg mb-4">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base">
                          {feature.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-green-600 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to Transform Your Healthcare Practice?
              </h2>
              <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto">
                Join hundreds of hospitals and clinics already using MediAssist AI
                to improve patient care and operational efficiency.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="xl" variant="secondary" asChild>
                  <Link href="/auth/signup">Start Free Trial</Link>
                </Button>
                <Button size="xl" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" asChild>
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}