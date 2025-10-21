import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import LiveClass from '@/lib/models/LiveClass';
import User from '@/lib/models/User';
import Enrollment from '@/lib/models/Enrollment';
import { verifyToken } from '@/lib/utils/auth';

// POST - Join live class (students only)
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

      // Students and instructors can join live classes
      if (user.userType !== 'Student' && user.userType !== 'Instructor') {
        return NextResponse.json(
          { success: false, message: 'Only students and instructors can join live classes' },
          { status: 403 }
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
      .populate('course', 'courseTitle')
      .populate('instructor', 'firstName lastName');

    if (!liveClass) {
      return NextResponse.json(
        { success: false, message: 'Live class not found' },
        { status: 404 }
      );
    }

    // Check if class is available to join
    if (liveClass.status !== 'live' && liveClass.status !== 'scheduled') {
      return NextResponse.json(
        { success: false, message: 'This class is not available to join' },
        { status: 400 }
      );
    }

    // Check access based on user type
    let hasAccess = false;

    if (user.userType === 'Instructor') {
      // Instructors can only join classes they created
      hasAccess = liveClass.instructor._id.toString() === user._id.toString();
      
      if (!hasAccess) {
        return NextResponse.json(
          { success: false, message: 'Instructors can only join classes they created' },
          { status: 403 }
        );
      }
    } else if (user.userType === 'Student') {
      // Check if student has access to the course
      const enrollment = await Enrollment.findOne({
        student: user._id,
        course: liveClass.course._id,
        status: 'active'
      });

      // Check if student is registered for this class or if it's a public class
      const isRegistered = liveClass.registeredStudents.some(
        reg => reg.student.toString() === user._id.toString()
      );

      hasAccess = enrollment || liveClass.isPublic || isRegistered;

      if (!hasAccess) {
        return NextResponse.json(
          { success: false, message: 'You do not have access to join this live class. Please enroll in the course or register for the class first.' },
          { status: 403 }
        );
      }
    }

    // Check if class is within joinable time window
    const now = new Date();
    const scheduledTime = new Date(liveClass.scheduledDate);
    const timeDiff = scheduledTime.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);

    // Allow joining if class is live or within 5 minutes of start time (up to 30 minutes after)
    const canJoin = liveClass.status === 'live' || 
                   (minutesDiff <= 5 && minutesDiff >= -30 && liveClass.status === 'scheduled');

    if (!canJoin) {
      return NextResponse.json(
        { success: false, message: 'This class is not available to join at this time' },
        { status: 400 }
      );
    }

    // Check if class has reached maximum participants (only for students)
    if (user.userType === 'Student' && liveClass.registeredStudents.length >= liveClass.maxParticipants) {
      return NextResponse.json(
        { success: false, message: 'This class has reached maximum capacity' },
        { status: 400 }
      );
    }

    // Handle registration for students only
    if (user.userType === 'Student') {
      // Check if student is already registered
      const isRegistered = liveClass.registeredStudents.some(
        reg => reg.student.toString() === user._id.toString()
      );

      // If student is not already registered, add them to registered students
      if (!isRegistered) {
        liveClass.registeredStudents.push({
          student: user._id,
          registeredAt: new Date()
        });
        await liveClass.save();
      }
    }

    // Return join URL (assuming it's stored in zoomJoinUrl or similar field)
    const meetingUrl = liveClass.zoomJoinUrl || liveClass.zoomStartUrl;

    if (!meetingUrl) {
      return NextResponse.json(
        { success: false, message: 'Meeting URL not available. Please contact the instructor.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully joined live class',
      data: {
        meetingUrl: meetingUrl,
        className: liveClass.title,
        instructor: `${liveClass.instructor.firstName} ${liveClass.instructor.lastName}`,
        scheduledDate: liveClass.scheduledDate
      }
    });

  } catch (error) {
    console.error('Live class join error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}