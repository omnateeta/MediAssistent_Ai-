"use client"

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMultiRoleAuth } from '@/hooks/useMultiRoleAuth';
import RoleSwitcher from '@/components/auth/RoleSwitcher';
import { 
  UserIcon, 
  UserGroupIcon, 
  CheckCircleIcon, 
  XCircleIcon 
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function MultiRoleTestPage() {
  const { 
    session, 
    multiRoleSession, 
    signInAsRole, 
    validateRoleAccess,
    signOutRole,
    hasMultipleRoleAccess,
    getAllActiveRoles
  } = useMultiRoleAuth();
  
  const [patientCreds, setPatientCreds] = useState({ email: '', password: '' });
  const [doctorCreds, setDoctorCreds] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState({ patient: false, doctor: false });
  const [errors, setErrors] = useState({ patient: '', doctor: '' });

  const handleSignIn = async (role: 'PATIENT' | 'DOCTOR') => {
    const creds = role === 'PATIENT' ? patientCreds : doctorCreds;
    setLoading({ ...loading, [role.toLowerCase()]: true });
    setErrors({ ...errors, [role.toLowerCase()]: '' });
    
    try {
      const result = await signInAsRole(creds.email, creds.password, role);
      if (!result.success) {
        setErrors({ ...errors, [role.toLowerCase()]: result.error || 'Sign in failed' });
      }
    } catch (error) {
      setErrors({ ...errors, [role.toLowerCase()]: 'An unexpected error occurred' });
    } finally {
      setLoading({ ...loading, [role.toLowerCase()]: false });
    }
  };

  const hasPatientAccess = validateRoleAccess('PATIENT');
  const hasDoctorAccess = validateRoleAccess('DOCTOR');
  const hasMultiAccess = hasMultipleRoleAccess();
  const activeRoles = getAllActiveRoles();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Multi-Role Authentication Test
          </h1>
          <p className="text-gray-600">
            Test simultaneous patient and doctor login capabilities
          </p>
          {hasMultiAccess && (
            <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
              <p className="text-green-800 font-medium">
                ✅ Multi-Role Access Active! Both Patient and Doctor sessions are running simultaneously.
              </p>
              <p className="text-green-700 text-sm mt-1">
                Active roles: {activeRoles.join(', ')}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Patient Login */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserIcon className="w-5 h-5 text-green-600" />
                <span>Patient Access</span>
                {hasPatientAccess && <CheckCircleIcon className="w-5 h-5 text-green-600" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!hasPatientAccess ? (
                <div className="space-y-3">
                  <Input
                    type="email"
                    placeholder="Patient email"
                    value={patientCreds.email}
                    onChange={(e) => setPatientCreds({ ...patientCreds, email: e.target.value })}
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={patientCreds.password}
                    onChange={(e) => setPatientCreds({ ...patientCreds, password: e.target.value })}
                  />
                  {errors.patient && (
                    <p className="text-sm text-red-600">{errors.patient}</p>
                  )}
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => handleSignIn('PATIENT')}
                    disabled={loading.patient || !patientCreds.email || !patientCreds.password}
                  >
                    {loading.patient ? 'Signing in...' : 'Sign in as Patient'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-green-800 font-medium">Patient access active</span>
                  </div>
                  <Link href="/patient/dashboard">
                    <Button className="w-full" variant="medical">
                      Go to Patient Dashboard
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Doctor Login */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserGroupIcon className="w-5 h-5 text-blue-600" />
                <span>Doctor Access</span>
                {hasDoctorAccess && <CheckCircleIcon className="w-5 h-5 text-green-600" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!hasDoctorAccess ? (
                <div className="space-y-3">
                  <Input
                    type="email"
                    placeholder="Doctor email"
                    value={doctorCreds.email}
                    onChange={(e) => setDoctorCreds({ ...doctorCreds, email: e.target.value })}
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={doctorCreds.password}
                    onChange={(e) => setDoctorCreds({ ...doctorCreds, password: e.target.value })}
                  />
                  {errors.doctor && (
                    <p className="text-sm text-red-600">{errors.doctor}</p>
                  )}
                  <Button
                    className="w-full"
                    variant="medical"
                    onClick={() => handleSignIn('DOCTOR')}
                    disabled={loading.doctor || !doctorCreds.email || !doctorCreds.password}
                  >
                    {loading.doctor ? 'Signing in...' : 'Sign in as Doctor'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <CheckCircleIcon className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-blue-800 font-medium">Doctor access active</span>
                  </div>
                  <Link href="/doctor/dashboard">
                    <Button className="w-full" variant="medical">
                      Go to Doctor Dashboard
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Current Role Display */}
        <div className="mb-8">
          <RoleSwitcher />
        </div>

        {/* Status Display */}
        <Card>
          <CardHeader>
            <CardTitle>Session Status</CardTitle>
            <CardDescription>Overview of active authentication sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Multi-Role Status</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    {hasMultiAccess ? (
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircleIcon className="w-4 h-4 text-red-600" />
                    )}
                    <span>Simultaneous Access: {hasMultiAccess ? 'Active' : 'Inactive'}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    Active Roles: {activeRoles.length > 0 ? activeRoles.join(', ') : 'None'}
                  </div>
                  <div className="text-xs text-gray-600">
                    Sessions: {activeRoles.length} role(s) authenticated
                  </div>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Current Session</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Current Role:</strong> {session?.user?.role || multiRoleSession?.role || 'None'}</p>
                  <p><strong>User:</strong> {session?.user?.name || multiRoleSession?.userName || 'None'}</p>
                  <p><strong>Patient Access:</strong> {hasPatientAccess ? 'Yes' : 'No'}</p>
                  <p><strong>Doctor Access:</strong> {hasDoctorAccess ? 'Yes' : 'No'}</p>
                  <p><strong>Multi-Role:</strong> {hasMultiAccess ? 'Active' : 'Inactive'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}