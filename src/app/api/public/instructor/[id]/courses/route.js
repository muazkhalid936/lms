import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import User from '@/lib/models/User';
import Course from '@/lib/models/Course';
import Enrollment from '@/lib/models/Enrollment';

export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Instructor ID is required' },
        { status: 400 }
      );
    }

    // Verify instructor exists
    const instructor = await User.findOne({ 
      _id: id,
      userType: 'Instructor',
      isVerified: true 
    });

    if (!instructor) {
      return NextResponse.json(
        { success: false, message: 'Instructor not found' },
        { status: 404 }
      );
    }

    // Get instructor's published courses with pagination
    const courses = await Course.find({ 
      instructor: instructor._id,
      status: 'published'
    })
    .select('courseTitle courseDescription thumbnail coursePrice discountPrice hasDiscount rating category createdAt')
    .populate('instructor')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

    const total = await Course.countDocuments({ 
      instructor: instructor._id,
      status: 'published'
    });

    // Get enrollment count for each course
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const enrollmentCount = await Enrollment.countDocuments({
          course: course._id,
          status: { $in: ['active', 'completed'] }
        });

        return {
          id: course._id,
          title: course.courseTitle,
          description: course.courseDescription,
          image: course.thumbnail?.url || course.thumbnail || '/course/thumb1.png',
          price: course.hasDiscount ? course.discountPrice : course.coursePrice,
          originalPrice: course.hasDiscount ? course.coursePrice : null,
          rating: course.rating?.average || 0,
          reviews: course.rating?.count || 0,
          category: course.category || 'General',
          instructorAvatar: instructor.avatar || '/dashboard/avatar.png',
          instructor: `${instructor.firstName} ${instructor.lastName}`.trim() || instructor.userName,
          instructorRole: 'Instructor',
          enrollments: enrollmentCount,
          createdAt: course.createdAt
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: coursesWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get instructor courses error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch instructor courses',
        error: error.message 
      },
      { status: 500 }
    );
  }
}