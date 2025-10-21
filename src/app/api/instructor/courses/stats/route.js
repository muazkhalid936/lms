import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import Course from '@/lib/models/Course';
import Enrollment from '@/lib/models/Enrollment';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/utils/auth';

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

      // Only instructors can access course stats
      if (user.userType !== 'Instructor') {
        return NextResponse.json(
          { success: false, message: 'Access denied. Only instructors can view course statistics.' },
          { status: 403 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get all courses by this instructor with detailed information
    const instructorCourses = await Course.find({ 
      instructor: user._id 
    }).select('_id courseTitle isFreeCourse coursePrice hasDiscount discountPrice status createdAt totalStudents rating thumbnail');

    // Calculate course statistics
    const totalCourses = instructorCourses.length;
    let freeCourses = 0;
    let paidCourses = 0;
    let publishedCourses = 0;
    let draftCourses = 0;

    const courseDetails = await Promise.all(
      instructorCourses.map(async (course) => {
        // Count enrollments for this course
        const enrollmentCount = await Enrollment.countDocuments({
          course: course._id,
          status: { $in: ['active', 'completed'] }
        });

        // Categorize courses
        if (course.isFreeCourse) {
          freeCourses++;
        } else {
          paidCourses++;
        }

        if (course.status === 'published') {
          publishedCourses++;
        } else {
          draftCourses++;
        }

        return {
          id: course._id,
          title: course.courseTitle,
          type: course.isFreeCourse ? 'free' : 'paid',
          price: course.isFreeCourse ? 0 : (course.hasDiscount ? course.discountPrice : course.coursePrice),
          originalPrice: course.coursePrice,
          hasDiscount: course.hasDiscount,
          discountPrice: course.discountPrice,
          status: course.status,
          studentsEnrolled: enrollmentCount,
          totalStudents: course.totalStudents || 0,
          rating: course.rating?.average || 0,
          reviewCount: course.rating?.count || 0,
          thumbnail: course.thumbnail,
          createdAt: course.createdAt
        };
      })
    );

    // Sort courses by creation date (newest first)
    courseDetails.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalCourses,
          freeCourses,
          paidCourses,
          publishedCourses,
          draftCourses
        },
        courses: courseDetails,
        categorizedStats: {
          byType: {
            free: freeCourses,
            paid: paidCourses
          },
          byStatus: {
            published: publishedCourses,
            draft: draftCourses
          }
        }
      }
    });

  } catch (error) {
    console.error('Course stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}