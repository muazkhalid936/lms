import { NextResponse } from 'next/server';
import { getInstructorPublicStats } from '@/lib/utils/instructorStats';

export async function GET(request, { params }) {
  try {
    const { instructorId } = await params;

    if (!instructorId) {
      return NextResponse.json(
        { success: false, message: 'Instructor ID is required' },
        { status: 400 }
      );
    }

    const stats = await getInstructorPublicStats(instructorId);

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Public instructor stats error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch instructor statistics',
        error: error.message 
      },
      { status: 500 }
    );
  }
}