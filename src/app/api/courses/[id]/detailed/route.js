import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import AuthService from '@/lib/services/authService';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    // Import models after database connection is established
    const { default: Course } = await import('@/lib/models/Course');
    const { default: Review } = await import('@/lib/models/Review');
    const { default: Enrollment } = await import('@/lib/models/Enrollment');
    const { default: Quiz } = await import('@/lib/models/Quiz');
    const { default: QuizResult } = await import('@/lib/models/QuizResult');
    const { default: FAQ } = await import('@/lib/models/FAQ');
    const { default: User } = await import('@/lib/models/User'); // Import User model to register the schema
    
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includeReviews = searchParams.get('includeReviews') === 'true';
    const includeEnrollmentStatus = searchParams.get('includeEnrollmentStatus') === 'true';
    const includeReviewEligibility = searchParams.get('includeReviewEligibility') === 'true';
    const reviewsPage = parseInt(searchParams.get('reviewsPage')) || 1;
    const reviewsLimit = parseInt(searchParams.get('reviewsLimit')) || 10;

    // Get user from AuthService if enrollment status or review eligibility is requested
    let user = null;
    if (includeEnrollmentStatus || includeReviewEligibility) {
      const authResult = await AuthService.getAuthenticatedUser(request);
      if (authResult.success) {
        user = authResult.user;
      }
    }
    
    const course = await Course.findById(id)
      .populate('instructor', 'firstName lastName userName email avatar bio experience education userType')
      .populate({
        path: 'chapters',
        populate: [
          {
            path: 'lessons',
            options: { sort: { order: 1 } }
          },
          {
            path: 'quizzes',
            options: { sort: { createdAt: 1 } }
          }
        ],
        options: { sort: { order: 1 } }
      })
      .populate({
        path: 'faqs',
        options: { sort: { order: 1 } }
      });

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    let responseData = course.toObject();

    // Include reviews if requested
    if (includeReviews) {
      const reviewsSkip = (reviewsPage - 1) * reviewsLimit;
      
      // Get reviews with pagination
      const reviews = await Review.find({ 
        course: id, 
        isApproved: true 
      })
      .populate({
        path: 'student',
        select: 'firstName lastName avatar'
      })
      .sort({ createdAt: -1 })
      .skip(reviewsSkip)
      .limit(reviewsLimit);

      // Get total count
      const totalReviews = await Review.countDocuments({ 
        course: id, 
        isApproved: true 
      });

      // Get rating statistics
      const ratingStats = await Review.calculateCourseRating(id);

      responseData.reviews = {
        data: reviews,
        pagination: {
          currentPage: reviewsPage,
          totalPages: Math.ceil(totalReviews / reviewsLimit),
          totalItems: totalReviews,
          hasNextPage: reviewsPage < Math.ceil(totalReviews / reviewsLimit),
          hasPrevPage: reviewsPage > 1
        },
        ratingStats
      };
    }

    // Include enrollment status if requested and user is available
    if (includeEnrollmentStatus && user && user.userType === 'Student') {
      const enrollment = await Enrollment.findOne({
        student: user._id,
        course: id,
        status: { $in: ['active', 'completed'] }
      });

      responseData.enrollmentStatus = {
        isEnrolled: !!enrollment,
        enrollment: enrollment ? {
          _id: enrollment._id,
          status: enrollment.status,
          progress: enrollment.progress,
          enrolledAt: enrollment.createdAt
        } : null
      };
    }

    // Include review eligibility if requested and user is available
    if (includeReviewEligibility && user && user.userType === 'Student') {
      let reviewEligibility = {
        canReview: false,
        hasReviewed: false,
        reason: 'You must be enrolled in this course to leave a review',
        progress: 0,
        totalQuizzes: 0,
        passedQuizzes: 0
      };

      // Check if user is enrolled
      const enrollment = await Enrollment.findOne({
        student: user._id,
        course: id,
        status: { $in: ['active', 'completed'] }
      });

      if (enrollment) {
        // Calculate progress
        await enrollment.calculateProgress();
        reviewEligibility.progress = enrollment.progress;

        // Check if user has already reviewed this course
        const existingReview = await Review.findOne({
          student: user._id,
          course: id
        });

        reviewEligibility.hasReviewed = !!existingReview;

        if (existingReview) {
          reviewEligibility.reason = 'You have already reviewed this course';
        } else if (enrollment.progress < 100) {
          reviewEligibility.reason = `Complete the course to post a review (${enrollment.progress}% completed)`;
        } else {
          // Check quiz requirements
          const courseQuizzes = await Quiz.find({ course: id, isPublished: true });
          reviewEligibility.totalQuizzes = courseQuizzes.length;

          if (courseQuizzes.length > 0) {
            const quizResults = await QuizResult.find({
              student: user._id,
              quiz: { $in: courseQuizzes.map(q => q._id) }
            });

            const passedQuizzes = quizResults.filter(result => result.isPassed);
            reviewEligibility.passedQuizzes = passedQuizzes.length;

            if (passedQuizzes.length < courseQuizzes.length) {
              reviewEligibility.reason = `Pass all quizzes to post a review (${passedQuizzes.length}/${courseQuizzes.length} passed)`;
            } else {
              reviewEligibility.canReview = true;
              reviewEligibility.reason = 'You can now post a review for this course';
            }
          } else {
            // No quizzes required, can review
            reviewEligibility.canReview = true;
            reviewEligibility.reason = 'You can now post a review for this course';
          }
        }
      }

      responseData.reviewEligibility = reviewEligibility;
    }

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Course detailed fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}