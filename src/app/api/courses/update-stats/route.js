import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import Course from '@/lib/models/Course';
import { calculateAndUpdateCourseStats } from '@/lib/utils/courseStats';

// Update stats for all courses or specific course
export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { courseId, updateAll = false } = body;

    if (!updateAll && !courseId) {
      return NextResponse.json(
        { success: false, message: 'Either courseId or updateAll flag is required' },
        { status: 400 }
      );
    }

    let coursesToUpdate = [];
    
    if (updateAll) {
      // Get all courses
      coursesToUpdate = await Course.find({}, '_id courseTitle');
    } else {
      // Get specific course
      const course = await Course.findById(courseId, '_id courseTitle');
      if (!course) {
        return NextResponse.json(
          { success: false, message: 'Course not found' },
          { status: 404 }
        );
      }
      coursesToUpdate = [course];
    }

    let successCount = 0;
    let failureCount = 0;
    const errors = [];

    // Update stats for each course
    for (const course of coursesToUpdate) {
      try {
        await calculateAndUpdateCourseStats(course._id);
        successCount++;
        console.log(`✅ Updated stats for course: ${course.courseTitle}`);
      } catch (error) {
        failureCount++;
        errors.push({
          courseId: course._id,
          courseTitle: course.courseTitle,
          error: error.message
        });
        console.error(`❌ Failed to update stats for course: ${course.courseTitle}`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Course stats update completed. Success: ${successCount}, Failures: ${failureCount}`,
      data: {
        totalCourses: coursesToUpdate.length,
        successCount,
        failureCount,
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error) {
    console.error('Bulk course stats update error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}