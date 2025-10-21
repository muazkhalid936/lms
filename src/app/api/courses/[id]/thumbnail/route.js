import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import Course from '@/lib/models/Course';
import { uploadToS3, deleteFromS3 } from '@/lib/services/awsService';

export async function POST(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const formData = await request.formData();
    const file = formData.get('thumbnail');
    const isFeatured = formData.get('isFeatured') === 'true';

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No thumbnail file provided' },
        { status: 400 }
      );
    }

    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    // Delete old thumbnail if exists
    if (course.thumbnail && course.thumbnail.key) {
      await deleteFromS3(course.thumbnail.key);
    }

    // Upload new thumbnail to S3
    const uploadResult = await uploadToS3(file, 'course-thumbnails');
    
    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, message: 'Failed to upload thumbnail', error: uploadResult.error },
        { status: 500 }
      );
    }

    // Update course with thumbnail info
    course.thumbnail = {
      url: uploadResult.url,
      key: uploadResult.key,
      uploadedAt: new Date()
    };
    course.isFeatured = isFeatured;

    const updatedCourse = await course.save();

    return NextResponse.json({
      success: true,
      message: 'Course thumbnail uploaded successfully',
      data: {
        thumbnail: updatedCourse.thumbnail,
        isFeatured: updatedCourse.isFeatured
      }
    });

  } catch (error) {
    console.error('Thumbnail upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}