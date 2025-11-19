import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import User from '@/lib/models/User';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const instructorId = searchParams.get('instructorId');

    if (!instructorId) {
      return NextResponse.json(
        { success: false, error: 'Instructor ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();
    const instructor = await User.findById(instructorId).select(
      'isZoomConnected zoomUserName zoomUserEmail zoomConnectedAt zoomTokenExpiry'
    );

    if (!instructor) {
      return NextResponse.json(
        { success: false, error: 'Instructor not found' },
        { status: 404 }
      );
    }

    const isConnected = instructor.isZoomConnected && 
                       instructor.zoomTokenExpiry && 
                       new Date() < instructor.zoomTokenExpiry;

    return NextResponse.json({
      success: true,
      isConnected,
      connectionData: isConnected ? {
        zoomUserName: instructor.zoomUserName,
        zoomUserEmail: instructor.zoomUserEmail,
        connectedAt: instructor.zoomConnectedAt,
        tokenExpiry: instructor.zoomTokenExpiry
      } : null
    });

  } catch (error) {
    console.error('Error checking Zoom status:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}