import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import Course from '@/lib/models/Course';
import Chapter from '@/lib/models/Chapter';
import Lesson from '@/lib/models/Lesson';
import Quiz from '@/lib/models/Quiz';
import FAQ from '@/lib/models/FAQ';
import Review from '@/lib/models/Review';
import User from '@/lib/models/User'; // Import User model to register the schema
import { deleteFromS3 } from '@/lib/services/awsService';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includeReviews = searchParams.get('includeReviews') === 'true';
    const reviewsPage = parseInt(searchParams.get('reviewsPage')) || 1;
    const reviewsLimit = parseInt(searchParams.get('reviewsLimit')) || 10;
    
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
      // console.log('Fetched course:', course);

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

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Course fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const body = await request.json();

    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    // Update course
    Object.assign(course, body);
    const updatedCourse = await course.save();

    return NextResponse.json({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourse
    });

  } catch (error) {
    console.error('Course update error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;

    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    // Delete course thumbnail from S3
    if (course.thumbnail && course.thumbnail.key) {
      await deleteFromS3(course.thumbnail.key);
    }

    // Get all chapters and lessons to delete their files
    const chapters = await Chapter.find({ course: id });
    const lessons = await Lesson.find({ course: id });

    // Delete lesson files from S3
    for (const lesson of lessons) {
      if (lesson.content.videoKey) {
        await deleteFromS3(lesson.content.videoKey);
      }
      if (lesson.content.documentKey) {
        await deleteFromS3(lesson.content.documentKey);
      }
      if (lesson.content.thumbnailKey) {
        await deleteFromS3(lesson.content.thumbnailKey);
      }
      // Delete attachments
      for (const attachment of lesson.attachments) {
        if (attachment.key) {
          await deleteFromS3(attachment.key);
        }
      }
    }

    // Delete all related data
    await Lesson.deleteMany({ course: id });
    await Chapter.deleteMany({ course: id });
    await FAQ.deleteMany({ course: id });
    await Course.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Course and all related data deleted successfully'
    });

  } catch (error) {
    console.error('Course deletion error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}