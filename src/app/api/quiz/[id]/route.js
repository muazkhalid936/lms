import { NextResponse } from "next/server";
import dbConnect from "@/lib/utils/dbConnect";
import Quiz from "@/lib/models/Quiz";
import QuizResult from "@/lib/models/QuizResult";
import User from "@/lib/models/User";
import { verifyToken } from "@/lib/utils/auth";

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    // Get authorization token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : request.cookies.get('token')?.value;

    let user = null;
    if (token) {
      try {
        const payload = await verifyToken(token);
        user = await User.findById(payload.userId);
      } catch (error) {
        // Token invalid, but we can still show quiz info
      }
    }
    
    const { id } = await params;
    const quiz = await Quiz.findById(id)
      .populate('course', 'title')
      .populate('chapter', 'title');
    
    if (!quiz) {
      return NextResponse.json(
        { success: false, message: "Quiz not found" },
        { status: 404 }
      );
    }

    // Get user's quiz attempts if user is authenticated
    let userAttempts = [];
    if (user) {
      userAttempts = await QuizResult.find({ 
        quiz: id, 
        student: user._id 
      }).sort({ attemptNumber: -1 });
    }

    // Transform the quiz data to match expected format
    const transformedQuiz = {
      _id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      questions: quiz.questions.map(q => ({
        _id: q._id,
        question: q.question,
        options: q.options.map(opt => opt.text),
        correctAnswer: q.options.findIndex(opt => opt.isCorrect),
        points: q.points
      })),
      timeLimit: quiz.timeLimit.hours * 60 + quiz.timeLimit.minutes + (quiz.timeLimit.seconds / 60),
      totalMarks: quiz.totalMarks,
      passingMarks: quiz.passingMarks,
      maxAttempts: quiz.maxAttempts,
      allowRetake: quiz.allowRetake,
      instructions: quiz.instructions,
      course: quiz.course,
      chapter: quiz.chapter,
      userAttempts: userAttempts.length,
      latestAttempt: userAttempts.length > 0 ? userAttempts[0] : null
    };

    return NextResponse.json({
      success: true,
      data: transformedQuiz,
    });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}