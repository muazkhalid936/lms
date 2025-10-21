// app/api/profile/upload-avatar/route.js
import { NextResponse } from "next/server";
import { uploadToS3, deleteFromS3 } from "@/lib/services/awsService";
import dbConnect from "@/lib/utils/dbConnect";
import User from "@/lib/models/User";

export async function POST(request) {
  try {
    await dbConnect();
    
    const formData = await request.formData();
    const file = formData.get("file");
    const userId = formData.get("userId");

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    // Validate file type
    const fileType = file.type;
    if (!fileType.startsWith("image/")) {
      return NextResponse.json(
        { success: false, message: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Find user to check for existing avatar
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Delete old avatar from S3 if exists
    if (user.avatarKey) {
      try {
        await deleteFromS3(user.avatarKey);
      } catch (error) {
        console.warn("Failed to delete old avatar:", error);
        // Continue with upload even if deletion fails
      }
    }

    // Upload new avatar to S3
    const uploadResult = await uploadToS3(file, 'avatars');
    
    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, message: "Failed to upload avatar to S3" },
        { status: 500 }
      );
    }

    // Update user with new avatar URL and key
    user.avatar = uploadResult.url;
    user.avatarKey = uploadResult.key;
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Avatar uploaded successfully",
        avatarUrl: uploadResult.url,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload avatar",
        error: error.message,
      },
      { status: 500 }
    );
  }
}