import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import Course from '@/lib/models/Course';
import Enrollment from '@/lib/models/Enrollment';
import Earnings from '@/lib/models/Earnings';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/utils/auth';

// Platform fee configuration
const PLATFORM_FEE_PERCENTAGE = 0.20; // 20% platform fee

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

      // Only instructors can access instructor stats
      if (user.userType !== 'Instructor') {
        return NextResponse.json(
          { success: false, message: 'Access denied. Only instructors can view these stats.' },
          { status: 403 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get all courses by this instructor
    const instructorCourses = await Course.find({ 
      instructor: user._id 
    }).select('_id courseTitle isFreeCourse coursePrice hasDiscount discountPrice');

    const courseIds = instructorCourses.map(course => course._id);

    // Get total number of courses
    const totalCourses = instructorCourses.length;

    // Get all enrollments for instructor's courses
    const enrollments = await Enrollment.find({
      course: { $in: courseIds },
      status: { $in: ['active', 'completed'] }
    }).populate('course', 'isFreeCourse coursePrice hasDiscount discountPrice');

    // Calculate total students (unique enrollments)
    const totalStudents = enrollments.length;

    // Calculate total earnings using the Earnings model for more accurate tracking
    const earningsStats = await Earnings.getInstructorTotalEarnings(user._id);
    const totalEarnings = earningsStats.totalEarnings;

    // Get legacy earnings calculation for backwards compatibility (with platform fee deduction)
    let legacyTotalEarnings = 0;
    
    enrollments.forEach(enrollment => {
      if (enrollment.paymentDetails && enrollment.paymentDetails.paymentStatus === 'completed') {
        const grossAmount = enrollment.paymentDetails.amount || 0;
        const netAmount = grossAmount * (1 - PLATFORM_FEE_PERCENTAGE);
        legacyTotalEarnings += netAmount;
      } else if (enrollment.course && !enrollment.course.isFreeCourse) {
        // For completed enrollments without payment details, use course price with platform fee deduction
        const coursePrice = enrollment.course.hasDiscount && enrollment.course.discountPrice 
          ? enrollment.course.discountPrice 
          : enrollment.course.coursePrice;
        const netAmount = (coursePrice || 0) * (1 - PLATFORM_FEE_PERCENTAGE);
        legacyTotalEarnings += netAmount;
      }
    });

    // Use the higher of the two calculations (earnings model should be more accurate)
    const finalTotalEarnings = Math.max(totalEarnings, legacyTotalEarnings);

    // Calculate recent earnings using Earnings model
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentEarningsFromModel = await Earnings.aggregate([
      {
        $match: {
          instructor: user._id,
          status: 'completed',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$instructorEarnings' },
          totalTransactions: { $sum: 1 }
        }
      }
    ]);

    const recentEarnings = recentEarningsFromModel[0]?.totalEarnings || 0;
    const recentTransactions = recentEarningsFromModel[0]?.totalTransactions || 0;

    // Get recent enrollments for backwards compatibility
    const recentEnrollments = await Enrollment.find({
      course: { $in: courseIds },
      enrolledAt: { $gte: thirtyDaysAgo },
      status: { $in: ['active', 'completed'] }
    }).populate('course', 'isFreeCourse coursePrice hasDiscount discountPrice');

    // Calculate legacy recent earnings (with platform fee deduction)
    let legacyRecentEarnings = 0;
    recentEnrollments.forEach(enrollment => {
      if (enrollment.paymentDetails && enrollment.paymentDetails.paymentStatus === 'completed') {
        const grossAmount = enrollment.paymentDetails.amount || 0;
        const netAmount = grossAmount * (1 - PLATFORM_FEE_PERCENTAGE);
        legacyRecentEarnings += netAmount;
      } else if (enrollment.course && !enrollment.course.isFreeCourse) {
        const coursePrice = enrollment.course.hasDiscount && enrollment.course.discountPrice 
          ? enrollment.course.discountPrice 
          : enrollment.course.coursePrice;
        const netAmount = (coursePrice || 0) * (1 - PLATFORM_FEE_PERCENTAGE);
        legacyRecentEarnings += netAmount;
      }
    });

    const finalRecentEarnings = Math.max(recentEarnings, legacyRecentEarnings);

    // Get course-wise statistics
    const courseStats = await Promise.all(
      instructorCourses.map(async (course) => {
        const courseEnrollments = await Enrollment.countDocuments({
          course: course._id,
          status: { $in: ['active', 'completed'] }
        });

        const courseEarnings = enrollments
          .filter(enrollment => enrollment.course._id.toString() === course._id.toString())
          .reduce((total, enrollment) => {
            if (enrollment.paymentDetails && enrollment.paymentDetails.paymentStatus === 'completed') {
              const grossAmount = enrollment.paymentDetails.amount || 0;
              const netAmount = grossAmount * (1 - PLATFORM_FEE_PERCENTAGE);
              return total + netAmount;
            } else if (!course.isFreeCourse) {
              const coursePrice = course.hasDiscount && course.discountPrice 
                ? course.discountPrice 
                : course.coursePrice;
              const netAmount = (coursePrice || 0) * (1 - PLATFORM_FEE_PERCENTAGE);
              return total + netAmount;
            }
            return total;
          }, 0);

        return {
          courseId: course._id,
          courseTitle: course.courseTitle,
          totalStudents: courseEnrollments,
          earnings: courseEarnings,
          price: course.isFreeCourse ? 0 : (course.hasDiscount && course.discountPrice ? course.discountPrice : course.coursePrice)
        };
      })
    );

    // Calculate monthly earnings for the chart using Earnings model
    const monthlyEarnings = await Earnings.getMonthlyEarnings(user._id, 12);

    return NextResponse.json({
      success: true,
      data: {
        totalStudents,
        totalCourses,
        totalEarnings: Math.round(finalTotalEarnings * 100) / 100, // Round to 2 decimal places
        recentEarnings: Math.round(finalRecentEarnings * 100) / 100,
        recentEnrollments: recentEnrollments.length,
        courseStats,
        monthlyEarnings,
        period: '30 days',
        earningsBreakdown: {
          totalEarnings: Math.round(finalTotalEarnings * 100) / 100,
          totalTransactions: earningsStats.totalTransactions,
          pendingPayout: earningsStats.pendingPayout,
          processedPayout: earningsStats.processedPayout,
          platformFeeDeducted: true
        }
      }
    });

  } catch (error) {
    console.error('Instructor stats error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch instructor statistics',
        error: error.message 
      },
      { status: 500 }
    );
  }
}