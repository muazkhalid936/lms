import { NextResponse } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/lib/utils/dbConnect";
import User from "@/lib/models/User";
import { verifyToken } from "@/lib/utils/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function POST(request) {
  try {
    await dbConnect();

    // Verify token and get user
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

    let user;
    try {
      const payload = await verifyToken(token);
      user = await User.findById(payload.userId);
      if (!user) {
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
        );
      }
      if (user.userType !== "Instructor") {
        return NextResponse.json(
          { success: false, message: "Only instructors can onboard" },
          { status: 403 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    if (!user.stripeAccountId) {
      return NextResponse.json(
        { success: false, message: "No Stripe account. Create one first." },
        { status: 400 }
      );
    }

    const origin = request.headers.get("origin") || process.env.APP_URL;

    const accountLink = await stripe.accountLinks.create({
      account: user.stripeAccountId,
      refresh_url: `${origin}/dashboard/instructor/payouts?refresh=1`,
      return_url: `${origin}/dashboard/instructor/payouts?return=1`,
      type: "account_onboarding",
    });

    return NextResponse.json(
      { success: true, url: accountLink.url },
      { status: 200 }
    );
  } catch (error) {
    console.error("Generate account link error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate onboarding link",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
