import { NextResponse } from "next/server";
import User from "@/lib/models/User";
import dbConnect from "@/lib/utils/dbConnect";

export async function POST(request) {
  await dbConnect();

  try {
    const body = await request.json();
    const { userId, currentPassword, newPassword } = body;

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "UserId, Current Password and New Password are required",
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
    if (user.googleId && !user.password) {
      return NextResponse.json({
        success: false,
        message: "Password of account logged in with google can not be changed",
      });
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return NextResponse.json ({
        success: false,
        error: "The current password you provided is incorrect. Please try again.",
        field: "password",
      });
    }

    user.password = newPassword;
    await user.save();
    return NextResponse.json(
      {
        success: true,
        message: "Password reset successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Server error during password reset",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
