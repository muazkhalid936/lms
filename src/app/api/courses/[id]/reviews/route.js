import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import Review from '@/lib/models/Review';
import Course from '@/lib/models/Course';
import Enrollment from '@/lib/models/Enrollment';
import QuizResult from '@/lib/models/QuizResult';
import Quiz from '@/lib/models/Quiz';
import { verifyToken } from '@/lib/utils/auth';

// POST - Create a new review
export async function POST(request, { params }) {
  try {
    await dbConnect();
    
    // Verify authentication
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

    let user;
    try {
      const payload = await verifyToken(token);
      const User = (await import('@/lib/models/User')).default;
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

    // Only students can post reviews
    if (user.userType !== 'Student') {
      return NextResponse.json(
        { success: false, message: 'Only students can post reviews' },
        { status: 403 }
      );
    }

    const { id: courseId } = await params;
    const body = await request.json();
    const { rating, comment } = body;

    // Validation
    if (!rating || !comment) {
      return NextResponse.json(
        { success: false, message: 'Rating and comment are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (comment.trim().length < 10) {
      return NextResponse.json(
        { success: false, message: 'Comment must be at least 10 characters long' },
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

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      student: user._id,
      course: courseId,
      status: { $in: ['active', 'completed'] }
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, message: 'You must be enrolled in this course to leave a review' },
        { status: 403 }
      );
    }

    // Check if course is 100% completed
    await enrollment.calculateProgress();
    if (enrollment.progress < 100) {
      return NextResponse.json(
        { success: false, message: 'You must complete the course (100% progress) before leaving a review' },
        { status: 403 }
      );
    }

    // Check if all quizzes are passed
    const courseQuizzes = await Quiz.find({ course: courseId, isPublished: true });
    
    if (courseQuizzes.length > 0) {
      const quizResults = await QuizResult.find({
        student: user._id,
        quiz: { $in: courseQuizzes.map(q => q._id) }
      });

      // Check if all quizzes have been attempted and passed
      const passedQuizzes = quizResults.filter(result => result.isPassed);
      
      if (passedQuizzes.length < courseQuizzes.length) {
        return NextResponse.json(
          { success: false, message: 'You must pass all course quizzes before leaving a review' },
          { status: 403 }
        );
      }
    }

    // Check if user has already reviewed this course
    const existingReview = await Review.findOne({
      student: user._id,
      course: courseId
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, message: 'You have already reviewed this course' },
        { status: 400 }
      );
    }

    // Create the review
    const reviewData = {
      student: user._id,
      course: courseId,
      rating: Number(rating),
      comment: comment.trim()
    };
    
    console.log('Creating review with data:', reviewData);
    const review = new Review(reviewData);

    await review.save();

    // Update course rating
    const ratingStats = await Review.calculateCourseRating(courseId);
    await Course.findByIdAndUpdate(courseId, {
      rating: {
        average: ratingStats.average,
        count: ratingStats.count
      }
    });

    // Populate the review for response
    await review.populate([
      {
        path: 'student',
        select: 'firstName lastName avatar'
      },
      {
        path: 'course',
        select: 'courseTitle'
      }
    ]);

    return NextResponse.json({
      success: true,
      message: 'Review posted successfully',
      data: review
    }, { status: 201 });

  } catch (error) {
    console.error('Review creation error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

// GET - Get all reviews for a course
export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id: courseId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    // Get reviews with pagination
    const reviews = await Review.find({ 
      course: courseId, 
      isApproved: true 
    })
    .populate({
      path: 'student',
      select: 'firstName lastName avatar'
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    // Get total count
    const totalReviews = await Review.countDocuments({ 
      course: courseId, 
      isApproved: true 
    });

    // Get rating statistics
    const ratingStats = await Review.calculateCourseRating(courseId);

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalReviews / limit),
          totalItems: totalReviews,
          hasNextPage: page < Math.ceil(totalReviews / limit),
          hasPrevPage: page > 1
        },
        ratingStats
      }
    });

  } catch (error) {
    console.error('Reviews fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}