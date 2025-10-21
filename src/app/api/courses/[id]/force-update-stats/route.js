import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import Course from '@/lib/models/Course';
import { calculateAndUpdateCourseStats } from '@/lib/utils/courseStats';

export async function POST(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    
    console.log('🔧 Force updating stats for course:', id);
    
    // Force update the stats
    const result = await calculateAndUpdateCourseStats(id);
    
    if (result) {
      // Get the updated course to verify
      const updatedCourse = await Course.findById(id);
      
      return NextResponse.json({
        success: true,
        message: 'Stats updated successfully',
        data: {
          totalLessons: updatedCourse.totalLessons,
          totalDuration: updatedCourse.totalDuration,
          calculationResult: result
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to calculate stats'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Force update error:', error);
    return NextResponse.json(
      { success: false, message: 'Force update failed', error: error.message },
      { status: 500 }
    );
  }
}