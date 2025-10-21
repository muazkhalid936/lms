import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/utils/dbConnect';
import Chapter from '@/lib/models/Chapter';
import Lesson from '@/lib/models/Lesson';
import Course from '@/lib/models/Course';
import { uploadToS3, uploadLargeFile } from '@/lib/services/awsService';
import { calculateAndUpdateCourseStats } from '@/lib/utils/courseStats';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id, chapterId } = await params;
    
    const lessons = await Lesson.find({ course: id, chapter: chapterId })
      .sort({ order: 1 });

    return NextResponse.json({
      success: true,
      data: lessons
    });

  } catch (error) {
    console.error('Lessons fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    await dbConnect();
    
    const { id, chapterId } = await params;
    const contentType = request.headers.get('content-type');

    let lessonData;
    
    if (contentType?.includes('multipart/form-data')) {
      // Handle file uploads
      try {
        const formData = await request.formData();
        lessonData = {
          title: formData.get('title'),
          description: formData.get('description'),
          type: formData.get('type'),
          isFree: formData.get('isFree') === 'true',
          duration: {
            hours: parseInt(formData.get('hours')) || 0,
            minutes: parseInt(formData.get('minutes')) || 0,
            seconds: parseInt(formData.get('seconds')) || 0
          }
        };

        // Handle different content types
        if (lessonData.type === 'video') {
          const videoFile = formData.get('videoFile');
          if (videoFile && videoFile.size > 0) {
            console.log(`📹 Processing video file: ${videoFile.name}, Size: ${(videoFile.size / (1024 * 1024)).toFixed(2)}MB`);
            
            // Always use multipart upload for video files to handle large sizes
            try {
              const uploadResult = await uploadLargeFile(videoFile, 'lesson-videos');
              
              if (uploadResult.success) {
                lessonData.content = {
                  videoUrl: uploadResult.url,
                  videoKey: uploadResult.key
                };
                console.log('✅ Video uploaded successfully:', uploadResult.url);
              } else {
                console.error('❌ Video upload failed:', uploadResult.error);
                return NextResponse.json(
                  { success: false, message: 'Video upload failed', error: uploadResult.error },
                  { status: 500 }
                );
              }
            } catch (uploadError) {
              console.error('❌ Video upload error:', uploadError);
              return NextResponse.json(
                { success: false, message: 'Video upload failed', error: uploadError.message },
                { status: 500 }
              );
            }
          }
        } else if (lessonData.type === 'document') {
          const documentFile = formData.get('documentFile');
          if (documentFile && documentFile.size > 0) {
            try {
              const uploadResult = await uploadToS3(documentFile, 'lesson-documents');
              if (uploadResult.success) {
                lessonData.content = {
                  documentUrl: uploadResult.url,
                  documentKey: uploadResult.key,
                  documentName: documentFile.name,
                  documentSize: documentFile.size,
                  documentType: documentFile.type
                };
              } else {
                return NextResponse.json(
                  { success: false, message: 'Document upload failed', error: uploadResult.error },
                  { status: 500 }
                );
              }
            } catch (uploadError) {
              console.error('❌ Document upload error:', uploadError);
              return NextResponse.json(
                { success: false, message: 'Document upload failed', error: uploadError.message },
                { status: 500 }
              );
            }
          }
        }
      } catch (formDataError) {
        console.error('❌ FormData parsing error:', formDataError);
        return NextResponse.json(
          { success: false, message: 'Invalid form data', error: formDataError.message },
          { status: 400 }
        );
      }
    } else {
      // Handle JSON data (including pre-uploaded files)
      try {
        const body = await request.json();
        lessonData = body;
        
        // Handle pre-uploaded files from multipart upload
        if (lessonData.type === 'video' && lessonData.videoUrl) {
          lessonData.content = {
            videoUrl: lessonData.videoUrl,
            videoKey: lessonData.videoKey,
            videoName: lessonData.videoName,
            videoSize: lessonData.videoSize,
            videoType: lessonData.videoType
          };
        } else if (lessonData.type === 'document' && lessonData.documentUrl) {
          lessonData.content = {
            documentUrl: lessonData.documentUrl,
            documentKey: lessonData.documentKey,
            documentName: lessonData.documentName,
            documentSize: lessonData.documentSize,
            documentType: lessonData.documentType
          };
        }
      } catch (jsonError) {
        console.error('❌ JSON parsing error:', jsonError);
        return NextResponse.json(
          { success: false, message: 'Invalid JSON data', error: jsonError.message },
          { status: 400 }
        );
      }
    }

    const { title, description, type, content, duration, isFree } = lessonData;

    // Sanitize description - handle both string and object formats
    let sanitizedDescription = '';
    if (typeof description === 'string') {
      sanitizedDescription = description;
    } else if (typeof description === 'object' && description?.html) {
      sanitizedDescription = description.html;
    } else if (typeof description === 'object' && description?.text) {
      sanitizedDescription = description.text;
    }

    // Validation
    if (!title || !type) {
      return NextResponse.json(
        { success: false, message: 'Title and type are required' },
        { status: 400 }
      );
    }

    // Check if chapter exists
    const chapter = await Chapter.findOne({ _id: chapterId, course: id });
    if (!chapter) {
      return NextResponse.json(
        { success: false, message: 'Chapter not found' },
        { status: 404 }
      );
    }

    // Get the next order number
    const lastLesson = await Lesson.findOne({ chapter: chapterId }).sort({ order: -1 });
    const order = lastLesson ? lastLesson.order + 1 : 1;

    // Prepare content based on type
    let lessonContent = content || {};
    
    if (type === 'youtube' && lessonData.youtubeUrl) {
      lessonContent.youtubeUrl = lessonData.youtubeUrl;
    } else if (type === 'text' && lessonData.textContent) {
      lessonContent.textContent = lessonData.textContent;
    } else if (type === 'liveClass' && lessonData.scheduledDate) {
      lessonContent.liveClassData = {
        scheduledDate: lessonData.scheduledDate,
        scheduledTime: lessonData.scheduledTime || '',
        maxParticipants: lessonData.maxParticipants || 100,
        requiresRegistration: lessonData.requiresRegistration || false,
        sendReminders: lessonData.sendReminders || false,
        recordSession: lessonData.recordSession || false,
      };
    }

    // Create new lesson
    const lesson = new Lesson({
      title,
      description: sanitizedDescription || '',
      chapter: chapterId,
      course: id,
      order,
      type,
      content: lessonContent,
      duration: duration || { hours: 0, minutes: 0, seconds: 0 },
      isFree: isFree || false
    });

    const savedLesson = await lesson.save();
    console.log('✅ Lesson saved successfully:', savedLesson.title);

    // Update course stats after adding lesson
    try {
      console.log('🔄 Updating course stats for course:', id);
      await calculateAndUpdateCourseStats(id);
      console.log('✅ Course stats updated successfully');
    } catch (statsError) {
      console.warn('❌ Failed to update course stats:', statsError.message);
      // Continue with successful lesson creation even if stats update fails
    }

    return NextResponse.json({
      success: true,
      message: 'Lesson created successfully',
      data: savedLesson
    }, { status: 201 });

  } catch (error) {
    console.error('Lesson creation error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}