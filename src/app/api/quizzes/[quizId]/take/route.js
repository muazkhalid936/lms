import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import Quiz from '@/lib/models/Quiz';
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
    
    const quiz = await Quiz.findById(quizId)
      .populate('chapter', 'title')
      .populate('course', 'title');

    if (!quiz) {
      return NextResponse.json(
        { success: false, message: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Check if quiz is published
    if (!quiz.isPublished) {
      return NextResponse.json(
        { success: false, message: 'Quiz is not published' },
        { status: 400 }
      );
    }

    // Get user's previous attempts
    const previousAttempts = await QuizResult.find({
      quiz: quizId,
      student: user._id
    }).sort({ attemptNumber: -1 });

    const attemptCount = previousAttempts.length;
    const canTakeQuiz = quiz.allowRetake ? attemptCount < quiz.maxAttempts : attemptCount === 0;

    // Prepare quiz data for student (without correct answers)
    const studentQuiz = {
      _id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      chapter: quiz.chapter,
      course: quiz.course,
      questions: quiz.questions.map(q => ({
        _id: q._id,
        question: q.question,
        options: q.options.map(opt => ({
          text: opt.text
          // Don't include isCorrect for students
        })),
        points: q.points
      })),
      passingMarks: quiz.passingMarks,
      totalMarks: quiz.totalMarks,
      timeLimit: quiz.timeLimit,
      instructions: quiz.instructions,
      allowRetake: quiz.allowRetake,
      maxAttempts: quiz.maxAttempts,
      shuffleQuestions: quiz.shuffleQuestions,
      shuffleOptions: quiz.shuffleOptions,
      showResults: quiz.showResults,
      showCorrectAnswers: quiz.showCorrectAnswers,
      isFree: quiz.isFree,
      // Additional info for student
      canTakeQuiz,
      attemptCount,
      previousAttempts: previousAttempts.map(attempt => ({
        _id: attempt._id,
        score: attempt.score,
        totalMarks: attempt.totalMarks,
        percentage: attempt.percentage,
        isPassed: attempt.isPassed,
        attemptNumber: attempt.attemptNumber,
        submittedAt: attempt.submittedAt
      }))
    };

    // Shuffle questions if enabled
    if (quiz.shuffleQuestions) {
      studentQuiz.questions = shuffleArray([...studentQuiz.questions]);
    }

    // Shuffle options if enabled
    if (quiz.shuffleOptions) {
      studentQuiz.questions = studentQuiz.questions.map(q => ({
        ...q,
        options: shuffleArray([...q.options])
      }));
    }

    return NextResponse.json({
      success: true,
      data: studentQuiz
    });

  } catch (error) {
    console.error('Quiz take error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

// Helper function to shuffle array
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}