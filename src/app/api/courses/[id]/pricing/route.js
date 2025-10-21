import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import Course from '@/lib/models/Course';

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const body = await request.json();
    const { 
      isFreeCourse, 
      coursePrice, 
      hasDiscount, 
      discountPrice, 
      expiryPeriod, 
      numberOfMonths,
      tags,
      instructorMessage 
    } = body;

    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    // Update pricing and additional info
    course.isFreeCourse = isFreeCourse;
    course.coursePrice = coursePrice || 0;
    course.hasDiscount = hasDiscount || false;
    course.discountPrice = discountPrice || 0;
    course.expiryPeriod = expiryPeriod || 'unlimited';
    course.numberOfMonths = numberOfMonths;
    course.tags = tags || [];
    course.instructorMessage = instructorMessage || '';
    
    // Update course type based on pricing
    course.courseType = isFreeCourse ? 'Free' : 'Paid';
    
    // Set course status to published when pricing is updated
    course.status = 'published';
    course.publishedAt = new Date();

    const updatedCourse = await course.save();

    return NextResponse.json({
      success: true,
      message: 'Course pricing updated and published successfully',
      data: {
        isFreeCourse: updatedCourse.isFreeCourse,
        coursePrice: updatedCourse.coursePrice,
        hasDiscount: updatedCourse.hasDiscount,
        discountPrice: updatedCourse.discountPrice,
        expiryPeriod: updatedCourse.expiryPeriod,
        numberOfMonths: updatedCourse.numberOfMonths,
        tags: updatedCourse.tags,
        instructorMessage: updatedCourse.instructorMessage,
        courseType: updatedCourse.courseType,
        status: updatedCourse.status,
        publishedAt: updatedCourse.publishedAt
      }
    });

  } catch (error) {
    console.error('Course pricing update error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}