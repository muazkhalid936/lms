import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import Course from '@/lib/models/Course';
import Chapter from '@/lib/models/Chapter';
import Lesson from '@/lib/models/Lesson';
import { calculateAndUpdateCourseStats } from '@/lib/utils/courseStats';

export async function POST(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    
    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if course has required content
    const chapters = await Chapter.find({ course: id });
    if (chapters.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Course must have at least one chapter' },
        { status: 400 }
      );
    }

    const lessons = await Lesson.find({ course: id });
    if (lessons.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Course must have at least one lesson' },
        { status: 400 }
      );
    }

    // Check if course has thumbnail
    if (!course.thumbnail || !course.thumbnail.url) {
      return NextResponse.json(
        { success: false, message: 'Course must have a thumbnail' },
        { status: 400 }
      );
    }

    // Calculate total duration and lessons
    const courseStats = await calculateAndUpdateCourseStats(id);
    if (!courseStats) {
      return NextResponse.json(
        { success: false, message: 'Failed to calculate course statistics' },
        { status: 500 }
      );
    }

    // Get updated course after stats calculation
    const updatedCourse = await Course.findById(id);
    
    // Update course status and publish
    updatedCourse.status = 'under_review'; // or 'published' based on your workflow
    updatedCourse.publishedAt = new Date();

    const publishedCourse = await updatedCourse.save();

    return NextResponse.json({
      success: true,
      message: 'Course submitted successfully for review',
      data: {
        status: publishedCourse.status,
        publishedAt: publishedCourse.publishedAt,
        totalLessons: publishedCourse.totalLessons,
        totalDuration: publishedCourse.totalDuration
      }
    });

  } catch (error) {
    console.error('Course publish error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}