import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import Enrollment from '@/lib/models/Enrollment';
import Course from '@/lib/models/Course';
import { verifyToken } from '@/lib/utils/auth';

// POST - Mark lesson as completed
export async function POST(request, { params }) {
  try {
    await dbConnect();
    
    const { id: courseId, lessonId } = await params;
    
    // No need to parse body since we're not sending any data
    // const body = await request.json();
    
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1] || request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Find enrollment for this user and course
    let enrollment = await Enrollment.findOne({
      student: decoded.userId,
      course: courseId,
      status: { $in: ['active', 'completed'] }
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, message: 'You are not enrolled in this course' },
        { status: 403 }
      );
    }

    // Check if lesson is accessible (previous lessons completed)
    const course = await Course.findById(courseId).populate({
      path: 'chapters',
      populate: {
        path: 'lessons',
        options: { sort: { order: 1 } }
      },
      options: { sort: { order: 1 } }
    });

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    // Find the lesson and check if it's accessible
    let targetLesson = null;
    let isAccessible = false;
    let lessonIndex = -1;
    let chapterIndex = -1;

    for (let i = 0; i < course.chapters.length; i++) {
      const chapter = course.chapters[i];
      
      // Check if this chapter is accessible (previous chapters completed)
      let canAccessChapter = true;
      if (i > 0) {
        const previousChapter = course.chapters[i - 1];
        
        // Check if all lessons in previous chapter are completed
        const completedLessonIds = enrollment.completedLessons.map(cl => cl.lesson.toString());
        const prevChapterLessonsCompleted = previousChapter.lessons.every(lesson => 
          completedLessonIds.includes(lesson._id.toString())
        );
        
        // For simplicity, assuming quizzes don't block chapter access for now
        // You can add quiz completion checking here if needed
        canAccessChapter = prevChapterLessonsCompleted;
      }
      
      for (let j = 0; j < chapter.lessons.length; j++) {
        if (chapter.lessons[j]._id.toString() === lessonId) {
          targetLesson = chapter.lessons[j];
          lessonIndex = j;
          chapterIndex = i;
          
          // Lesson is accessible if:
          // 1. Chapter is accessible
          // 2. It's the first lesson in the chapter OR previous lesson is completed
          if (!canAccessChapter) {
            isAccessible = false;
          } else if (j === 0) {
            isAccessible = true;
          } else {
            // Check if previous lesson is completed
            const previousLesson = chapter.lessons[j - 1];
            const completedLessonIds = enrollment.completedLessons.map(cl => cl.lesson.toString());
            isAccessible = completedLessonIds.includes(previousLesson._id.toString());
          }
          break;
        }
      }
      if (targetLesson) break;
    }

    if (!targetLesson) {
      return NextResponse.json(
        { success: false, message: 'Lesson not found' },
        { status: 404 }
      );
    }

    if (!isAccessible) {
      return NextResponse.json(
        { success: false, message: 'You must complete previous lessons first' },
        { status: 403 }
      );
    }

    // Mark lesson as completed
    enrollment.completeLesson(lessonId);
    
    // Calculate and update progress
    await enrollment.calculateProgress();
    await enrollment.save();

    return NextResponse.json({
      success: true,
      message: 'Lesson marked as completed',
      data: {
        progress: enrollment.progress,
        completedLessons: enrollment.completedLessons.length
      }
    });

  } catch (error) {
    console.error('Error marking lesson as complete:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}