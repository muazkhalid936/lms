import { NextResponse } from "next/server";
import User from "@/lib/models/User";
import { generateOTP, sendOTPViaEmail } from "@/lib/services/otpService";
import dbConnect from "@/lib/utils/dbConnect";

export async function POST(request) {
  await dbConnect();

  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required",
        },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "No account found with this email",
        },
        { status: 404 }
      );
    }

    if (!user.isOtpVerified) {
      return NextResponse.json(
        {
          success: false,
          message: "Please complete your registration first",
        },
        { status: 400 }
      );
    }

    if (user.googleId && !user.password) {
      return NextResponse.json({
        success: false,
        message:
          "This account was created with Google. Please use Google sign-in.",
      });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTPViaEmail(email, otp);

    return NextResponse.json(
      {
        success: true,
        message: "OTP sent to your email",
        userId: user._id,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Server error during password reset request",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
