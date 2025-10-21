import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import { verifyAuth } from '@/lib/handlers/auth';
import Enrollment from '@/lib/models/Enrollment';
import LiveClass from '@/lib/models/LiveClass';
import Course from '@/lib/models/Course';
import User from '@/lib/models/User';

export async function GET(request) {
  try {
    await dbConnect();

    // Verify authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch student statistics
    const enrollments = await Enrollment.find({ 
      student: user._id 
    }).populate('course', 'courseTitle status');

    const totalCourses = enrollments.length;
    const activeCourses = enrollments.filter(enrollment => 
      enrollment.status === 'active'
    ).length;
    const completedCourses = enrollments.filter(enrollment => 
      enrollment.status === 'completed'
    ).length;

    const stats = {
      totalCourses,
      activeCourses,
      certificates: completedCourses // Using completed courses as certificates
    };

    // Fetch upcoming live classes only for courses the student is enrolled in
    const currentDate = new Date();

    // Build an array of enrolled course IDs
    const enrolledCourseIds = enrollments
      .map(e => e.course && e.course._id)
      .filter(Boolean);

    // If the student has no enrollments, return empty upcoming classes
    let upcomingLiveClasses = [];
    if (enrolledCourseIds.length > 0) {
      upcomingLiveClasses = await LiveClass.find({
        scheduledDate: { $gte: currentDate },
        status: { $in: ['scheduled', 'live'] },
        course: { $in: enrolledCourseIds }
      })
      .populate('instructor', 'firstName lastName userName')
      .populate('course', 'courseTitle')
      .sort({ scheduledDate: 1 })
      .limit(10);
    }

    // Transform live classes data to match the expected format
    const upcomingClasses = upcomingLiveClasses.map(liveClass => ({
      id: liveClass._id,
      title: liveClass.title,
      instructor: liveClass.instructor.firstName && liveClass.instructor.lastName 
        ? `${liveClass.instructor.firstName} ${liveClass.instructor.lastName}`
        : liveClass.instructor.userName,
      date: liveClass.scheduledDate.toISOString().split('T')[0],
      time: liveClass.scheduledDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      duration: `${liveClass.duration} minutes`,
      status: liveClass.status,
      courseTitle: liveClass.course?.courseTitle || 'N/A',
      meetingUrl: liveClass.meetingUrl,
      meetingId: liveClass.meetingId
    }));

    return NextResponse.json({
      success: true,
      data: {
        stats,
        upcomingClasses
      }
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}