import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import Quiz from '@/lib/models/Quiz';
import QuizResult from '@/lib/models/QuizResult';
import { verifyAuth } from '@/lib/handlers/auth';
import { calculateAndUpdateCourseStats } from '@/lib/utils/courseStats';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { quizId } = await params;
    
    const quiz = await Quiz.findById(quizId)
      .populate('chapter', 'title')
      .populate('course', 'title')
      .populate('createdBy', 'name email');

    if (!quiz) {
      return NextResponse.json(
        { success: false, message: 'Quiz not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: quiz
    });

  } catch (error) {
    console.error('Quiz fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { quizId } = await params;
    const body = await request.json();

    const quiz = await Quiz.findById(quizId).populate('course');
    if (!quiz) {
      return NextResponse.json(
        { success: false, message: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Check if user owns the course
    if (quiz.course.instructor.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, message: 'You can only edit your own quizzes' },
        { status: 403 }
      );
    }

    // Validate questions if provided
    if (body.questions) {
      for (let i = 0; i < body.questions.length; i++) {
        const question = body.questions[i];
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
    }

    // Validate passing marks if provided
    if (body.passingMarks !== undefined && (body.passingMarks < 0 || body.passingMarks > 100)) {
      return NextResponse.json(
        { success: false, message: 'Passing marks must be between 0 and 100' },
        { status: 400 }
      );
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      quizId,
      { $set: body },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    // Update course stats after quiz update
    try {
      await calculateAndUpdateCourseStats(quiz.course._id);
    } catch (statsError) {
      console.warn('Failed to update course stats:', statsError.message);
      // Continue with successful quiz update even if stats update fails
    }

    return NextResponse.json({
      success: true,
      data: updatedQuiz,
      message: 'Quiz updated successfully'
    });

  } catch (error) {
    console.error('Quiz update error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { quizId } = await params;

    const quiz = await Quiz.findById(quizId).populate('course');
    if (!quiz) {
      return NextResponse.json(
        { success: false, message: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Check if user owns the course
    if (quiz.course.instructor.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, message: 'You can only delete your own quizzes' },
        { status: 403 }
      );
    }

    // Delete all quiz results associated with this quiz
    await QuizResult.deleteMany({ quiz: quizId });

    // Delete the quiz
    await Quiz.findByIdAndDelete(quizId);

    // Update course stats after quiz deletion
    try {
      await calculateAndUpdateCourseStats(quiz.course._id);
    } catch (statsError) {
      console.warn('Failed to update course stats:', statsError.message);
      // Continue with successful quiz deletion even if stats update fails
    }

    return NextResponse.json({
      success: true,
      message: 'Quiz deleted successfully'
    });

  } catch (error) {
    console.error('Quiz deletion error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}