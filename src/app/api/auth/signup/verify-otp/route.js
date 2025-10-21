import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/lib/models/User";
import dbConnect from "@/lib/utils/dbConnect";
import { generateToken } from "@/lib/utils/auth";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function POST(request) {
  await dbConnect();
  try {
    const body = await request.json();
    const { userId, otp } = body;

    if (!userId || !otp) {
      return NextResponse.json(
        { success: false, message: "UserId and OTP are required" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found. Please start registration again.",
        },
        { status: 404 }
      );
    }

    // OTP validation
    if (user.otp !== otp || user.otpExpires < new Date()) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Mark user as verified
    user.isOtpVerified = true;
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    // If instructor, ensure Stripe account exists
    let onboardingUrl = null;
    if (user.userType === "Instructor") {
      // Create connected account if absent
      if (!user.stripeAccountId) {
        const account = await stripe.accounts.create({
          type: "express",
          email: user.email,
          country: "US",
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
        });
        user.stripeAccountId = account.id;
        user.payoutsEnabled = !!account.payouts_enabled;
        user.chargesEnabled = !!account.charges_enabled;
        user.stripeDetailsSubmitted = !!account.details_submitted;
        user.stripeOnboardingComplete = !!(account.details_submitted && account.payouts_enabled);
      }

      // Generate onboarding link
      const origin = request.headers.get("origin") || process.env.APP_URL || "http://localhost:3000";
      const accountLink = await stripe.accountLinks.create({
        account: user.stripeAccountId,
        refresh_url: `${origin}/dashboard/instructor/payouts?refresh=1`,
        return_url: `${origin}/dashboard/instructor/payouts?return=1`,
        type: "account_onboarding",
      });
      onboardingUrl = accountLink.url;
    }

    await user.save();

    // Generate JWT
    const token = await generateToken({
      userId: user._id.toString(),
      email: user.email,
      userType: user.userType,
    });

    // Prepare response
    const response = NextResponse.json(
      {
        success: true,
        message: "Account verified successfully!",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          isOtpVerified: user.isOtpVerified,
          isVerified: user.isVerified,
          stripeOnboardingUrl: onboardingUrl,
          userType: user.userType,
        },
      },
      { status: 200 }
    );

    // Save token in cookies
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
      sameSite: "strict",
    });

    return response;
  } catch (error) {
    console.error("Error in OTP verification:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error during OTP verification",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
