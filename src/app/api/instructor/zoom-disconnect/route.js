import { NextResponse } from 'next/server';
import enhancedZoomService from '@/lib/services/enhancedZoomService';

export async function POST(request) {
  try {
    const { instructorId } = await request.json();

    if (!instructorId) {
      return NextResponse.json(
        { success: false, error: 'Instructor ID is required' },
        { status: 400 }
      );
    }

    const result = await enhancedZoomService.disconnectInstructorZoom(instructorId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Zoom account disconnected successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error disconnecting Zoom:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}