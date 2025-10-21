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

    const { resultId } = await params;

    const result = await QuizResult.findById(resultId)
      .populate('student', 'name email avatar')
      .populate('quiz', 'title questions totalMarks passingMarks showResults showCorrectAnswers')
      .populate('course', 'title')
      .populate('chapter', 'title');

    if (!result) {
      return NextResponse.json(
        { success: false, message: 'Quiz result not found' },
        { status: 404 }
      );
    }

    // Check if user can view this result
    const canView = result.student._id.toString() === user._id.toString() || 
                   (user.role === 'instructor' && result.quiz.createdBy?.toString() === user._id.toString());

    if (!canView) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Quiz result fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}