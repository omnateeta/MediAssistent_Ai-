"use client"

import { useState } from 'react';
import { useMultiRoleAuth } from '@/hooks/useMultiRoleAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  UserIcon, 
  UserGroupIcon, 
  ArrowPathIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface RoleSwitcherProps {
  currentPath?: string;
  onRoleSwitch?: (role: 'PATIENT' | 'DOCTOR') => void;
}

export default function RoleSwitcher({ currentPath, onRoleSwitch }: RoleSwitcherProps) {
  const { 
    session, 
    multiRoleSession, 
    switchToRole, 
    signOutRole, 
    validateRoleAccess 
  } = useMultiRoleAuth();
  
  const [switching, setSwitching] = useState(false);
  const [switchingTo, setSwitchingTo] = useState<'PATIENT' | 'DOCTOR' | null>(null);

  const handleRoleSwitch = async (role: 'PATIENT' | 'DOCTOR') => {
    setSwitching(true);
    setSwitchingTo(role);
    
    try {
      const success = await switchToRole(role);
      if (success && onRoleSwitch) {
        onRoleSwitch(role);
      }
    } catch (error) {
      console.error('Role switch failed:', error);
    } finally {
      setSwitching(false);
      setSwitchingTo(null);
    }
  };

  const currentRole = session?.user?.role || multiRoleSession?.role;

  if (!currentRole) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>Please sign in to access the system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link href="/auth/signin/patient">
            <Button className="w-full" variant="outline">
              <UserIcon className="w-4 h-4 mr-2" />
              Sign in as Patient
            </Button>
          </Link>
          <Link href="/auth/signin/doctor">
            <Button className="w-full" variant="medical">
              <UserGroupIcon className="w-4 h-4 mr-2" />
              Sign in as Doctor
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ArrowPathIcon className="w-5 h-5" />
          <span>Current Session</span>
        </CardTitle>
        <CardDescription>
          You are signed in as {currentRole}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          {currentRole === 'PATIENT' ? (
            <UserIcon className="w-6 h-6 text-blue-600" />
          ) : (
            <UserGroupIcon className="w-6 h-6 text-blue-600" />
          )}
          <div>
            <p className="font-medium text-blue-900">
              {currentRole} Portal Active
            </p>
            <p className="text-sm text-blue-700">
              {session?.user?.name || multiRoleSession?.userName || 'User'}
            </p>
          </div>
          <CheckCircleIcon className="w-5 h-5 text-green-600 ml-auto" />
        </div>

        <div className="space-y-2">
          {currentRole === 'PATIENT' && (
            <Link href="/patient/dashboard">
              <Button className="w-full" variant="medical">
                Go to Patient Dashboard
              </Button>
            </Link>
          )}
          {currentRole === 'DOCTOR' && (
            <Link href="/doctor/dashboard">
              <Button className="w-full" variant="medical">
                Go to Doctor Dashboard
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}