import { useState, useEffect, useCallback } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface MultiRoleSession {
  token: string;
  role: string;
  userId: string;
  userName: string;
  userEmail: string;
  isValid: boolean;
}

interface MultiRoleAuthHook {
  // Current NextAuth session
  session: any;
  status: string;
  
  // Multi-role session management
  multiRoleSession: MultiRoleSession | null;
  isMultiRoleAuthenticated: boolean;
  
  // Actions
  signInAsRole: (email: string, password: string, role: 'PATIENT' | 'DOCTOR') => Promise<{ success: boolean; error?: string }>;
  switchToRole: (role: 'PATIENT' | 'DOCTOR') => Promise<boolean>;
  signOutRole: (role?: 'PATIENT' | 'DOCTOR') => Promise<void>;
  validateRoleAccess: (requiredRole: 'PATIENT' | 'DOCTOR') => boolean;
  hasMultipleRoleAccess: () => boolean;
  getAllActiveRoles: () => ('PATIENT' | 'DOCTOR')[];
}

export function useMultiRoleAuth(requiredRole?: 'PATIENT' | 'DOCTOR'): MultiRoleAuthHook {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [multiRoleSession, setMultiRoleSession] = useState<MultiRoleSession | null>(null);
  const [isMultiRoleAuthenticated, setIsMultiRoleAuthenticated] = useState(false);

  // Load stored role sessions on component mount
  useEffect(() => {
    const loadStoredSessions = () => {
      try {
        // Load both patient and doctor tokens if they exist
        const patientToken = sessionStorage.getItem('tab_token_PATIENT');
        const doctorToken = sessionStorage.getItem('tab_token_DOCTOR');
        
        // Validate the required role token first, or current token
        const priorityToken = requiredRole ? sessionStorage.getItem(`tab_token_${requiredRole}`) : sessionStorage.getItem('tab_token_current');
        
        if (priorityToken) {
          validateStoredToken(priorityToken);
        } else if (patientToken) {
          validateStoredToken(patientToken);
        } else if (doctorToken) {
          validateStoredToken(doctorToken);
        }
      } catch (error) {
        console.warn('Failed to load stored sessions:', error);
      }
    };

    if (typeof window !== 'undefined') {
      loadStoredSessions();
    }
  }, [requiredRole]);

  const validateStoredToken = async (token: string) => {
    try {
      const response = await fetch(`/api/multi-role-auth?token=${token}`);
      if (response.ok) {
        const data = await response.json();
        if (data.valid) {
          setMultiRoleSession({
            token,
            role: data.role,
            userId: data.userId,
            userName: data.name || data.email,
            userEmail: data.email,
            isValid: true
          });
          setIsMultiRoleAuthenticated(true);
        }
      }
    } catch (error) {
      console.warn('Token validation failed:', error);
    }
  };

  const signInAsRole = useCallback(async (email: string, password: string, role: 'PATIENT' | 'DOCTOR') => {
    try {
      // Create multi-role session (don't interfere with existing NextAuth session)
      const multiRoleResponse = await fetch('/api/multi-role-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });

      if (!multiRoleResponse.ok) {
        const errorData = await multiRoleResponse.json();
        return { success: false, error: errorData.message || 'Authentication failed' };
      }

      const sessionData = await multiRoleResponse.json();
      
      // Store role-specific token (keeping both roles if they exist)
      try {
        sessionStorage.setItem(`tab_token_${role}`, sessionData.token);
        sessionStorage.setItem(`tab_token_current`, sessionData.token);
      } catch (error) {
        console.warn('Failed to store session token:', error);
      }

      // Update current active session
      setMultiRoleSession({
        token: sessionData.token,
        role: sessionData.role,
        userId: sessionData.userId,
        userName: sessionData.userName,
        userEmail: sessionData.userEmail,
        isValid: true
      });
      setIsMultiRoleAuthenticated(true);

      // Also update NextAuth session for the current role (optional)
      try {
        await signIn('credentials', {
          email,
          password,
          role,
          redirect: false
        });
      } catch (error) {
        console.warn('NextAuth session update failed:', error);
        // Don't fail the multi-role login if NextAuth fails
      }

      return { success: true };
    } catch (error) {
      console.error('Multi-role sign in error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }, []);

  const switchToRole = useCallback(async (role: 'PATIENT' | 'DOCTOR') => {
    try {
      const storedToken = sessionStorage.getItem(`tab_token_${role}`);
      
      if (storedToken) {
        // Validate existing token
        const response = await fetch(`/api/multi-role-auth?token=${storedToken}`);
        if (response.ok) {
          const data = await response.json();
          if (data.valid) {
            sessionStorage.setItem('tab_token_current', storedToken);
            setMultiRoleSession({
              token: storedToken,
              role: data.role,
              userId: data.userId,
              userName: data.name || data.email,
              userEmail: data.email,
              isValid: true
            });
            setIsMultiRoleAuthenticated(true);
            return true;
          }
        }
      }
      
      // If no valid stored session, redirect to sign in
      router.push(`/auth/signin/${role.toLowerCase()}`);
      return false;
    } catch (error) {
      console.error('Role switch error:', error);
      return false;
    }
  }, [router]);

  const signOutRole = useCallback(async (role?: 'PATIENT' | 'DOCTOR') => {
    try {
      if (role) {
        // Sign out specific role
        sessionStorage.removeItem(`tab_token_${role}`);
        if (multiRoleSession?.role === role) {
          setMultiRoleSession(null);
          setIsMultiRoleAuthenticated(false);
        }
      } else {
        // Sign out all roles
        sessionStorage.removeItem('tab_token_PATIENT');
        sessionStorage.removeItem('tab_token_DOCTOR');
        sessionStorage.removeItem('tab_token_current');
        setMultiRoleSession(null);
        setIsMultiRoleAuthenticated(false);
        await signOut({ redirect: false });
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, [multiRoleSession]);

  const validateRoleAccess = useCallback((requiredRole: 'PATIENT' | 'DOCTOR') => {
    // Check NextAuth session first
    if (session?.user?.role === requiredRole) {
      return true;
    }
    
    // Check multi-role session
    if (multiRoleSession?.role === requiredRole && multiRoleSession.isValid) {
      return true;
    }
    
    // Check stored token for the specific role
    try {
      const storedToken = sessionStorage.getItem(`tab_token_${requiredRole}`);
      if (storedToken) {
        return true; // Assume valid for now, will be validated on API calls
      }
    } catch (error) {
      console.warn('Failed to check stored token:', error);
    }
    
    return false;
  }, [session, multiRoleSession]);

  const hasMultipleRoleAccess = useCallback(() => {
    try {
      const patientToken = sessionStorage.getItem('tab_token_PATIENT');
      const doctorToken = sessionStorage.getItem('tab_token_DOCTOR');
      return !!(patientToken && doctorToken);
    } catch (error) {
      return false;
    }
  }, []);

  const getAllActiveRoles = useCallback(() => {
    const activeRoles: ('PATIENT' | 'DOCTOR')[] = [];
    try {
      if (sessionStorage.getItem('tab_token_PATIENT')) {
        activeRoles.push('PATIENT');
      }
      if (sessionStorage.getItem('tab_token_DOCTOR')) {
        activeRoles.push('DOCTOR');
      }
    } catch (error) {
      console.warn('Failed to get active roles:', error);
    }
    return activeRoles;
  }, []);

  return {
    session,
    status,
    multiRoleSession,
    isMultiRoleAuthenticated,
    signInAsRole,
    switchToRole,
    signOutRole,
    validateRoleAccess,
    hasMultipleRoleAccess,
    getAllActiveRoles
  };
}