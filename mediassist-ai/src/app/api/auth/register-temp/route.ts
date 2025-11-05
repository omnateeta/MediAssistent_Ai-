import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { validateEmail } from "@/lib/utils"
import { addMockUser } from "@/lib/auth-temp"


// This endpoint has been removed. Please use /api/auth/register for real database registration.
