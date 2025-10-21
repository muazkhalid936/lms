import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import Wishlist from '@/lib/models/Wishlist';
import Course from '@/lib/models/Course';
import User from '@/lib/models/User';
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
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { courseId, notes } = body;

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

    // Check if course is already in wishlist
    const existingWishlistItem = await Wishlist.findOne({
      user: user._id,
      course: courseId
    });

    if (existingWishlistItem) {
      return NextResponse.json(
        { success: false, message: 'Course is already in your wishlist' },
        { status: 400 }
      );
    }

    // Create wishlist item
    const wishlistItem = new Wishlist({
      user: user._id,
      course: courseId,
      notes: notes || ''
    });

    await wishlistItem.save();

    // Populate with course details
    await wishlistItem.populate({
      path: 'course',
      select: 'courseTitle shortDescription thumbnail coursePrice discountPrice hasDiscount isFreeCourse instructor rating',
      populate: {
        path: 'instructor',
        select: 'firstName lastName userName avatar'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Course added to wishlist successfully',
      data: wishlistItem
    }, { status: 201 });

  } catch (error) {
    console.error('Add to wishlist error:', error);

    // Handle duplicate wishlist error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'Course is already in your wishlist' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get user's wishlist
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
    const skip = (page - 1) * limit;

    // Get wishlist items with course details
    const wishlistItems = await Wishlist.find({ user: user._id })
      .populate({
        path: 'course',
        select: 'courseTitle shortDescription thumbnail coursePrice discountPrice hasDiscount isFreeCourse instructor rating status',
        populate: {
          path: 'instructor',
          select: 'firstName lastName userName avatar'
        }
      })
      .sort({ addedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Wishlist.countDocuments({ user: user._id });

    return NextResponse.json({
      success: true,
      data: {
        wishlist: wishlistItems,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: wishlistItems.length,
          totalRecords: total
        }
      }
    });

  } catch (error) {
    console.error('Get wishlist error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove from wishlist
export async function DELETE(request) {
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

    const body = await request.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json(
        { success: false, message: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Remove from wishlist
    const deletedItem = await Wishlist.findOneAndDelete({
      user: user._id,
      course: courseId
    });

    if (!deletedItem) {
      return NextResponse.json(
        { success: false, message: 'Course not found in wishlist' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Course removed from wishlist successfully'
    });

  } catch (error) {
    console.error('Remove from wishlist error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}