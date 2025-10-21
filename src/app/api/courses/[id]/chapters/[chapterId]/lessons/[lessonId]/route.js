import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/utils/dbConnect';
import Lesson from '@/lib/models/Lesson';
import Course from '@/lib/models/Course';
import { uploadToS3, deleteFromS3, uploadLargeFile } from '@/lib/services/awsService';
import { calculateAndUpdateCourseStats } from '@/lib/utils/courseStats';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id, chapterId, lessonId } = await params;
    
    const lesson = await Lesson.findOne({ 
      _id: lessonId, 
      chapter: chapterId, 
      course: id 
    });

    if (!lesson) {
      return NextResponse.json(
        { success: false, message: 'Lesson not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: lesson
    });

  } catch (error) {
    console.error('Lesson fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    const { id, chapterId, lessonId } = await params;
    const contentType = request.headers.get('content-type');

    const lesson = await Lesson.findOne({ 
      _id: lessonId, 
      chapter: chapterId, 
      course: id 
    });

    if (!lesson) {
      return NextResponse.json(
        { success: false, message: 'Lesson not found' },
        { status: 404 }
      );
    }

    let updateData;

    if (contentType?.includes('multipart/form-data')) {
      // Handle file uploads
      const formData = await request.formData();
      updateData = {
        title: formData.get('title') || lesson.title,
        description: formData.get('description') || lesson.description,
        type: formData.get('type') || lesson.type,
        isFree: formData.get('isFree') === 'true',
        duration: {
          hours: parseInt(formData.get('hours')) || lesson.duration.hours,
          minutes: parseInt(formData.get('minutes')) || lesson.duration.minutes,
          seconds: parseInt(formData.get('seconds')) || lesson.duration.seconds
        }
      };

      // Handle file updates
      if (updateData.type === 'video') {
        const videoFile = formData.get('videoFile');
        if (videoFile) {
          // Delete old video if exists
          if (lesson.content.videoKey) {
            await deleteFromS3(lesson.content.videoKey);
          }
          
          // Use multipart upload for files larger than 10MB
          const useMultipart = videoFile.size > 10 * 1024 * 1024;
          const uploadResult = useMultipart 
            ? await uploadLargeFile(videoFile, 'lesson-videos')
            : await uploadToS3(videoFile, 'lesson-videos');
            
          if (uploadResult.success) {
            updateData.content = {
              ...lesson.content,
              videoUrl: uploadResult.url,
              videoKey: uploadResult.key
            };
          }
        }
      } else if (updateData.type === 'document') {
        const documentFile = formData.get('documentFile');
        if (documentFile) {
          // Delete old document if exists
          if (lesson.content.documentKey) {
            await deleteFromS3(lesson.content.documentKey);
          }
          
          const uploadResult = await uploadToS3(documentFile, 'lesson-documents');
          if (uploadResult.success) {
            updateData.content = {
              ...lesson.content,
              documentUrl: uploadResult.url,
              documentKey: uploadResult.key,
              documentName: documentFile.name,
              documentSize: documentFile.size,
              documentType: documentFile.type
            };
          }
        }
      }
    } else {
      // Handle JSON data
      updateData = await request.json();
    }

    // Update lesson
    Object.assign(lesson, updateData);
    const updatedLesson = await lesson.save();

    // Update course stats after lesson update
    try {
      await calculateAndUpdateCourseStats(id);
    } catch (statsError) {
      console.warn('Failed to update course stats:', statsError.message);
      // Continue with successful lesson update even if stats update fails
    }

    return NextResponse.json({
      success: true,
      message: 'Lesson updated successfully',
      data: updatedLesson
    });

  } catch (error) {
    console.error('Lesson update error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    const { id, chapterId, lessonId } = await params;

    const lesson = await Lesson.findOne({ 
      _id: lessonId, 
      chapter: chapterId, 
      course: id 
    });

    if (!lesson) {
      return NextResponse.json(
        { success: false, message: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Delete files from S3
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

    // Delete the lesson
    await Lesson.findByIdAndDelete(lessonId);

    // Update course stats after lesson deletion
    try {
      await calculateAndUpdateCourseStats(id);
    } catch (statsError) {
      console.warn('Failed to update course stats:', statsError.message);
      // Continue with successful lesson deletion even if stats update fails
    }

    return NextResponse.json({
      success: true,
      message: 'Lesson deleted successfully'
    });

  } catch (error) {
    console.error('Lesson deletion error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}