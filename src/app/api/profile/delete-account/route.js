// app/api/profile/delete-account/route.js
import { NextResponse } from "next/server";
import User from "@/lib/models/User";
import dbConnect from "@/lib/utils/dbConnect";
import { deleteFromS3 } from "@/lib/services/awsService";
import { cookies } from "next/headers";

export async function POST(request) {
  await dbConnect();

  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID is required",
        },
        { status: 400 }
      );
    }

    // Find user
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

    // Delete user's avatar from S3 if it exists
    if (user.avatarKey) {
      try {
        await deleteFromS3(user.avatarKey);
      } catch (error) {
        console.error("Failed to delete avatar from S3:", error);
        // Continue with account deletion even if avatar deletion fails
      }
    }

    // Clear the user's token in the database
    user.token = null;
    await user.save();

    // Delete the user account
    await User.findByIdAndDelete(userId);

    // Clear the token cookie
    const cookieStore = cookies();
    cookieStore.delete("token");

    return NextResponse.json(
      {
        success: true,
        message: "Account deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error during account deletion",
        error: error.message,
      },
      { status: 500 }
    );
  }
}