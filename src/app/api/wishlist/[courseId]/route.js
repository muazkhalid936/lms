import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import Wishlist from '@/lib/models/Wishlist';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/utils/auth';

export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { courseId } = await params;

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

    // Check if course is in wishlist
    const wishlistItem = await Wishlist.findOne({
      user: user._id,
      course: courseId
    });

    return NextResponse.json({
      success: true,
      data: {
        isInWishlist: !!wishlistItem,
        wishlistItem: wishlistItem ? {
          _id: wishlistItem._id,
          addedAt: wishlistItem.addedAt,
          notes: wishlistItem.notes
        } : null
      }
    });

  } catch (error) {
    console.error('Check wishlist error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();

    const { courseId } = await params;

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