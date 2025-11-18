import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import Course from '@/lib/models/Course';
import Enrollment from '@/lib/models/Enrollment';
import Earnings from '@/lib/models/Earnings';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/utils/auth';

// Platform fee configuration
const PLATFORM_FEE_PERCENTAGE = 0.20; // 20% platform fee

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const statsCache = new Map();

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

    // Check cache first
    const cacheKey = `instructor_stats_${user._id}`;
    const cachedData = statsCache.get(cacheKey);
    
    if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        data: cachedData.data,
        cached: true
      });
    }

    // Use MongoDB aggregation for efficient data retrieval
    const statsAggregation = await Course.aggregate([
      // Match instructor's courses
      { $match: { instructor: user._id } },
      
      // Lookup enrollments for each course
      {
        $lookup: {
          from: 'enrollments',
          localField: '_id',
          foreignField: 'course',
          as: 'enrollments',
          pipeline: [
            { $match: { status: { $in: ['active', 'completed'] } } }
          ]
        }
      },
      
      // Group to calculate totals
      {
        $group: {
          _id: null,
          totalCourses: { $sum: 1 },
          totalStudents: { $sum: { $size: '$enrollments' } },
          courses: {
            $push: {
              courseId: '$_id',
              courseTitle: '$courseTitle',
              isFreeCourse: '$isFreeCourse',
              coursePrice: '$coursePrice',
              hasDiscount: '$hasDiscount',
              discountPrice: '$discountPrice',
              enrollmentCount: { $size: '$enrollments' },
              enrollments: '$enrollments'
            }
          }
        }
      }
    ]);

    const stats = statsAggregation[0] || {
      totalCourses: 0,
      totalStudents: 0,
      courses: []
    };

    // Get earnings data efficiently using aggregation
    const earningsAggregation = await Earnings.aggregate([
      { $match: { instructor: user._id, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$instructorEarnings' },
          totalTransactions: { $sum: 1 },
          pendingPayout: {
            $sum: {
              $cond: [{ $eq: ['$payoutStatus', 'pending'] }, '$instructorEarnings', 0]
            }
          },
          processedPayout: {
            $sum: {
              $cond: [{ $eq: ['$payoutStatus', 'processed'] }, '$instructorEarnings', 0]
            }
          }
        }
      }
    ]);

    const earningsData = earningsAggregation[0] || {
      totalEarnings: 0,
      totalTransactions: 0,
      pendingPayout: 0,
      processedPayout: 0
    };

    // Get recent earnings (last 30 days) efficiently
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentEarningsAggregation = await Earnings.aggregate([
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
          recentEarnings: { $sum: '$instructorEarnings' },
          recentTransactions: { $sum: 1 }
        }
      }
    ]);

    const recentData = recentEarningsAggregation[0] || {
      recentEarnings: 0,
      recentTransactions: 0
    };

    // Get recent enrollments count efficiently
    const recentEnrollmentsCount = await Enrollment.countDocuments({
      course: { $in: stats.courses.map(c => c.courseId) },
      enrolledAt: { $gte: thirtyDaysAgo },
      status: { $in: ['active', 'completed'] }
    });

    // Calculate course-wise statistics efficiently
    const courseStats = stats.courses.map(course => {
      const coursePrice = course.isFreeCourse ? 0 : 
        (course.hasDiscount && course.discountPrice ? course.discountPrice : course.coursePrice);
      
      // Calculate earnings for this course
      let courseEarnings = 0;
      if (!course.isFreeCourse) {
        courseEarnings = course.enrollmentCount * coursePrice * (1 - PLATFORM_FEE_PERCENTAGE);
      }

      return {
        courseId: course.courseId,
        courseTitle: course.courseTitle,
        totalStudents: course.enrollmentCount,
        earnings: Math.round(courseEarnings * 100) / 100,
        price: coursePrice
      };
    });

    // Get monthly earnings efficiently
    const monthlyEarnings = await Earnings.aggregate([
      {
        $match: {
          instructor: user._id,
          status: 'completed',
          createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          earnings: { $sum: '$instructorEarnings' },
          enrollments: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $project: {
          month: {
            $concat: [
              {
                $arrayElemAt: [
                  ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                  { $subtract: ['$_id.month', 1] }
                ]
              },
              ' ',
              { $toString: '$_id.year' }
            ]
          },
          earnings: 1,
          enrollments: 1
        }
      }
    ]);

    // Prepare response data
    const responseData = {
      totalStudents: stats.totalStudents,
      totalCourses: stats.totalCourses,
      totalEarnings: Math.round(earningsData.totalEarnings * 100) / 100,
      recentEarnings: Math.round(recentData.recentEarnings * 100) / 100,
      recentEnrollments: recentEnrollmentsCount,
      courseStats,
      monthlyEarnings,
      period: '30 days',
      earningsBreakdown: {
        totalEarnings: Math.round(earningsData.totalEarnings * 100) / 100,
        totalTransactions: earningsData.totalTransactions,
        pendingPayout: Math.round(earningsData.pendingPayout * 100) / 100,
        processedPayout: Math.round(earningsData.processedPayout * 100) / 100,
        platformFeeDeducted: true
      }
    };

    // Cache the result
    statsCache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });

    // Clean up old cache entries periodically
    if (statsCache.size > 100) {
      const now = Date.now();
      for (const [key, value] of statsCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
          statsCache.delete(key);
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: responseData
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