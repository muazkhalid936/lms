import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import User from "@/lib/models/User";
import dbConnect from "@/lib/utils/dbConnect";
import { generateToken } from "@/lib/utils/auth";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.FRONTEND_URL}/api/auth/google/callback`;

const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

export async function GET(request) {
  await dbConnect();

  try {
    const code = request.nextUrl.searchParams.get("code");

    if (!code) {
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?error=code_missing`;
      return NextResponse.redirect(redirectUrl);
    }

    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    const username = payload.name;

    let user = await User.findOne({
      $or: [{ email }, { googleId }],
    });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        user.isOtpVerified = true;
        user.isVerified = true;
        await user.save();
      }
    } else {
      user = await User.create({
        userName: username,
        email,
        googleId,
        isOtpVerified: true,
        isVerified: true,
      });
    }

    // Make sure to await the token generation if it's async
    const token = await generateToken({
      userId: user._id.toString(),
      email: user.email,
      userType: user.userType
    });

    // Create response and set cookie (no token in URL)
    const response = NextResponse.redirect(`${process.env.FRONTEND_URL}/auth/callback?success=true`);
    
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      sameSite: "strict",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Google OAuth error:", error);
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?error=oauth_failed`;
    return NextResponse.redirect(redirectUrl);
  }
}