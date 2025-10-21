import { NextResponse } from "next/server";
import User from "@/lib/models/User";
import dbConnect from "@/lib/utils/dbConnect";
import { generateOTP, sendOTPViaEmail } from "@/lib/services/otpService";

export async function POST(request) {
  await dbConnect();

  try {
    const body = await request.json();
    const { email, userId } = body;

    let user;
    if (userId) {
      user = await User.findById(userId);
    } else if (email) {
      user = await User.findOne({ email });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Either email or userId is required",
        },
        { status: 400 }
      );
    }

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTPViaEmail(user.email, otp);

    return NextResponse.json(
      {
        success: true,
        message: "OTP resent successfully",
        userId: user._id,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Server error during OTP resend",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
