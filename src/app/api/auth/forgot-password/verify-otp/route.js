import { NextResponse } from "next/server";
import User from "@/lib/models/User";
import dbConnect from "@/lib/utils/dbConnect";

export async function POST(request) {
  await dbConnect();

  try {
    const body = await request.json();
    const { userId, otp } = body;

    if (!userId || !otp) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID and OTP are required",
        },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    if (user.otp !== otp || user.otpExpires < new Date()) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired OTP",
        },
        { status: 400 }
      );
    }

    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "OTP verified successfully",
        userId: user._id,
        nextStep: "reset-password",
      },
      { status: 200 }
    );
  } catch (error) {
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
