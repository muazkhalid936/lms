import { NextResponse } from "next/server";
import dbConnect from "@/lib/utils/dbConnect";
import LiveClass from "@/lib/models/LiveClass";
import User from "@/lib/models/User";
import Enrollment from "@/lib/models/Enrollment";
import { verifyToken } from "@/lib/utils/auth";

// POST - Register student for live class
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
      console.log(123);
      if (!user) {
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
        );
      }
      console.log(11223);

      // Only students can register for live classes
      if (user.userType !== "Student") {
        return NextResponse.json(
          {
            success: false,
            message: "Only students can register for live classes",
          },
          { status: 403 }
        );
      }
      console.log(11);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    console.log(22);
    // Find live class
    const liveClass = await LiveClass.findById(id).populate("course");
    console.log(33);

    if (!liveClass) {
      return NextResponse.json(
        { success: false, message: "Live class not found" },
        { status: 404 }
      );
    }
    console.log(44);

    // Check if class is in the past or completed (allow registration for scheduled and live classes)
    // Allow registration for live classes even if scheduledDate is in the past
    if (liveClass.status === "completed") {
      return NextResponse.json(
        { success: false, message: "Cannot register for completed classes" },
        { status: 400 }
      );
    }

    console.log(55);
    // For scheduled classes, check if they're in the past
    if (
      liveClass.status === "scheduled" &&
      liveClass.scheduledDate <= new Date()
    ) {
      return NextResponse.json(
        { success: false, message: "Cannot register for past classes" },
        { status: 400 }
      );
    }

    console.log(66);

    // Check if class is cancelled
    if (liveClass.status === "cancelled") {
      return NextResponse.json(
        { success: false, message: "Cannot register for cancelled classes" },
        { status: 400 }
      );
    }
    console.log(77);

    // Check if student is enrolled in the course (unless it's a public class)
    if (!liveClass.isPublic) {
      const enrollment = await Enrollment.findOne({
        student: user._id,
        course: liveClass.course._id,
        status: "active",
      });

      console.log(88);
      if (!enrollment) {
        return NextResponse.json(
          {
            success: false,
            message:
              "You must be enrolled in the course to register for this live class",
          },
          { status: 403 }
        );
      }
    }
    console.log(99);

    // Check if student is already registered
    const isAlreadyRegistered = liveClass.registeredStudents.some(
      (reg) => reg.student.toString() === user._id.toString()
    );

    console.log(1);
    if (isAlreadyRegistered) {
      return NextResponse.json(
        {
          success: false,
          message: "You are already registered for this live class",
        },
        { status: 400 }
      );
    }
    console.log(2);

    // Check if class is full
    if (liveClass.registeredStudents.length >= liveClass.maxParticipants) {
      return NextResponse.json(
        { success: false, message: "Live class is full" },
        { status: 400 }
      );
    }
    console.log(3);

    // Register student
    liveClass.registeredStudents.push({
      student: user._id,
      registeredAt: new Date(),
    });

    console.log(4);
    await LiveClass.updateOne(
      { _id: id },
      {
        $push: {
          registeredStudents: { student: user._id, registeredAt: new Date() },
        },
      }
    );
    console.log(5);

    return NextResponse.json({
      success: true,
      message: "Successfully registered for live class",
      data: {
        liveClassId: liveClass._id,
        title: liveClass.title,
        scheduledDate: liveClass.scheduledDate,
        agoraChannelName: liveClass.agoraChannelName,
        agoraAppId: liveClass.agoraAppId,
        agoraUid: liveClass.agoraUid,
        // Note: agoraToken is not returned here for security - it will be provided when joining
      },
    });
  } catch (error) {
    console.error("Live class registration error:", error);
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

// DELETE - Unregister student from live class
export async function DELETE(request, { params }) {
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

      // Only students can unregister from live classes
      if (user.userType !== "Student") {
        return NextResponse.json(
          {
            success: false,
            message: "Only students can unregister from live classes",
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
    const liveClass = await LiveClass.findById(id);

    if (!liveClass) {
      return NextResponse.json(
        { success: false, message: "Live class not found" },
        { status: 404 }
      );
    }

    // Check if class has already started
    if (liveClass.status === "live" || liveClass.status === "completed") {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot unregister from live or completed classes",
        },
        { status: 400 }
      );
    }

    // Check if student is registered
    const registrationIndex = liveClass.registeredStudents.findIndex(
      (reg) => reg.student.toString() === user._id.toString()
    );

    if (registrationIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not registered for this live class",
        },
        { status: 400 }
      );
    }

    // Unregister student
    liveClass.registeredStudents.splice(registrationIndex, 1);
    await liveClass.save();

    return NextResponse.json({
      success: true,
      message: "Successfully unregistered from live class",
    });
  } catch (error) {
    console.error("Live class unregistration error:", error);
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
