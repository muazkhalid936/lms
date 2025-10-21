import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import LiveClass from '@/lib/models/LiveClass';
import Course from '@/lib/models/Course';
import User from '@/lib/models/User';
import Enrollment from '@/lib/models/Enrollment';
import { verifyToken } from '@/lib/utils/auth';
import { updateLiveClassStatuses } from '@/lib/utils/liveClassStatusUpdater';

// GET - List live classes for students (registered classes and public classes)
export async function GET(request) {
  try {
    await dbConnect();

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

      // Only students can access this endpoint
      if (user.userType !== 'Student') {
        return NextResponse.json(
          { success: false, message: 'Access denied. Only students can access this endpoint.' },
          { status: 403 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'upcoming', 'past', 'live'

    // Update live class statuses before fetching
    await updateLiveClassStatuses();

    // Get all courses the student is enrolled in
    const enrollments = await Enrollment.find({
      student: user._id,
      status: { $in: ['active', 'completed'] }
    }).select('course');

    const enrolledCourseIds = enrollments.map(enrollment => enrollment.course);

    // Build query for all live classes from enrolled courses
    const query = {
      course: { $in: enrolledCourseIds }
    };

    // Add status filter if provided
    if (status === 'upcoming') {
      query.scheduledDate = { $gt: new Date() };
      query.status = { $in: ['scheduled', 'live'] };
    } else if (status === 'past') {
      query.status = 'completed';
    } else if (status === 'live') {
      query.status = 'live';
    }

    // Get live classes with course and instructor information
    const liveClasses = await LiveClass.find(query)
      .populate('course', 'courseTitle thumbnail')
      .populate('instructor', 'firstName lastName userName avatar')
      .sort({ scheduledDate: status === 'past' ? -1 : 1 });

    // Add registration status and join URL for each class
    const classesWithStatus = liveClasses.map(liveClass => {
      const isRegistered = liveClass.registeredStudents.some(
        reg => reg.student.toString() === user._id.toString()
      );
      
      const classData = liveClass.toObject();
      
      // Add registration status
      classData.isRegistered = isRegistered;
      classData.canJoin = isRegistered && (liveClass.status === 'live' || liveClass.status === 'scheduled');
      
      // Only include join URL if student is registered
      if (!isRegistered) {
        delete classData.zoomJoinUrl;
        delete classData.zoomPassword;
      }
      
      // Never include start URL for students
      delete classData.zoomStartUrl;
      
      return classData;
    });

    return NextResponse.json({
      success: true,
      data: classesWithStatus
    });

  } catch (error) {
    console.error('Student live classes fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}