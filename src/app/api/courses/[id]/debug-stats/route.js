import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import Course from '@/lib/models/Course';
import Lesson from '@/lib/models/Lesson';
import { calculateAndUpdateCourseStats } from '@/lib/utils/courseStats';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    
    // Get course info
    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    // Get all lessons for debugging
    const lessons = await Lesson.find({ course: id });
    
    // Current stats before calculation
    const currentStats = {
      currentTotalLessons: course.totalLessons,
      currentTotalDuration: course.totalDuration,
      actualLessonsInDB: lessons.length,
      lessonDetails: lessons.map(lesson => ({
        id: lesson._id,
        title: lesson.title,
        duration: lesson.duration,
        course: lesson.course
      }))
    };

    // Try to update stats
    const updatedStats = await calculateAndUpdateCourseStats(id);
    
    // Get updated course
    const updatedCourse = await Course.findById(id);

    return NextResponse.json({
      success: true,
      debug: {
        courseId: id,
        courseTitle: course.courseTitle,
        beforeUpdate: currentStats,
        calculationResult: updatedStats,
        afterUpdate: {
          totalLessons: updatedCourse.totalLessons,
          totalDuration: updatedCourse.totalDuration
        }
      }
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { success: false, message: 'Debug failed', error: error.message },
      { status: 500 }
    );
  }
}