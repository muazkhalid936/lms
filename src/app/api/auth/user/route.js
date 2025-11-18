// app/api/auth/user/route.js
import { NextResponse } from "next/server";
import AuthService from "@/lib/services/authService";

/**
 * Combined endpoint that replaces verify-token and get-profile
 * Returns both token verification and user data in one call
 */
export async function GET(request) {
  try {
    const authResult = await AuthService.getAuthenticatedUser(request);
    
    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: authResult.message,
        },
        { status: authResult.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: authResult.user,
        userId: authResult.user._id,
        email: authResult.user.email,
        userType: authResult.user.userType,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Auth user endpoint error:', error);
    return NextResponse.json(
      {
        success: false,
        message: "Authentication failed",
      },
      { status: 500 }
    );
  }
}