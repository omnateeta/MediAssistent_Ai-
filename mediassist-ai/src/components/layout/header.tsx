"use client"

import React from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { 
  HeartIcon, 
  UserCircleIcon, 
  Bars3Icon,
  XMarkIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const navigation = React.useMemo(() => {
    if (!session) return []
    
    if (session.user.role === 'PATIENT') {
      return [
        { name: 'Dashboard', href: '/patient/dashboard', icon: ChartBarIcon },
        { name: 'Book Appointment', href: '/patient/book', icon: CalendarIcon },
        { name: 'My Appointments', href: '/patient/appointments', icon: DocumentTextIcon },
        { name: 'Prescriptions', href: '/patient/prescriptions', icon: DocumentTextIcon },
      ]
    }
    
    if (session.user.role === 'DOCTOR') {
      return [
        { name: 'Dashboard', href: '/doctor/dashboard', icon: ChartBarIcon },
        { name: 'Appointments', href: '/doctor/appointments', icon: CalendarIcon },
        { name: 'Patients', href: '/doctor/patients', icon: UserCircleIcon },
      ]
    }
    
    return []
  }, [session])

  return (
    <header className={cn("bg-white shadow-sm border-b", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg">
              <HeartIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              MediAssist AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            ) : session ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{session.user.role?.toLowerCase()}</p>
                </div>
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full text-white text-sm font-medium">
                  {session.user.name?.charAt(0) || 'U'}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="text-gray-600 hover:text-red-600"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button variant="medical" size="sm" asChild>
                  <Link href="/auth/signin?callbackUrl=%2Fpatient%2Fdashboard">Get Started</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-blue-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
