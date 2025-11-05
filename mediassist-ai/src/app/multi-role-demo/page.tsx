"use client"

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMultiRoleAuth } from '@/hooks/useMultiRoleAuth';
import { 
  CheckCircleIcon, 
  XCircleIcon,
  UserIcon,
  UserGroupIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function MultiRoleInstructionsPage() {
  const { 
    hasMultipleRoleAccess, 
    getAllActiveRoles, 
    validateRoleAccess,
    signOutRole 
  } = useMultiRoleAuth();
  
  const [activeRoles, setActiveRoles] = useState<('PATIENT' | 'DOCTOR')[]>([]);
  const [hasMultiAccess, setHasMultiAccess] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      setActiveRoles(getAllActiveRoles());
      setHasMultiAccess(hasMultipleRoleAccess());
    };

    updateStatus();
    
    // Check every 2 seconds for status updates
    const interval = setInterval(updateStatus, 2000);
    return () => clearInterval(interval);
  }, [getAllActiveRoles, hasMultipleRoleAccess]);

  const hasPatientAccess = validateRoleAccess('PATIENT');
  const hasDoctorAccess = validateRoleAccess('DOCTOR');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Simultaneous Login Instructions
          </h1>
          <p className="text-gray-600">
            How to test patient and doctor login simultaneously
          </p>
        </div>

        {/* Current Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ArrowPathIcon className="w-5 h-5" />
              <span>Current Multi-Role Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                {hasPatientAccess ? (
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircleIcon className="w-6 h-6 text-red-600" />
                )}
                <div>
                  <p className="font-medium">Patient Access</p>
                  <p className="text-sm text-gray-600">
                    {hasPatientAccess ? 'Active' : 'Not signed in'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                {hasDoctorAccess ? (
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircleIcon className="w-6 h-6 text-red-600" />
                )}
                <div>
                  <p className="font-medium">Doctor Access</p>
                  <p className="text-sm text-gray-600">
                    {hasDoctorAccess ? 'Active' : 'Not signed in'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                {hasMultiAccess ? (
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                ) : (
                  <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
                )}
                <div>
                  <p className="font-medium">Simultaneous Access</p>
                  <p className="text-sm text-gray-600">
                    {hasMultiAccess ? `Both roles active (${activeRoles.length})` : 'Single or no role active'}
                  </p>
                </div>
              </div>
            </div>

            {hasMultiAccess && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">
                    Success! Both Patient and Doctor sessions are active simultaneously.
                  </span>
                </div>
                <p className="text-green-700 text-sm mt-2">
                  You can now navigate to both dashboards in different browser tabs without losing authentication.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Method 1: Test Page */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Method 1: Using Test Page</CardTitle>
              <CardDescription>
                The easiest way to test simultaneous login
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Go to Test Page</p>
                    <p className="text-sm text-gray-600">
                      Navigate to the multi-role test page
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Sign in as Patient</p>
                    <p className="text-sm text-gray-600">
                      Enter patient credentials in the left panel
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Sign in as Doctor</p>
                    <p className="text-sm text-gray-600">
                      Enter doctor credentials in the right panel
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full text-sm font-medium">
                    ✓
                  </div>
                  <div>
                    <p className="font-medium">Verify Both Active</p>
                    <p className="text-sm text-gray-600">
                      Both panels should show "access active"
                    </p>
                  </div>
                </div>
              </div>
              
              <Link href="/test-multi-role">
                <Button className="w-full" variant="medical">
                  Go to Test Page
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Method 2: Multiple Tabs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Method 2: Multiple Browser Tabs</CardTitle>
              <CardDescription>
                Test with separate browser tabs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full text-sm font-medium">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Open Tab 1</p>
                    <p className="text-sm text-gray-600">
                      Go to patient sign-in page
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full text-sm font-medium">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Sign in as Patient</p>
                    <p className="text-sm text-gray-600">
                      Complete patient authentication
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full text-sm font-medium">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Open Tab 2</p>
                    <p className="text-sm text-gray-600">
                      Open new tab, go to doctor sign-in
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full text-sm font-medium">
                    4
                  </div>
                  <div>
                    <p className="font-medium">Sign in as Doctor</p>
                    <p className="text-sm text-gray-600">
                      Complete doctor authentication
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                    ✓
                  </div>
                  <div>
                    <p className="font-medium">Test Both Tabs</p>
                    <p className="text-sm text-gray-600">
                      Both should remain authenticated
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Link href="/auth/signin/patient">
                  <Button className="w-full" variant="outline">
                    <UserIcon className="w-4 h-4 mr-2" />
                    Patient Sign-in
                  </Button>
                </Link>
                <Link href="/auth/signin/doctor">
                  <Button className="w-full" variant="medical">
                    <UserGroupIcon className="w-4 h-4 mr-2" />
                    Doctor Sign-in
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        {(hasPatientAccess || hasDoctorAccess) && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Quick Navigation</CardTitle>
              <CardDescription>
                Navigate to dashboards with current authentication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {hasPatientAccess && (
                  <Link href="/patient/dashboard">
                    <Button className="w-full" variant="outline">
                      <UserIcon className="w-4 h-4 mr-2" />
                      Patient Dashboard
                    </Button>
                  </Link>
                )}
                {hasDoctorAccess && (
                  <Link href="/doctor/dashboard">
                    <Button className="w-full" variant="medical">
                      <UserGroupIcon className="w-4 h-4 mr-2" />
                      Doctor Dashboard
                    </Button>
                  </Link>
                )}
              </div>
              
              {activeRoles.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">Sign out options:</p>
                  <div className="flex space-x-2">
                    {activeRoles.map((role) => (
                      <Button
                        key={role}
                        variant="outline"
                        size="sm"
                        onClick={() => signOutRole(role)}
                      >
                        Sign out {role}
                      </Button>
                    ))}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => signOutRole()}
                    >
                      Sign out all
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}