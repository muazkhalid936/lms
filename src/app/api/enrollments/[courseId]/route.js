import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import Enrollment from '@/lib/models/Enrollment';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/utils/auth';

export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { courseId } = await params;

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

    // Check enrollment status
    const enrollment = await Enrollment.findOne({
      student: user._id,
      course: courseId
    }).populate({
      path: 'course',
      select: 'courseTitle totalLessons'
    });

    if (!enrollment) {
      return NextResponse.json({
        success: true,
        data: {
          isEnrolled: false,
          enrollment: null
        }
      });
    }

    // Calculate current progress
    await enrollment.calculateProgress();
    await enrollment.save();

    return NextResponse.json({
      success: true,
      data: {
        isEnrolled: true,
        enrollment: {
          _id: enrollment._id,
          status: enrollment.status,
          progress: enrollment.progress,
          enrolledAt: enrollment.enrolledAt,
          completedAt: enrollment.completedAt,
          completedLessons: enrollment.completedLessons.length,
          totalLessons: enrollment.course?.totalLessons || 0
        }
      }
    });

  } catch (error) {
    console.error('Check enrollment error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}