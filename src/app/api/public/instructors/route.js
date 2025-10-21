import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import User from '@/lib/models/User';
import Course from '@/lib/models/Course';
import Enrollment from '@/lib/models/Enrollment';

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;

    // Get all instructors with their basic information
    const instructors = await User.find({ 
      userType: 'Instructor',
      isVerified: true 
    })
    .select('firstName lastName userName email avatar bio experience education')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
    console.log(instructors)

    const total = await User.countDocuments({ 
      userType: 'Instructor',
      isVerified: true 
    });

    // Get additional stats for each instructor
    const instructorsWithStats = await Promise.all(
      instructors.map(async (instructor) => {
        // Get instructor's published courses
        const courses = await Course.find({ 
          instructor: instructor._id,
          status: 'published'
        }).select('_id');

        const courseIds = courses.map(course => course._id);
        const totalCourses = courses.length;

        // Get total students (enrollments)
        const totalStudents = await Enrollment.countDocuments({
          course: { $in: courseIds },
          status: { $in: ['active', 'completed'] }
        });

        // Calculate average rating from courses
        const coursesWithRatings = await Course.find({
          instructor: instructor._id,
          status: 'published',
          'rating.count': { $gt: 0 }
        }).select('rating');

        let averageRating = 0;
        let totalReviews = 0;

        if (coursesWithRatings.length > 0) {
          const totalRatingSum = coursesWithRatings.reduce((sum, course) => {
            totalReviews += course.rating.count || 0;
            return sum + ((course.rating.average || 0) * (course.rating.count || 0));
          }, 0);
          
          if (totalReviews > 0) {
            averageRating = totalRatingSum / totalReviews;
          }
        }

        // Determine instructor level based on courses and students
        let level = 'beginner';
        if (totalCourses >= 5 && totalStudents >= 100) {
          level = 'expert';
        } else if (totalCourses >= 2 && totalStudents >= 20) {
          level = 'advance';
        }

        // Get primary specialization from experience or default
        let role = 'Instructor';
        if (instructor.experience && instructor.experience.length > 0) {
          role = instructor.experience[0].position || 'Instructor';
        }

        return {
          id: instructor._id,
          name: `${instructor.firstName} ${instructor.lastName}`.trim() || instructor.userName,
          role: role,
          avatar: instructor.avatar || '/dashboard/avatar.png',
          bio: instructor.bio || '',
          rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
          reviews: totalReviews,
          students: totalStudents,
          courses: totalCourses,
          level: level,
          experience: instructor.experience || [],
          education: instructor.education || []
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: instructorsWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching instructors:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch instructors',
        error: error.message 
      },
      { status: 500 }
    );
  }
}