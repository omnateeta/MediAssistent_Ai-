import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createSession, getSessionByToken } from '@/lib/tabSessions';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, role } = body;
    
    if (!email || !password || !role) {
      return NextResponse.json({ message: 'Missing credentials or role' }, { status: 400 });
    }

    // Authenticate user credentials
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: {
        patientProfile: true,
        doctorProfile: true,
      }
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password if set
    if (user.password) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
      }
    }

    // Check if user has the requested role
    if (user.role !== role) {
      return NextResponse.json({ 
        message: `Role mismatch: this account is registered as ${user.role}` 
      }, { status: 403 });
    }

    if (!user.isActive) {
      return NextResponse.json({ message: 'Account is deactivated' }, { status: 403 });
    }

    // Create a role-specific session with longer TTL for simultaneous access
    const session = await createSession(user.id, user.email, user.role, 1000 * 60 * 60 * 24 * 7); // 7 days
    
    return NextResponse.json({ 
      token: session.token, 
      role: user.role, 
      userId: user.id,
      userName: user.name,
      userEmail: user.email
    });
  } catch (error) {
    console.error('Multi-role login error:', error);
    return NextResponse.json({ 
      message: 'Server error', 
      error: String(error) 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json({ message: 'Missing token' }, { status: 400 });
    }

    const session = await getSessionByToken(token);
    
    if (!session) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }

    return NextResponse.json({ 
      valid: true, 
      userId: session.userId, 
      email: session.email, 
      role: session.role 
    });
  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json({ 
      message: 'Server error', 
      error: String(error) 
    }, { status: 500 });
  }
}