import { NextResponse } from "next/server";
import dbConnect from "@/lib/utils/dbConnect";
import Course from "@/lib/models/Course";
import Chapter from "@/lib/models/Chapter";
import Lesson from "@/lib/models/Lesson";
import Quiz from "@/lib/models/Quiz";
import { uploadToS3 } from "@/lib/services/awsService";

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const {
      courseTitle,
      courseCategory,
      courseLevel,
      language,
      maxStudents,
      courseType,
      shortDescription,
      courseDescription,
      learningOutcomes,
      requirements,
      isFeatured,
      instructor,
      status = "draft", // Allow status to be set explicitly
    } = body;

    // Validation
    if (
      !courseTitle ||
      !courseCategory ||
      !courseLevel ||
      !language ||
      !courseType ||
      !shortDescription ||
      !courseDescription ||
      !instructor
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new course
    const course = new Course({
      courseTitle,
      courseCategory,
      courseLevel,
      language,
      maxStudents: maxStudents ? parseInt(maxStudents) : undefined,
      courseType,
      shortDescription,
      courseDescription,
      learningOutcomes: learningOutcomes || [],
      requirements: requirements || [],
      isFeatured: isFeatured || false,
      instructor,
      status: status || "published", // Default to published, or use provided status
    });

    const savedCourse = await course.save();

    return NextResponse.json(
      {
        success: true,
        message: "Course information saved successfully",
        data: savedCourse,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Course creation error:", error);
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

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const instructor = searchParams.get("instructor");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (instructor) query.instructor = instructor;
    if (status) query.status = status;

    // Get courses with pagination
    const courses = await Course.find(query)
      .populate("instructor")
      .populate({
        path: "chapters",
        populate: [
          {
            path: "lessons",
            options: { sort: { order: 1 } },
          },
          {
            path: "quizzes",
            options: { sort: { createdAt: 1 } },
          },
        ],
        options: { sort: { order: 1 } },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Course.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Courses fetch error:", error);
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
