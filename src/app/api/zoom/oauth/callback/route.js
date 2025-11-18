import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/utils/auth";
import User from "@/lib/models/User";
import dbConnect from "@/lib/utils/dbConnect";

// Handle Zoom OAuth callback
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/instructor/settings?zoom_error=${encodeURIComponent(error)}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/instructor/settings?zoom_error=missing_parameters`
      );
    }

    // Find user by state (user ID)
    const user = await User.findById(state);
    if (!user || user.userType !== "Instructor") {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/instructor/settings?zoom_error=invalid_user`
      );
    }

    // Exchange code for access token
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const redirectUri = `${baseUrl}/api/zoom/oauth/callback`;
    
    console.log('Token exchange redirect URI:', redirectUri);

    const tokenResponse = await fetch("https://zoom.us/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_SECRET_KEY}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri
      })
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token");
    }

    const tokenData = await tokenResponse.json();

    // Get user info from Zoom
    const userResponse = await fetch("https://api.zoom.us/v2/users/me", {
      headers: {
        "Authorization": `Bearer ${tokenData.access_token}`
      }
    });

    if (!userResponse.ok) {
      throw new Error("Failed to get Zoom user info");
    }

    const zoomUser = await userResponse.json();

    // Store Zoom credentials in user document
    user.zoomIntegration = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
      zoomUserId: zoomUser.id,
      zoomEmail: zoomUser.email,
      zoomDisplayName: `${zoomUser.first_name} ${zoomUser.last_name}`,
      connectedAt: new Date()
    };

    await user.save();

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/instructor/settings?zoom_success=true`
    );

  } catch (error) {
    console.error("Zoom OAuth callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/instructor/settings?zoom_error=connection_failed`
    );
  }
}