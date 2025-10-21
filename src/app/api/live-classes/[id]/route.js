import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import LiveClass from '@/lib/models/LiveClass';
import Course from '@/lib/models/Course';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/utils/auth';
import zoomService from '@/lib/services/zoomService';

// GET - Get specific live class details
export async function GET(request, { params }) {
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
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Find live class
    const liveClass = await LiveClass.findById(id)
      .populate('course', 'courseTitle thumbnail')
      .populate('instructor', 'firstName lastName userName avatar')
      .populate('registeredStudents.student', 'firstName lastName userName avatar');

    if (!liveClass) {
      return NextResponse.json(
        { success: false, message: 'Live class not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    const isInstructor = user.userType === 'Instructor' && liveClass.instructor._id.toString() === user._id.toString();
    const isEnrolledStudent = user.userType === 'Student' && liveClass.registeredStudents.some(
      reg => reg.student._id.toString() === user._id.toString()
    );
    const isPublicClass = liveClass.isPublic;

    if (!isInstructor && !isEnrolledStudent && !isPublicClass) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    // For students, hide sensitive information
    if (user.userType === 'Student') {
      liveClass.zoomStartUrl = undefined;
    }

    return NextResponse.json({
      success: true,
      data: liveClass
    });

  } catch (error) {
    console.error('Live class fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update live class
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

      // Only instructors can update live classes
      if (user.userType !== 'Instructor') {
        return NextResponse.json(
          { success: false, message: 'Access denied. Only instructors can update live classes.' },
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

    // Check if class has already started
    if (liveClass.status === 'live' || liveClass.status === 'completed') {
      return NextResponse.json(
        { success: false, message: 'Cannot update live or completed classes' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      scheduledDate,
      duration,
      maxParticipants,
      isRecordingEnabled,
      waitingRoomEnabled,
      isPublic
    } = body;

    // Validate scheduled date if provided
    if (scheduledDate) {
      const scheduledDateTime = new Date(scheduledDate);
      // Only require future dates for scheduled classes, allow updates for live/completed classes
      if (scheduledDateTime <= new Date() && liveClass.status === 'scheduled') {
        return NextResponse.json(
          { success: false, message: 'Scheduled date must be in the future' },
          { status: 400 }
        );
      }
    }

    // Update Zoom meeting if necessary
    const needsZoomUpdate = title || description || scheduledDate || duration || 
                           isRecordingEnabled !== undefined || waitingRoomEnabled !== undefined;

    if (needsZoomUpdate) {
      const updateData = {};
      
      if (title) updateData.topic = title;
      if (description) updateData.agenda = description;
      if (scheduledDate) updateData.start_time = zoomService.formatDateForZoom(new Date(scheduledDate));
      if (duration) updateData.duration = parseInt(duration);
      
      if (isRecordingEnabled !== undefined || waitingRoomEnabled !== undefined) {
        updateData.settings = {
          waiting_room: waitingRoomEnabled !== undefined ? waitingRoomEnabled : liveClass.waitingRoomEnabled,
          auto_recording: (isRecordingEnabled !== undefined ? isRecordingEnabled : liveClass.isRecordingEnabled) ? 'cloud' : 'none'
        };
      }

      const zoomResult = await zoomService.updateMeeting(liveClass.zoomMeetingId, updateData);
      
      if (!zoomResult.success) {
        return NextResponse.json(
          { success: false, message: 'Failed to update Zoom meeting', error: zoomResult.error },
          { status: 500 }
        );
      }
    }

    // Update live class in database
    const updateFields = {};
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;
    if (scheduledDate) updateFields.scheduledDate = new Date(scheduledDate);
    if (duration) updateFields.duration = parseInt(duration);
    if (maxParticipants) updateFields.maxParticipants = parseInt(maxParticipants);
    if (isRecordingEnabled !== undefined) updateFields.isRecordingEnabled = isRecordingEnabled;
    if (waitingRoomEnabled !== undefined) updateFields.waitingRoomEnabled = waitingRoomEnabled;
    if (isPublic !== undefined) updateFields.isPublic = isPublic;

    // Recalculate expiresAt if scheduledDate or duration changed
    if (scheduledDate || duration) {
      const newScheduledDate = scheduledDate ? new Date(scheduledDate) : liveClass.scheduledDate;
      const newDuration = duration ? parseInt(duration) : liveClass.duration;
      const scheduledEndTime = new Date(newScheduledDate.getTime() + (newDuration * 60 * 1000));
      updateFields.expiresAt = new Date(scheduledEndTime.getTime() + (24 * 60 * 60 * 1000)); // 24 hours after end
    }

    const updatedLiveClass = await LiveClass.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    ).populate('course', 'courseTitle thumbnail');

    return NextResponse.json({
      success: true,
      message: 'Live class updated successfully',
      data: updatedLiveClass
    });

  } catch (error) {
    console.error('Live class update error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete live class
export async function DELETE(request, { params }) {
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

      // Only instructors can delete live classes
      if (user.userType !== 'Instructor') {
        return NextResponse.json(
          { success: false, message: 'Access denied. Only instructors can delete live classes.' },
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
    if (liveClass.status === 'live') {
      return NextResponse.json(
        { success: false, message: 'Cannot delete a live class that is currently in progress' },
        { status: 400 }
      );
    }

    // Delete Zoom meeting
    const zoomResult = await zoomService.deleteMeeting(liveClass.zoomMeetingId);
    
    if (!zoomResult.success) {
      console.warn('Failed to delete Zoom meeting:', zoomResult.error);
      // Continue with database deletion even if Zoom deletion fails
    }

    // Delete live class from database
    await LiveClass.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Live class deleted successfully'
    });

  } catch (error) {
    console.error('Live class deletion error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}