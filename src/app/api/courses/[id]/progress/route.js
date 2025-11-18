import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import Enrollment from '@/lib/models/Enrollment';
import Course from '@/lib/models/Course';
import { verifyToken } from '@/lib/utils/auth';

// GET - Get user's progress for a specific course
export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id: courseId } = await params;
    
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
    const enrollment = await Enrollment.findOne({
      student: decoded.userId,
      course: courseId,
      status: { $in: ['active', 'completed'] }
    }).populate('completedLessons.lesson');

    if (!enrollment) {
      return NextResponse.json({
        success: true,
        data: {
          enrolled: false,
          progress: 0,
          completedLessons: [],
          canAccessQuizzes: {}
        }
      });
    }

    // Get course structure to determine lesson order and quiz restrictions
    const course = await Course.findById(courseId).populate({
      path: 'chapters',
      populate: {
        path: 'lessons quizzes',
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

    // Calculate which lessons are accessible and which quizzes are unlocked
    // Filter out any completed lessons where the lesson reference is null (deleted lessons)
    const completedLessonIds = enrollment.completedLessons
      .filter(cl => cl.lesson && cl.lesson._id)
      .map(cl => cl.lesson._id.toString());
    const accessibleLessons = {};
    const canAccessQuizzes = {};
    const chapterAccess = {};

    course.chapters.forEach((chapter, chapterIndex) => {
      let allLessonsCompleted = true;
      let allQuizzesCompleted = true;
      
      // Check if previous chapter is fully completed (for chapter-level restrictions)
      let canAccessChapter = true;
      if (chapterIndex > 0) {
        const previousChapter = course.chapters[chapterIndex - 1];
        
        // Check if all lessons in previous chapter are completed
        const prevChapterLessonsCompleted = previousChapter.lessons.every(lesson => 
          completedLessonIds.includes(lesson._id.toString())
        );
        
        // Check if all quizzes in previous chapter are completed
        // Note: We'll need to implement quiz completion tracking similar to lessons
        const prevChapterQuizzesCompleted = previousChapter.quizzes.length === 0 || 
          previousChapter.quizzes.every(quiz => {
            // For now, assume quiz is completed if attempted (you may want to check for passing score)
            return true; // This should be replaced with actual quiz completion check
          });
        
        canAccessChapter = prevChapterLessonsCompleted && prevChapterQuizzesCompleted;
      }
      
      chapterAccess[chapter._id.toString()] = canAccessChapter;
      
      chapter.lessons.forEach((lesson, lessonIndex) => {
        const lessonId = lesson._id.toString();
        const isCompleted = completedLessonIds.includes(lessonId);
        
        // Lesson is accessible if:
        // 1. Chapter is accessible
        // 2. It's the first lesson in the chapter OR previous lesson is completed
        if (!canAccessChapter) {
          accessibleLessons[lessonId] = false;
        } else if (lessonIndex === 0) {
          accessibleLessons[lessonId] = true;
        } else {
          // Check if previous lesson is completed
          const previousLesson = chapter.lessons[lessonIndex - 1];
          const previousCompleted = completedLessonIds.includes(previousLesson._id.toString());
          accessibleLessons[lessonId] = previousCompleted;
        }

        if (!isCompleted) {
          allLessonsCompleted = false;
        }
      });

      // Quiz accessibility - chapter must be accessible AND all lessons in chapter must be completed
      chapter.quizzes.forEach(quiz => {
        canAccessQuizzes[quiz._id.toString()] = canAccessChapter && allLessonsCompleted;
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        enrolled: true,
        progress: enrollment.progress,
        completedLessons: completedLessonIds,
        accessibleLessons,
        canAccessQuizzes,
        chapterAccess,
        totalLessons: course.chapters.reduce((total, chapter) => total + chapter.lessons.length, 0),
        completedCount: enrollment.completedLessons.length
      }
    });

  } catch (error) {
    console.error('Error fetching course progress:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}