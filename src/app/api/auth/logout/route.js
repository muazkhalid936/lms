// app/api/auth/logout/route.js
import { NextResponse } from "next/server";

export async function POST() {
  // Create JSON response
  const response = NextResponse.json(
    { success: true, message: "Logout successful" },
    { status: 200 }
  );

  // Clear the token cookie
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/", // make sure to clear cookie site-wide
  });

  return response;
}
