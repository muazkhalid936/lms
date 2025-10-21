import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import Quiz from '@/lib/models/Quiz';
import Chapter from '@/lib/models/Chapter';
import Course from '@/lib/models/Course';
import { verifyAuth } from '@/lib/handlers/auth';
import { calculateAndUpdateCourseStats } from '@/lib/utils/courseStats';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id: chapterId } = await params;
    
    const quizzes = await Quiz.find({ chapter: chapterId })
      .populate('createdBy', 'name email')
      .sort({ order: 1 });

    return NextResponse.json({
      success: true,
      data: quizzes
    });

  } catch (error) {
    console.error('Quizzes fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    await dbConnect();
    
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: chapterId } = await params;
    const body = await request.json();
    const { 
      title, 
      description, 
      questions, 
      passingMarks, 
      timeLimit,
      instructions,
      allowRetake,
      maxAttempts,
      shuffleQuestions,
      shuffleOptions,
      showResults,
      showCorrectAnswers,
      isFree 
    } = body;

    // Validation
    if (!title) {
      return NextResponse.json(
        { success: false, message: 'Quiz title is required' },
        { status: 400 }
      );
    }

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { success: false, message: 'At least one question is required' },
        { status: 400 }
      );
    }

    if (passingMarks === undefined || passingMarks < 0 || passingMarks > 100) {
      return NextResponse.json(
        { success: false, message: 'Passing marks must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Check if chapter exists
    const chapter = await Chapter.findById(chapterId).populate('course');
    if (!chapter) {
      return NextResponse.json(
        { success: false, message: 'Chapter not found' },
        { status: 404 }
      );
    }

    // Check if user owns the course
    if (chapter.course.instructor.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, message: 'You can only add quizzes to your own courses' },
        { status: 403 }
      );
    }

    // Get the next order number
    const lastQuiz = await Quiz.findOne({ chapter: chapterId }).sort({ order: -1 });
    const nextOrder = lastQuiz ? lastQuiz.order + 1 : 1;

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question.question || !question.options || question.options.length < 2) {
        return NextResponse.json(
          { success: false, message: `Question ${i + 1} must have a question text and at least 2 options` },
          { status: 400 }
        );
      }

      const correctAnswers = question.options.filter(option => option.isCorrect);
      if (correctAnswers.length !== 1) {
        return NextResponse.json(
          { success: false, message: `Question ${i + 1} must have exactly one correct answer` },
          { status: 400 }
        );
      }
    }

    const quizData = {
      title: title.trim(),
      description: description?.trim() || '',
      chapter: chapterId,
      course: chapter.course._id,
      order: nextOrder,
      questions,
      passingMarks,
      timeLimit: timeLimit || { hours: 0, minutes: 30, seconds: 0 },
      instructions: instructions?.trim() || '',
      allowRetake: allowRetake !== undefined ? allowRetake : true,
      maxAttempts: maxAttempts || 3,
      shuffleQuestions: shuffleQuestions || false,
      shuffleOptions: shuffleOptions || false,
      showResults: showResults !== undefined ? showResults : true,
      showCorrectAnswers: showCorrectAnswers !== undefined ? showCorrectAnswers : true,
      isFree: isFree || false,
      createdBy: user._id
    };

    const quiz = new Quiz(quizData);
    await quiz.save();

    await quiz.populate('createdBy', 'name email');

    // Update course stats after quiz creation
    try {
      await calculateAndUpdateCourseStats(chapter.course._id);
    } catch (statsError) {
      console.warn('Failed to update course stats:', statsError.message);
      // Continue with successful quiz creation even if stats update fails
    }

    return NextResponse.json({
      success: true,
      data: quiz,
      message: 'Quiz created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Quiz creation error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}