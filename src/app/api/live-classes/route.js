import { NextResponse } from "next/server";
import dbConnect from "@/lib/utils/dbConnect";
import LiveClass from "@/lib/models/LiveClass";
import Course from "@/lib/models/Course";
import User from "@/lib/models/User";
import { verifyToken } from "@/lib/utils/auth";
import zoomService from "@/lib/services/zoomService";
import { updateLiveClassStatuses } from "@/lib/utils/liveClassStatusUpdater";

// GET - List live classes for instructor
export async function GET(request) {
  try {
    await dbConnect();

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

      // Only instructors can manage live classes
      if (user.userType !== "Instructor") {
        return NextResponse.json(
          {
            success: false,
            message: "Access denied. Only instructors can manage live classes.",
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const status = searchParams.get("status");
    const courseId = searchParams.get("courseId");
    const skip = (page - 1) * limit;

    // Update live class statuses before fetching
    await updateLiveClassStatuses();

    // Build query
    const query = { instructor: user._id };
    if (status) query.status = status;
    if (courseId) query.course = courseId;

    // Get live classes with course information
    const liveClasses = await LiveClass.find(query)
      .populate("course", "courseTitle thumbnail")
      .populate(
        "registeredStudents.student",
        "firstName lastName userName avatar"
      )
      .sort({ scheduledDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await LiveClass.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: {
        liveClasses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Live classes fetch error:", error);
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

// POST - Create new live class
export async function POST(request) {
  try {
    await dbConnect();

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

      // Only instructors can create live classes
      if (user.userType !== "Instructor") {
        return NextResponse.json(
          {
            success: false,
            message: "Access denied. Only instructors can create live classes.",
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

    const body = await request.json();
    const {
      title,
      description,
      courseId,
      scheduledDate,
      duration,
      maxParticipants = 100,
      isRecordingEnabled = false,
      waitingRoomEnabled = true,
      isPublic = false,
    } = body;

    console.log(title, description, courseId, scheduledDate, duration);
    if (!title || !description || !courseId || !scheduledDate || !duration) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify course exists and belongs to instructor
    const course = await Course.findOne({
      _id: courseId,
      instructor: user._id,
      status: "published",
    });

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found or not accessible" },
        { status: 404 }
      );
    }

    // Validate scheduled date is in the future
    const scheduledDateTime = new Date(scheduledDate);
    if (scheduledDateTime <= new Date()) {
      return NextResponse.json(
        { success: false, message: "Scheduled date must be in the future" },
        { status: 400 }
      );
    }

    // Create Zoom meeting
    const meetingPassword = zoomService.generateMeetingPassword();
    const zoomMeetingData = {
      topic: title,
      start_time: zoomService.formatDateForZoom(scheduledDateTime),
      duration: parseInt(duration),
      password: meetingPassword,
      agenda: description,
      settings: {
        waiting_room: waitingRoomEnabled,
        auto_recording: isRecordingEnabled ? "cloud" : "none",
        participant_video: true,
        host_video: true,
        mute_upon_entry: true,
      },
    };

    const zoomResult = await zoomService.createMeeting(zoomMeetingData);

    if (!zoomResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to create Zoom meeting",
          error: zoomResult.error,
        },
        { status: 500 }
      );
    }

    // Create live class in database
    // Calculate expiration date (24 hours after the scheduled end time)
    const scheduledEndTime = new Date(scheduledDateTime.getTime() + (parseInt(duration) * 60 * 1000));
    const expiresAt = new Date(scheduledEndTime.getTime() + (24 * 60 * 60 * 1000)); // 24 hours after end

    const liveClass = new LiveClass({
      title,
      description,
      course: courseId,
      instructor: user._id,
      scheduledDate: scheduledDateTime,
      duration: parseInt(duration),
      maxParticipants: parseInt(maxParticipants),
      isRecordingEnabled,
      waitingRoomEnabled,
      isPublic,
      zoomMeetingId: zoomResult.meeting.id,
      zoomJoinUrl: zoomResult.meeting.join_url,
      zoomStartUrl: zoomResult.meeting.start_url,
      zoomPassword: zoomResult.meeting.password,
      expiresAt: expiresAt,
    });

    await liveClass.save();

    // Populate course information for response
    await liveClass.populate("course", "courseTitle thumbnail");

    return NextResponse.json(
      {
        success: true,
        message: "Live class created successfully",
        data: liveClass,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Live class creation error:", error);
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
