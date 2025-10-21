import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import Enrollment from '@/lib/models/Enrollment';
import Course from '@/lib/models/Course';
import User from '@/lib/models/User';
import Earnings from '@/lib/models/Earnings';
import { verifyToken } from '@/lib/utils/auth';

export async function POST(request) {
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

      // Only students can enroll in courses
      if (user.userType !== 'Student') {
        return NextResponse.json(
          { success: false, message: 'Only students can enroll in courses' },
          { status: 403 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { courseId, paymentDetails } = body;

    if (!courseId) {
      return NextResponse.json(
        { success: false, message: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    // Log course details for debugging
    console.log('Course found:', {
      id: course._id,
      title: course.courseTitle,
      status: course.status,
      instructor: course.instructor
    });

    // Only allow enrollment for published courses
    if (course.status !== 'published') {
      return NextResponse.json(
        { success: false, message: `Course is not available for enrollment. Status: ${course.status}` },
        { status: 400 }
      );
    }

    // Check if student is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: user._id,
      course: courseId,
      status: { $in: ['active', 'completed'] }
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { success: false, message: 'You are already enrolled in this course' },
        { status: 400 }
      );
    }

    // Check if course has maximum student limit
    if (course.maxStudents) {
      const currentEnrollments = await Enrollment.countDocuments({
        course: courseId,
        status: { $in: ['active', 'completed'] }
      });

      if (currentEnrollments >= course.maxStudents) {
        return NextResponse.json(
          { success: false, message: 'Course is full. Maximum students limit reached.' },
          { status: 400 }
        );
      }
    }

    // Create enrollment record
    const enrollmentData = {
      student: user._id,
      course: courseId,
      status: 'active'
    };

    // Add payment details if provided (for paid courses)
    if (paymentDetails && !course.isFreeCourse) {
      enrollmentData.paymentDetails = {
        transactionId: paymentDetails.transactionId,
        amount: course.getFinalPrice(),
        paymentMethod: paymentDetails.paymentMethod,
        paymentStatus: paymentDetails.paymentStatus || 'completed',
        paidAt: new Date()
      };
    }

    const enrollment = new Enrollment(enrollmentData);
    await enrollment.save();

    // Create earnings record for instructor if this is a paid course
    if (!course.isFreeCourse && (paymentDetails || enrollmentData.paymentDetails)) {
      try {
        const coursePrice = course.getFinalPrice();
        const platformFeePercentage = 0.2; 
        const platformFee = coursePrice * platformFeePercentage;
        const instructorEarnings = coursePrice - platformFee;

        const earningsData = {
          instructor: course.instructor,
          student: user._id,
          course: courseId,
          enrollment: enrollment._id,
          amount: coursePrice,
          currency: 'USD',
          paymentMethod: paymentDetails?.paymentMethod || 'stripe',
          transactionId: paymentDetails?.transactionId || enrollmentData.paymentDetails?.transactionId || `enroll_${enrollment._id}`,
          stripePaymentIntentId: paymentDetails?.stripePaymentIntentId || null,
          status: 'completed',
          platformFee: platformFee,
          instructorEarnings: instructorEarnings,
          payoutStatus: 'pending',
          notes: `Earnings from course enrollment: ${course.courseTitle}`
        };

        const earnings = new Earnings(earningsData);
        await earnings.save();
        
        console.log(`Created earnings record for instructor ${course.instructor} - Amount: $${instructorEarnings}`);
      } catch (earningsError) {
        console.error('Error creating earnings record:', earningsError);
        // Don't fail the enrollment if earnings creation fails, just log it
      }
    }

    // Update course statistics
    await Course.findByIdAndUpdate(courseId, {
      $push: { 
        enrolledStudents: { 
          student: user._id, 
          enrolledAt: new Date() 
        } 
      },
      $inc: { totalStudents: 1 }
    });

    // Populate enrollment with course and student details
    await enrollment.populate([
      {
        path: 'course',
        select: 'courseTitle shortDescription thumbnail instructor rating totalLessons'
      },
      {
        path: 'student',
        select: 'firstName lastName userName email avatar'
      }
    ]);

    return NextResponse.json({
      success: true,
      message: 'Successfully enrolled in the course',
      data: enrollment
    }, { status: 201 });

  } catch (error) {
    console.error('Enrollment error:', error);

    // Handle duplicate enrollment error
    if (error.code === 11000) {
      // Check if it's the specific student-course duplicate
      if (error.keyPattern && error.keyPattern.student && error.keyPattern.course) {
        return NextResponse.json(
          { success: false, message: 'You are already enrolled in this course' },
          { status: 400 }
        );
      }
      // If it's the old single student index, provide a helpful message
      else if (error.keyPattern && error.keyPattern.student) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Database index error. Please contact support to resolve enrollment issues.',
            debug: 'Legacy student index conflict - needs database migration'
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get user's enrollments
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
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    // Build query
    const query = { student: user._id };
    if (status && ['active', 'completed', 'paused', 'cancelled'].includes(status)) {
      query.status = status;
    }

    // Get enrollments with course details
    const enrollments = await Enrollment.find(query)
      .populate({
        path: 'course',
        select: 'courseTitle shortDescription thumbnail coursePrice discountPrice hasDiscount isFreeCourse instructor rating totalLessons status',
        populate: {
          path: 'instructor',
          select: 'firstName lastName userName avatar'
        }
      })
      .sort({ enrolledAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Enrollment.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: {
        enrollments,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: enrollments.length,
          totalRecords: total
        }
      }
    });

  } catch (error) {
    console.error('Get enrollments error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}