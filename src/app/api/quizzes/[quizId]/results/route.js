import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import QuizResult from '@/lib/models/QuizResult';
import { verifyAuth } from '@/lib/handlers/auth';

export async function GET(request, { params }) {
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
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    let query = { quiz: quizId };

    // If studentId is provided and user is instructor, show that student's results
    // Otherwise, show only the current user's results
    if (studentId && user.role === 'instructor') {
      query.student = studentId;
    } else {
      query.student = user._id;
    }

    const results = await QuizResult.find(query)
      .populate('student', 'name email avatar')
      .populate('quiz', 'title totalMarks passingMarks showResults showCorrectAnswers')
      .sort({ attemptNumber: -1 });

    return NextResponse.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Quiz results fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}