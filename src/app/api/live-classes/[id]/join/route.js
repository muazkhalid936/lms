import { NextResponse } from "next/server";
import dbConnect from "@/lib/utils/dbConnect";
import LiveClass from "@/lib/models/LiveClass";
import User from "@/lib/models/User";
import Enrollment from "@/lib/models/Enrollment";
import { verifyToken } from "@/lib/utils/auth";
import agoraService from "@/lib/services/agoraService";

// POST - Join live class (students only)
export async function POST(request, { params }) {
  try {
    await dbConnect();

    const { id } = await params;

    // Get authorization token
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

    // Verify token and get user info
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

      // Students and instructors can join live classes
      if (user.userType !== "Student" && user.userType !== "Instructor") {
        return NextResponse.json(
          {
            success: false,
            message: "Only students and instructors can join live classes",
          },
          { status: 403 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Find live class
    const liveClass = await LiveClass.findById(id)
      .populate("course", "courseTitle")
      .populate("instructor", "firstName lastName");

    if (!liveClass) {
      return NextResponse.json(
        { success: false, message: "Live class not found" },
        { status: 404 }
      );
    }

    // Check if class is available to join
    if (liveClass.status !== "live" && liveClass.status !== "scheduled") {
      return NextResponse.json(
        { success: false, message: "This class is not available to join" },
        { status: 400 }
      );
    }

    // Check access based on user type
    let hasAccess = false;

    if (user.userType === "Instructor") {
      // Instructors can only join classes they created
      hasAccess = liveClass.instructor._id.toString() === user._id.toString();

      if (!hasAccess) {
        return NextResponse.json(
          {
            success: false,
            message: "Instructors can only join classes they created",
          },
          { status: 403 }
        );
      }
    } else if (user.userType === "Student") {
      const enrollment = await Enrollment.findOne({
        student: user._id,
        course: liveClass.course._id,
      });

      if (!enrollment) {
        return NextResponse.json(
          {
            success: false,
            message:
              "You must be enrolled in this course to join the live class. Please enroll in the course first.",
            courseId: liveClass.course._id,
          },
          { status: 403 }
        );
      }

      // Student is enrolled, they have access
      hasAccess = true;
    }

    // Check if class is within joinable time window
    const now = new Date();
    const scheduledTime = new Date(liveClass.scheduledDate);
    const timeDiff = scheduledTime.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);

    // Allow joining if class is live or within 5 minutes of start time (up to 30 minutes after)
    const canJoin =
      liveClass.status === "live" ||
      (minutesDiff <= 5 &&
        minutesDiff >= -30 &&
        liveClass.status === "scheduled");

    if (!canJoin) {
      return NextResponse.json(
        {
          success: false,
          message: "This class is not available to join at this time",
        },
        { status: 400 }
      );
    }

    // Check if class has reached maximum participants (only for students)
    if (
      user.userType === "Student" &&
      liveClass.registeredStudents.length >= liveClass.maxParticipants
    ) {
      return NextResponse.json(
        { success: false, message: "This class has reached maximum capacity" },
        { status: 400 }
      );
    }

    // Handle registration for students only
    if (user.userType === "Student") {
      // Check if student is already registered
      const isRegistered = liveClass.registeredStudents.some(
        (reg) => reg.student.toString() === user._id.toString()
      );

      // If student is not already registered, add them to registered students
      if (!isRegistered) {
        liveClass.registeredStudents.push({
          student: user._id,
          registeredAt: new Date(),
        });
        await liveClass.save();
      }
    }

    // Generate a unique UID for this user
    // Agora UIDs must be unique per user in the same channel
    // Agora supports integer UIDs in range [0, 2^32-1] (32-bit unsigned integer)
    // Note: Data channel IDs have a more restricted range [0, 65535]
    const generateUid = (userId) => {
      // Convert user ID to a number by hashing
      let hash = 0;
      const str = userId.toString();

      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
      }

      // Ensure positive 32-bit unsigned integer
      const unsigned = Math.abs(hash) >>> 0;

      // Return UID in range 1–6000
      return (unsigned % 6000) + 1;
    };

    const userUid = generateUid(user._id);

    console.log(userUid, "Asd");

    // Generate a token for this specific user with their UID
    const tokenResult = agoraService.generateJoinToken(
      liveClass.agoraChannelName,
      userUid
    );

    if (!tokenResult.success) {
      return NextResponse.json(
        { success: false, message: "Failed to generate access token" },
        { status: 500 }
      );
    }

    // Return Agora channel information for joining
    const channelInfo = {
      channelName: liveClass.agoraChannelName,
      token: tokenResult.token,
      appId: liveClass.agoraAppId,
      uid: parseInt(userUid, 10), // Ensure UID is integer
    };

    // Validate channel name length (Agora requires <= 64 bytes)
    if (!channelInfo.channelName || channelInfo.channelName.length > 64) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This live class has an invalid channel name. Please ask the instructor to delete and recreate this class.",
          error: "INVALID_CHANNEL_NAME",
        },
        { status: 500 }
      );
    }

    if (!channelInfo.appId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Agora channel information not available. Please contact the instructor.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Successfully joined live class",
      data: {
        channelInfo: channelInfo,
        className: liveClass.title,
        instructor: `${liveClass.instructor.firstName} ${liveClass.instructor.lastName}`,
        scheduledDate: liveClass.scheduledDate,
      },
    });
  } catch (error) {
    console.error("Live class join error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}