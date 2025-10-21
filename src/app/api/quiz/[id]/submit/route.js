import { NextResponse } from "next/server";
import dbConnect from "@/lib/utils/dbConnect";
import Quiz from "@/lib/models/Quiz";
import QuizResult from "@/lib/models/QuizResult";
import User from "@/lib/models/User";
import { verifyToken } from "@/lib/utils/auth";

export async function POST(request, { params }) {
  try {
    await dbConnect();
    
    // Get authorization token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token and get user info
    let user;
    try {
      const payload = await verifyToken(token);
      user = await User.findById(payload.userId);
      
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { answers, score, totalQuestions, timeTaken, startedAt } = await request.json();
    
    const { id } = await params;
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return NextResponse.json(
        { success: false, message: "Quiz not found" },
        { status: 404 }
      );
    }

    // Get current attempt number
    const existingResults = await QuizResult.find({ 
      quiz: id, 
      student: user._id 
    }).sort({ attemptNumber: -1 });
    
    const attemptNumber = existingResults.length > 0 ? existingResults[0].attemptNumber + 1 : 1;

    // Check if user has exceeded max attempts
    if (attemptNumber > quiz.maxAttempts) {
      return NextResponse.json(
        { success: false, message: "Maximum attempts exceeded" },
        { status: 403 }
      );
    }

    // Transform answers to match schema
    const transformedAnswers = Object.entries(answers).map(([questionIndex, selectedOptionIndex]) => {
      const question = quiz.questions[parseInt(questionIndex)];
      const isCorrect = question.options[selectedOptionIndex]?.isCorrect || false;
      return {
        questionId: question._id,
        selectedOptionIndex,
        isCorrect,
        points: isCorrect ? question.points : 0
      };
    });

    // Convert time taken (seconds) to hours, minutes, seconds
    const timeSpentHours = Math.floor(timeTaken / 3600);
    const timeSpentMinutes = Math.floor((timeTaken % 3600) / 60);
    const timeSpentSeconds = timeTaken % 60;

    // Calculate percentage and pass status
    const percentage = quiz.totalMarks > 0 ? Math.round((score / quiz.totalMarks) * 100) : 0;
    const isPassed = score >= quiz.passingMarks;

    // Create quiz result
    const quizResult = new QuizResult({
      quiz: id,
      student: user._id,
      course: quiz.course,
      chapter: quiz.chapter,
      answers: transformedAnswers,
      score,
      totalMarks: quiz.totalMarks,
      percentage,
      passingMarks: quiz.passingMarks,
      isPassed,
      timeSpent: {
        hours: timeSpentHours,
        minutes: timeSpentMinutes,
        seconds: timeSpentSeconds
      },
      startedAt: new Date(startedAt),
      submittedAt: new Date(),
      attemptNumber
    });

    await quizResult.save();

    return NextResponse.json({
      success: true,
      data: quizResult,
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}