import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import LiveClass from '@/lib/models/LiveClass';
import User from '@/lib/models/User';
import Enrollment from '@/lib/models/Enrollment';
import { verifyToken } from '@/lib/utils/auth';
import { updateLiveClassStatuses } from '@/lib/utils/liveClassStatusUpdater';

// GET - Browse all available live classes for students to discover and register
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

      // Only students can browse live classes
      if (user.userType !== 'Student') {
        return NextResponse.json(
          { success: false, message: 'Access denied. Only students can browse live classes.' },
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
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    // Update live class statuses before fetching
    await updateLiveClassStatuses();

    // Build query for all live classes (not just registered or public)
    const query = {};

    // Add status filter if provided
    if (status === 'upcoming') {
      query.scheduledDate = { $gt: new Date() };
      query.status = { $in: ['scheduled', 'live'] };
    } else if (status === 'past') {
      query.status = 'completed';
    } else if (status === 'live') {
      query.status = 'live';
    } else {
      // Default to upcoming classes for browsing
      query.scheduledDate = { $gt: new Date() };
      query.status = { $in: ['scheduled', 'live'] };
    }

    // Get student's enrolled courses for access checking
    const enrollments = await Enrollment.find({
      student: user._id,
      status: 'active'
    }).select('course');
    
    const enrolledCourseIds = enrollments.map(enrollment => enrollment.course.toString());

    // Get live classes with course and instructor information
    const liveClasses = await LiveClass.find(query)
      .populate('course', 'courseTitle thumbnail')
      .populate('instructor', 'firstName lastName userName avatar')
      .sort({ scheduledDate: status === 'past' ? -1 : 1 })
      .skip(skip)
      .limit(limit);

    const total = await LiveClass.countDocuments(query);

    // Add registration status and access information for each class
    const classesWithStatus = liveClasses.map(liveClass => {
      const isRegistered = liveClass.registeredStudents.some(
        reg => reg.student.toString() === user._id.toString()
      );
      
      const isEnrolledInCourse = enrolledCourseIds.includes(liveClass.course._id.toString());
      const canRegister = !isRegistered && 
                         (liveClass.isPublic || isEnrolledInCourse) &&
                         liveClass.scheduledDate > new Date() &&
                         liveClass.status !== 'cancelled' &&
                         liveClass.registeredStudents.length < liveClass.maxParticipants;
      
      const classData = liveClass.toObject();
      
      // Add status information
      classData.isRegistered = isRegistered;
      classData.canRegister = canRegister;
      classData.isEnrolledInCourse = isEnrolledInCourse;
      classData.canJoin = isRegistered && (liveClass.status === 'live' || liveClass.status === 'scheduled');
      classData.registeredCount = liveClass.registeredStudents.length;
      classData.availableSpots = liveClass.maxParticipants - liveClass.registeredStudents.length;
      
      // Only include Agora channel info if student is registered
      if (!isRegistered) {
        delete classData.agoraChannelName;
        delete classData.agoraToken;
        delete classData.agoraAppId;
        delete classData.agoraUid;
      }
      
      // Always exclude instructor Agora info
      delete classData.agoraToken; // Token should be private to instructor
      
      return classData;
    });

    return NextResponse.json({
      success: true,
      data: {
        liveClasses: classesWithStatus,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Browse live classes error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}