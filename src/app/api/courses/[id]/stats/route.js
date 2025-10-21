import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import Course from '@/lib/models/Course';
import { calculateAndUpdateCourseStats, formatDuration } from '@/lib/utils/courseStats';

export async function PUT(request, { params }) {
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

    // Calculate and update course stats
    const stats = await calculateAndUpdateCourseStats(id);
    if (!stats) {
      return NextResponse.json(
        { success: false, message: 'Failed to calculate course stats' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Course stats updated successfully',
      data: {
        totalLessons: stats.totalLessons,
        totalDuration: stats.totalDuration,
        formattedDuration: formatDuration(stats.totalDuration)
      }
    });

  } catch (error) {
    console.error('Course stats update error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
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

    // Get course overview
    const overview = {
      totalLessons: course.totalLessons || 0,
      totalDuration: formatDuration(course.totalDuration),
      totalStudents: course.totalStudents || 0,
      rating: course.rating || { average: 0, count: 0 }
    };

    return NextResponse.json({
      success: true,
      data: overview
    });

  } catch (error) {
    console.error('Course stats fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}