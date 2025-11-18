import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/utils/auth";
import User from "@/lib/models/User";
import dbConnect from "@/lib/utils/dbConnect";

// Disconnect Zoom account
export async function POST(request) {
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
        { success: false, message: "Only instructors can disconnect Zoom accounts" },
        { status: 403 }
      );
    }

    // Clear Zoom integration data
    user.zoomIntegration = {
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      zoomUserId: null,
      zoomEmail: null,
      zoomDisplayName: null,
      connectedAt: null,
    };

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Zoom account disconnected successfully"
    });

  } catch (error) {
    console.error("Zoom disconnect error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to disconnect Zoom account" },
      { status: 500 }
    );
  }
}