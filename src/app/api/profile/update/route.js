// app/api/profile/update/route.js
import { NextResponse } from "next/server";
import User from "@/lib/models/User";
import dbConnect from "@/lib/utils/dbConnect";
import { deleteFromS3 } from "@/lib/services/awsService";

export async function POST(request) {
  await dbConnect();

  try {
    const body = await request.json();
    const {
      userId,
      firstName,
      lastName,
      userName,
      phoneNumber,
      gender,
      dob,
      bio,
      avatar,
      education,
      experience,
    } = body;

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

    // Check if username is taken by another user
    if (userName && userName !== user.userName) {
      const existingUser = await User.findOne({
        userName: userName.toLowerCase(),
        _id: { $ne: userId },
      });

      if (existingUser) {
        return NextResponse.json(
          {
            success: false,
            message: "Username is already taken",
            field: "userName",
          },
          { status: 400 }
        );
      }
    }

    // Validate phone number format (basic validation)
    if (phoneNumber && phoneNumber.trim() !== "") {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(phoneNumber)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid phone number format",
            field: "phoneNumber",
          },
          { status: 400 }
        );
      }
    }

    // Validate date of birth
    if (dob) {
      const dobDate = new Date(dob);
      const today = new Date();

      if (dobDate > today) {
        return NextResponse.json(
          {
            success: false,
            message: "Date of birth cannot be in the future",
            field: "dob",
          },
          { status: 400 }
        );
      }
    }

    // Update user fields
    if (firstName !== undefined) user.firstName = firstName.trim();
    if (lastName !== undefined) user.lastName = lastName.trim();
    if (userName !== undefined) user.userName = userName.toLowerCase().trim();
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber.trim();
    if (gender !== undefined) user.gender = gender;
    if (dob !== undefined) user.dob = dob ? new Date(dob) : null;
    if (bio !== undefined) user.bio = bio.trim();
    
    // Handle avatar deletion from S3 when setting to empty
    if (avatar !== undefined) {
      if (avatar === "" && user.avatarKey) {
        try {
          await deleteFromS3(user.avatarKey);
          user.avatarKey = "";
        } catch (error) {
          console.warn("Failed to delete old avatar from S3:", error);
          // Continue with update even if deletion fails
        }
      }
      user.avatar = avatar;
    }

    // Update education and experience only for instructors
    if (user.userType === "Instructor") {
      if (education !== undefined) {
        // Validate education entries
        const validEducation = education.filter(edu => {
          // Skip empty entries (where both degree and university are empty)
          if (!edu.degree && !edu.university) return false;
          
          // Validate dates if provided
          if (edu.fromDate && edu.toDate) {
            const from = new Date(edu.fromDate);
            const to = new Date(edu.toDate);
            if (from > to) return false;
          }
          
          return true;
        });

        user.education = validEducation.map(edu => ({
          degree: edu.degree?.trim() || "",
          university: edu.university?.trim() || "",
          fromDate: edu.fromDate ? new Date(edu.fromDate) : null,
          toDate: edu.toDate ? new Date(edu.toDate) : null,
        }));
      }

      if (experience !== undefined) {
        // Validate experience entries
        const validExperience = experience.filter(exp => {
          // Skip empty entries (where both company and position are empty)
          if (!exp.company && !exp.position) return false;
          
          // Validate dates if provided
          if (exp.fromDate && exp.toDate) {
            const from = new Date(exp.fromDate);
            const to = new Date(exp.toDate);
            if (from > to) return false;
          }
          
          return true;
        });

        user.experience = validExperience.map(exp => ({
          company: exp.company?.trim() || "",
          position: exp.position?.trim() || "",
          fromDate: exp.fromDate ? new Date(exp.fromDate) : null,
          toDate: exp.toDate ? new Date(exp.toDate) : null,
        }));
      }
    }

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully",
        user: user.toJSON(),
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "Username is already taken",
          field: "userName",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Server error during profile update",
        error: error.message,
      },
      { status: 500 }
    );
  }
}