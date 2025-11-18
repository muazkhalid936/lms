import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import AuthService from '@/lib/services/authService';

export async function GET(request) {
  try {
    await dbConnect();
    
    // Import models after database connection is established
    const { default: Course } = await import('@/lib/models/Course');
    const { default: Enrollment } = await import('@/lib/models/Enrollment');

    // Use AuthService to verify instructor role
    const authResult = await AuthService.requireRole(request, 'Instructor');
    
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: authResult.status }
      );
    }

    const user = authResult.user;

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