import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import User from '@/lib/models/User';
import Course from '@/lib/models/Course';
import Enrollment from '@/lib/models/Enrollment';

export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Instructor ID is required' },
        { status: 400 }
      );
    }

    // Get instructor basic information
    const instructor = await User.findOne({ 
      _id: id,
      userType: 'Instructor',
      isVerified: true 
    }).select('firstName lastName userName email phoneNumber avatar bio experience education');

    if (!instructor) {
      return NextResponse.json(
        { success: false, message: 'Instructor not found' },
        { status: 404 }
      );
    }

    // Get instructor's published courses
    const courses = await Course.find({ 
      instructor: instructor._id,
      status: 'published'
    }).select('_id courseTitle');

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

    // Format instructor data
    const instructorData = {
      id: instructor._id,
      name: `${instructor.firstName} ${instructor.lastName}`.trim() || instructor.userName,
      firstName: instructor.firstName,
      lastName: instructor.lastName,
      userName: instructor.userName,
      email: instructor.email,
      role: role,
      avatar: instructor.avatar || '/dashboard/avatar.png',
      bio: instructor.bio || '',
      experience: instructor.experience || [],
      education: instructor.education || [],
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      reviews: totalReviews,
      totalCourses: totalCourses,
      phoneNumber: instructor.phoneNumber || '',
      totalStudents: totalStudents,
      level: level,
      lessons: totalCourses * 8, // Estimate based on courses
      students: totalStudents
    };

    return NextResponse.json({
      success: true,
      data: instructorData
    });

  } catch (error) {
    console.error('Get instructor error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch instructor data',
        error: error.message 
      },
      { status: 500 }
    );
  }
}