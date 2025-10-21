import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import Quiz from '@/lib/models/Quiz';
import QuizResult from '@/lib/models/QuizResult';
import { verifyAuth } from '@/lib/handlers/auth';

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

    const { quizId } = await params;
    const body = await request.json();
    const { answers, startedAt, submittedAt, timeSpent } = body;

    // Find the quiz
    const quiz = await Quiz.findById(quizId);
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

    // Get current attempt number
    const existingResults = await QuizResult.find({
      quiz: quizId,
      student: user._id
    }).sort({ attemptNumber: -1 });

    const attemptNumber = existingResults.length > 0 ? existingResults[0].attemptNumber + 1 : 1;

    // Check if user has exceeded max attempts
    if (!quiz.allowRetake && existingResults.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Retakes are not allowed for this quiz' },
        { status: 400 }
      );
    }

    if (attemptNumber > quiz.maxAttempts) {
      return NextResponse.json(
        { success: false, message: `Maximum attempts (${quiz.maxAttempts}) exceeded` },
        { status: 400 }
      );
    }

    // Validate answers
    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { success: false, message: 'Invalid answers format' },
        { status: 400 }
      );
    }

    if (answers.length !== quiz.questions.length) {
      return NextResponse.json(
        { success: false, message: 'All questions must be answered' },
        { status: 400 }
      );
    }

    // Calculate score
    let score = 0;
    const processedAnswers = [];

    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];
      const userAnswer = answers[i];

      if (userAnswer.questionId !== question._id.toString()) {
        return NextResponse.json(
          { success: false, message: 'Question ID mismatch' },
          { status: 400 }
        );
      }

      if (userAnswer.selectedOptionIndex < 0 || userAnswer.selectedOptionIndex >= question.options.length) {
        return NextResponse.json(
          { success: false, message: 'Invalid option selected' },
          { status: 400 }
        );
      }

      const selectedOption = question.options[userAnswer.selectedOptionIndex];
      const isCorrect = selectedOption.isCorrect;
      const points = isCorrect ? question.points : 0;

      score += points;

      processedAnswers.push({
        questionId: question._id,
        selectedOptionIndex: userAnswer.selectedOptionIndex,
        isCorrect,
        points
      });
    }

    // Create quiz result
    const quizResult = new QuizResult({
      quiz: quizId,
      student: user._id,
      course: quiz.course,
      chapter: quiz.chapter,
      answers: processedAnswers,
      score,
      totalMarks: quiz.totalMarks,
      passingMarks: quiz.passingMarks,
      timeSpent: timeSpent || { hours: 0, minutes: 0, seconds: 0 },
      startedAt: new Date(startedAt),
      submittedAt: new Date(submittedAt),
      attemptNumber
    });

    await quizResult.save();

    // Populate for response
    await quizResult.populate([
      { path: 'quiz', select: 'title showResults showCorrectAnswers' },
      { path: 'student', select: 'name email' }
    ]);

    // Prepare response based on quiz settings
    const response = {
      success: true,
      data: {
        _id: quizResult._id,
        score: quizResult.score,
        totalMarks: quizResult.totalMarks,
        percentage: quizResult.percentage,
        isPassed: quizResult.isPassed,
        attemptNumber: quizResult.attemptNumber,
        submittedAt: quizResult.submittedAt
      },
      message: 'Quiz submitted successfully'
    };

    // Include detailed results if quiz allows it
    if (quiz.showResults) {
      response.data.answers = quiz.showCorrectAnswers ? processedAnswers : processedAnswers.map(ans => ({
        questionId: ans.questionId,
        selectedOptionIndex: ans.selectedOptionIndex,
        isCorrect: ans.isCorrect,
        points: ans.points
      }));
    }

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Quiz submission error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}