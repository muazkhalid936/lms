import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import Earnings from '@/lib/models/Earnings';
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

      // Only instructors can view earnings
      if (user.userType !== 'Instructor') {
        return NextResponse.json(
          { success: false, message: 'Only instructors can view earnings' },
          { status: 403 }
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
    const limit = parseInt(searchParams.get('limit')) || 20;
    const status = searchParams.get('status');
    const payoutStatus = searchParams.get('payoutStatus');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query
    const query = { instructor: user._id };
    
    if (status) {
      query.status = status;
    }
    
    if (payoutStatus) {
      query.payoutStatus = payoutStatus;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get earnings with pagination
    const earnings = await Earnings.find(query)
      .populate([
        {
          path: 'student',
          select: 'firstName lastName email avatar'
        },
        {
          path: 'course',
          select: 'courseTitle thumbnail'
        }
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalEarnings = await Earnings.countDocuments(query);

    // Get summary statistics
    const stats = await Earnings.getInstructorTotalEarnings(user._id);

    return NextResponse.json({
      success: true,
      data: {
        earnings,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalEarnings / limit),
          totalItems: totalEarnings,
          hasNext: page < Math.ceil(totalEarnings / limit),
          hasPrev: page > 1
        },
        summary: stats
      }
    });

  } catch (error) {
    console.error('Earnings fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update payout status for earnings
export async function PUT(request) {
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

      // Only instructors and admins can update payout status
      if (!['Instructor', 'Admin'].includes(user.userType)) {
        return NextResponse.json(
          { success: false, message: 'Unauthorized to update payouts' },
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
    const { earningsIds, payoutStatus, payoutTransactionId, notes } = body;

    if (!earningsIds || !Array.isArray(earningsIds) || earningsIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Earnings IDs are required' },
        { status: 400 }
      );
    }

    if (!['pending', 'processed', 'failed'].includes(payoutStatus)) {
      return NextResponse.json(
        { success: false, message: 'Invalid payout status' },
        { status: 400 }
      );
    }

    // Build update object
    const updateData = {
      payoutStatus,
      updatedAt: new Date()
    };

    if (payoutStatus === 'processed') {
      updateData.payoutDate = new Date();
      if (payoutTransactionId) {
        updateData.payoutTransactionId = payoutTransactionId;
      }
    }

    if (notes) {
      updateData.notes = notes;
    }

    // Update earnings records
    // Only allow instructors to update their own earnings
    const query = user.userType === 'Admin' 
      ? { _id: { $in: earningsIds } }
      : { _id: { $in: earningsIds }, instructor: user._id };

    const result = await Earnings.updateMany(query, updateData);

    return NextResponse.json({
      success: true,
      message: `Updated ${result.modifiedCount} earnings records`,
      data: {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount
      }
    });

  } catch (error) {
    console.error('Earnings update error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}