import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import Enrollment from '@/lib/models/Enrollment';
import Course from '@/lib/models/Course';
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
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query for enrollments
    const query = { student: user._id };
    
    if (startDate || endDate) {
      query.enrolledAt = {};
      if (startDate) query.enrolledAt.$gte = new Date(startDate);
      if (endDate) query.enrolledAt.$lte = new Date(endDate);
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get user's enrollments (which represent their orders/purchases)
    let enrollmentQuery = Enrollment.find(query)
      .populate([
        {
          path: 'course',
          select: 'courseTitle thumbnail instructor isFreeCourse coursePrice hasDiscount discountPrice'
        }
      ])
      .sort({ enrolledAt: -1 })
      .skip(skip)
      .limit(limit);

    const enrollments = await enrollmentQuery;

    // Filter by status if provided
    let filteredEnrollments = enrollments;
    if (status) {
      const statusMap = {
        'completed': ['active', 'completed'],
        'pending': ['pending'],
        'cancelled': ['cancelled'],
        'processing': ['processing']
      };
      
      if (statusMap[status.toLowerCase()]) {
        filteredEnrollments = enrollments.filter(enrollment => 
          statusMap[status.toLowerCase()].includes(enrollment.status)
        );
      }
    }

    // Transform enrollments to order format
    const orders = filteredEnrollments.map(enrollment => {
      const course = enrollment.course;
      const orderAmount = enrollment.paymentDetails?.amount || 
                         (course.isFreeCourse ? 0 : 
                          (course.hasDiscount ? course.discountPrice : course.coursePrice));

      // Determine order status based on enrollment status and payment details
      let orderStatus = 'Completed';
      if (enrollment.status === 'pending') {
        orderStatus = 'Pending';
      } else if (enrollment.status === 'cancelled') {
        orderStatus = 'Cancelled';
      } else if (enrollment.paymentDetails?.paymentStatus === 'pending') {
        orderStatus = 'Processing';
      } else if (enrollment.paymentDetails?.paymentStatus === 'failed') {
        orderStatus = 'Failed';
      }

      return {
        id: enrollment._id,
        orderId: `#ORD${enrollment._id.toString().slice(-6).toUpperCase()}`,
        courseId: course._id,
        courseName: course.courseTitle,
        courseImage: course.thumbnail?.url || course.thumbnail || '/course/thumb1.png',
        instructorName: course.instructor?.firstName && course.instructor?.lastName 
          ? `${course.instructor.firstName} ${course.instructor.lastName}`
          : 'Unknown Instructor',
        amount: orderAmount,
        originalAmount: course.coursePrice,
        isFreeCourse: course.isFreeCourse,
        hasDiscount: course.hasDiscount,
        discountPrice: course.discountPrice,
        currency: 'USD',
        status: orderStatus,
        paymentMethod: enrollment.paymentDetails?.paymentMethod || (course.isFreeCourse ? 'Free' : 'N/A'),
        transactionId: enrollment.paymentDetails?.transactionId || null,
        enrolledAt: enrollment.enrolledAt,
        completedAt: enrollment.completedAt,
        progress: enrollment.progress || 0,
        enrollmentStatus: enrollment.status
      };
    });

    // Get total count for pagination
    const totalOrders = await Enrollment.countDocuments(query);

    // Calculate summary statistics
    const totalSpent = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
    const completedOrders = orders.filter(order => order.status === 'Completed').length;
    const pendingOrders = orders.filter(order => order.status === 'Pending').length;

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalOrders / limit),
          totalItems: totalOrders,
          hasNext: page < Math.ceil(totalOrders / limit),
          hasPrev: page > 1
        },
        summary: {
          totalOrders: totalOrders,
          totalSpent: Math.round(totalSpent * 100) / 100,
          completedOrders,
          pendingOrders,
          averageOrderValue: totalOrders > 0 ? Math.round((totalSpent / totalOrders) * 100) / 100 : 0
        }
      }
    });

  } catch (error) {
    console.error('Order history fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}