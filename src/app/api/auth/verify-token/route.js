// app/api/auth/verify-token/route.js
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/utils/auth";


export async function GET(request) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "No token found",
        },
        { status: 401 }
      );
    }
    const payload = await verifyToken(token)

    return NextResponse.json(
      {
        success: true,
        userId: payload.userId,
        email: payload.email,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid or expired token",
      },
      { status: 401 }
    );
  }
}
