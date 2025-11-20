import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import LiveClass from '@/lib/models/LiveClass';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/utils/auth';
import agoraService from '@/lib/services/agoraService';

// POST - Start live class (instructor only)
export async function POST(request, { params }) {
  try {
    await dbConnect();

    const { id } = await params;

    // Get authorization token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token and get user info
    let user;
    try {
      const payload = await verifyToken(token);
      user = await User.findById(payload.userId);
      
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }

      // Only instructors can start live classes
      if (user.userType !== 'Instructor') {
        return NextResponse.json(
          { success: false, message: 'Only instructors can start live classes' },
          { status: 403 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Find live class and verify ownership
    const liveClass = await LiveClass.findOne({
      _id: id,
      instructor: user._id
    }).populate('course', 'courseTitle');

    if (!liveClass) {
      return NextResponse.json(
        { success: false, message: 'Live class not found or not accessible' },
        { status: 404 }
      );
    }

    // Check if class is cancelled
    if (liveClass.status === 'cancelled') {
      return NextResponse.json(
        { success: false, message: 'Cannot start a cancelled class' },
        { status: 400 }
      );
    }

    // Check if class is already completed
    if (liveClass.status === 'completed') {
      return NextResponse.json(
        { success: false, message: 'Class is already completed' },
        { status: 400 }
      );
    }

    // Update class status to live
    liveClass.status = 'live';
    liveClass.actualStartTime = new Date();
    
    // If this is the first time starting, set the started flag
    if (!liveClass.hasStarted) {
      liveClass.hasStarted = true;
    }

    await liveClass.save();

    // Get Agora channel details to ensure it's still valid
    const agoraChannelResult = await agoraService.getChannel(liveClass.agoraChannelName);
    
    if (!agoraChannelResult.success) {
      console.warn('Could not fetch Agora channel details:', agoraChannelResult.error);
    }

    return NextResponse.json({
      success: true,
      message: 'Live class started successfully',
      data: {
        liveClassId: liveClass._id,
        title: liveClass.title,
        course: liveClass.course,
        status: liveClass.status,
        actualStartTime: liveClass.actualStartTime,
        agoraChannelName: liveClass.agoraChannelName,
        agoraToken: liveClass.agoraToken,
        agoraAppId: liveClass.agoraAppId,
        agoraUid: liveClass.agoraUid,
        registeredStudentsCount: liveClass.registeredStudents.length
      }
    });

  } catch (error) {
    console.error('Live class start error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

// PUT - End live class (instructor only)
export async function PUT(request, { params }) {
  try {
    await dbConnect();

    const { id } = await params;

    // Get authorization token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token and get user info
    let user;
    try {
      const payload = await verifyToken(token);
      user = await User.findById(payload.userId);
      
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }

      // Only instructors can end live classes
      if (user.userType !== 'Instructor') {
        return NextResponse.json(
          { success: false, message: 'Only instructors can end live classes' },
          { status: 403 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Find live class and verify ownership
    const liveClass = await LiveClass.findOne({
      _id: id,
      instructor: user._id
    });

    if (!liveClass) {
      return NextResponse.json(
        { success: false, message: 'Live class not found or not accessible' },
        { status: 404 }
      );
    }

    // Check if class is currently live
    if (liveClass.status !== 'live') {
      return NextResponse.json(
        { success: false, message: 'Class is not currently live' },
        { status: 400 }
      );
    }

    // Get channel participants before ending (Agora doesn't have built-in recording/participants like Zoom)
    // For now, we'll just update the basic class info
    // In a real implementation, you might integrate with Agora's RTM or analytics APIs
    try {
      // Placeholder for future Agora RTM integration to get participants
      // For now, we'll keep the existing attendees data if any
      console.log('Class ending - Agora channel:', liveClass.agoraChannelName);
    } catch (error) {
      console.warn('Error fetching channel data:', error);
    }

    // Update class status to completed
    liveClass.status = 'completed';
    liveClass.actualEndTime = new Date();
    
    // Calculate actual duration
    if (liveClass.actualStartTime) {
      liveClass.actualDuration = Math.round(
        (liveClass.actualEndTime - liveClass.actualStartTime) / (1000 * 60)
      ); // Duration in minutes
    }

    await liveClass.save();

    return NextResponse.json({
      success: true,
      message: 'Live class ended successfully',
      data: {
        liveClassId: liveClass._id,
        status: liveClass.status,
        actualEndTime: liveClass.actualEndTime,
        actualDuration: liveClass.actualDuration,
        attendeesCount: liveClass.attendees.length,
        recordingAvailable: !!liveClass.recordingUrl
      }
    });

  } catch (error) {
    console.error('Live class end error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}