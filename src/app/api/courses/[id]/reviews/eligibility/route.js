import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import Review from '@/lib/models/Review';
import Enrollment from '@/lib/models/Enrollment';
import QuizResult from '@/lib/models/QuizResult';
import Quiz from '@/lib/models/Quiz';
import { verifyToken } from '@/lib/utils/auth';

// GET - Check if user can post a review for the course
export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({
        success: true,
        data: {
          canReview: false,
          reason: 'Authentication required'
        }
      });
    }

    let user;
    try {
      const payload = await verifyToken(token);
      const User = (await import('@/lib/models/User')).default;
      user = await User.findById(payload.userId);
      
      if (!user) {
        return NextResponse.json({
          success: true,
          data: {
            canReview: false,
            reason: 'User not found'
          }
        });
      }
    } catch (error) {
      return NextResponse.json({
        success: true,
        data: {
          canReview: false,
          reason: 'Invalid or expired token'
        }
      });
    }

    // Only students can post reviews
    if (user.userType !== 'Student') {
      return NextResponse.json({
        success: true,
        data: {
          canReview: false,
          reason: 'Only students can post reviews'
        }
      });
    }

    const { id: courseId } = await params;

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      student: user._id,
      course: courseId,
      status: { $in: ['active', 'completed'] }
    });

    if (!enrollment) {
      return NextResponse.json({
        success: true,
        data: {
          canReview: false,
          reason: 'Not enrolled in this course'
        }
      });
    }

    // Check if user has already reviewed this course
    const existingReview = await Review.findOne({
      student: user._id,
      course: courseId
    });

    if (existingReview) {
      return NextResponse.json({
        success: true,
        data: {
          canReview: false,
          reason: 'Already reviewed this course',
          hasReviewed: true
        }
      });
    }

    // Check if course is 100% completed
    await enrollment.calculateProgress();
    if (enrollment.progress < 100) {
      return NextResponse.json({
        success: true,
        data: {
          canReview: false,
          reason: `Course not completed. Progress: ${enrollment.progress}%`,
          progress: enrollment.progress
        }
      });
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
        const failedQuizCount = courseQuizzes.length - passedQuizzes.length;
        return NextResponse.json({
          success: true,
          data: {
            canReview: false,
            reason: `${failedQuizCount} quiz(es) not passed yet`,
            totalQuizzes: courseQuizzes.length,
            passedQuizzes: passedQuizzes.length
          }
        });
      }
    }

    // All conditions met
    return NextResponse.json({
      success: true,
      data: {
        canReview: true,
        reason: 'Eligible to post review',
        progress: enrollment.progress,
        totalQuizzes: courseQuizzes.length,
        passedQuizzes: courseQuizzes.length
      }
    });

  } catch (error) {
    console.error('Review eligibility check error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}