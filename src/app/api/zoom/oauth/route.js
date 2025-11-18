import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/utils/auth";
import User from "@/lib/models/User";
import dbConnect from "@/lib/utils/dbConnect";

// Initiate Zoom OAuth flow
export async function GET(request) {
  try {
    await dbConnect();

    // Get authorization token
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify token and get user info
    const payload = await verifyToken(token);
    const user = await User.findById(payload.userId);

    if (!user || user.userType !== "Instructor") {
      return NextResponse.json(
        { success: false, message: "Only instructors can connect Zoom accounts" },
        { status: 403 }
      );
    }

    // Generate OAuth URL
    const clientId = process.env.ZOOM_CLIENT_ID;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const redirectUri = `${baseUrl}/api/zoom/oauth/callback`;
    const state = user._id.toString(); // Use user ID as state for security

    console.log('OAuth redirect URI:', redirectUri);

    const oauthUrl = `https://zoom.us/oauth/authorize?` +
      `response_type=code&` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `state=${state}&` +
      `scope=meeting:write:admin meeting:read:admin user:read:admin`;

    return NextResponse.json({
      success: true,
      oauthUrl
    });

  } catch (error) {
    console.error("Zoom OAuth initiation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to initiate Zoom OAuth" },
      { status: 500 }
    );
  }
}