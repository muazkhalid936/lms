import { NextResponse } from "next/server";
import User from "@/lib/models/User";
import { generateOTP, sendOTPViaEmail } from "@/lib/services/otpService";
import bcrypt from "bcryptjs"; // if you're hashing passwords
import dbConnect from "@/lib/utils/dbConnect";

export async function POST(request) {
  await dbConnect();

  try {
    const body = await request.json();
    const { username, email, password, userType } = body;

    if (!username || !email || !password || !userType) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email, password and userType are required",
        },
        { status: 400 }
      );
    }

    // Check for existing email
    const existingUser = await User.findOne({ email });
    console.log(existingUser);

    if (existingUser?.isOtpVerified) {
      return NextResponse.json(
        {
          success: false,
          message: "This email is already registered and verified",
        },
        { status: 400 }
      );
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    let user;
    if (existingUser && !existingUser.isOtpVerified) {
      console.log("Updating existing unverified user");
      existingUser.userName = username;
      existingUser.password = password;
      existingUser.userType = userType;
      existingUser.otp = otp;
      existingUser.otpExpires = otpExpires;
      user = await existingUser.save();
    } else {
      console.log("Creating new user");
      // Hash password before saving

      const newUser = new User({
        userName: username,
        email,
        password,
        userType,
        otp,
        otpExpires,
      });
      user = await newUser.save();
    }

    await sendOTPViaEmail(email, otp);

    return NextResponse.json(
      {
        success: true,
        message: "Account created! Please verify your email with the OTP sent",
        userId: user._id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during signup:", error); 
    if (error.code === 11000) {
      // Handle duplicate key errors - only for email since username can be duplicate
      if (error.keyPattern && error.keyPattern.email) {
        return NextResponse.json(
          {
            success: false,
            message: "An account with this email already exists",
          },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          {
            success: false,
            message: "An account with this information already exists",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Server error during signup",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
