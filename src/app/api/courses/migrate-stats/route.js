import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import Course from '@/lib/models/Course';
import { calculateAndUpdateCourseStats } from '@/lib/utils/courseStats';

export async function POST(request) {
  try {
    await dbConnect();
    
    // Get all courses
    const courses = await Course.find({});
    let updatedCount = 0;
    let errorCount = 0;

    // Update each course's stats
    for (const course of courses) {
      try {
        const stats = await calculateAndUpdateCourseStats(course._id.toString());
        if (stats) {
          updatedCount++;
          console.log(`Updated course: ${course.courseTitle}`);
        } else {
          errorCount++;
          console.log(`Failed to update course: ${course.courseTitle}`);
        }
      } catch (error) {
        errorCount++;
        console.error(`Error updating course ${course.courseTitle}:`, error.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Course stats migration completed',
      data: {
        totalCourses: courses.length,
        updatedCourses: updatedCount,
        errorCourses: errorCount
      }
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { success: false, message: 'Migration failed', error: error.message },
      { status: 500 }
    );
  }
}