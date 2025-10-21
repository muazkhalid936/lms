"use client";
import React, { useState, useEffect } from "react";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

const QuizTakingPage = ({ quizId }) => {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [userAttempts, setUserAttempts] = useState(0);
  const [latestAttempt, setLatestAttempt] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!quizId) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/quiz/${quizId}`);
        const data = await response.json();

        if (data.success) {
          setQuiz(data.data);
          setUserAttempts(data.data.userAttempts || 0);
          setLatestAttempt(data.data.latestAttempt);
          setTimeRemaining(data.data.timeLimit * 60); // Convert minutes to seconds
        } else {
          setError(data.message || "Failed to fetch quiz");
        }
      } catch (err) {
        setError("An error occurred while fetching the quiz");
        console.error("Error fetching quiz:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (quizStarted && !quizCompleted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeRemaining === 0 && quizStarted) {
      handleQuizComplete();
    }
  }, [quizStarted, quizCompleted, timeRemaining]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    setAnswers({
      ...answers,
      [currentQuestionIndex]: answerIndex,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(answers[currentQuestionIndex + 1] || null);
    } else {
      handleQuizComplete();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(answers[currentQuestionIndex - 1] || null);
    }
  };

  const handleQuizComplete = async () => {
    let finalScore = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        finalScore++;
      }
    });
    setScore(finalScore);
    setQuizCompleted(true);

    // Submit quiz results to backend
    try {
      const response = await fetch(`/api/quiz/${quizId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers,
          score: finalScore,
          totalQuestions: quiz.questions.length,
          timeTaken: quiz.timeLimit * 60 - timeRemaining,
          startedAt: startedAt,
        }),
      });

      if (response.ok) {
        // Update attempts count after successful submission
        setUserAttempts(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
    }
  };

  const startQuiz = () => {
    const now = new Date();
    setStartedAt(now);
    setQuizStarted(true);
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswers({});
    setQuizStarted(false);
    setQuizCompleted(false);
    setScore(0);
    setStartedAt(null);
    setTimeRemaining(quiz.timeLimit * 60);
  };

  const goBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="mx-auto px-6 pb-6 bg-white min-h-screen flex items-center justify-center">
  <div className="flex items-center space-x-3 text-xl text-gray-700">
    <div className="w-6 h-6 border-4 border-gray-300 border-t-pink-500 rounded-full animate-spin"></div>
    <span>Loading quiz...</span>
  </div>
</div>

    );
  }

  if (error || !quiz) {
    return (
      <div className="mx-auto px-6 pb-6 bg-white min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">{error || "Quiz not found"}</div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="mx-auto px-6 pb-6 bg-white min-h-screen">
        <div className="mb-6">
          <button
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
            onClick={goBack}
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Course
          </button>
          <h1 className="text-[20px] border-b border-[var(--gray-100)] pb-4 font-bold text-[var(--gray-900)] mb-6">
            {quiz.title}
          </h1>
        </div>

        <div className="mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {quiz.title}
            </h2>
            <p className="text-gray-600 mb-4">{quiz.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Questions</div>
                <div className="text-lg font-semibold">
                  {quiz.questions?.length || 0}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Time Limit</div>
                <div className="text-lg font-semibold">
                  {quiz.timeLimit} minutes
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Total Marks</div>
                <div className="text-lg font-semibold">{quiz.totalMarks}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Passing Marks</div>
                <div className="text-lg font-semibold">{quiz.passingMarks}%</div>
              </div>
            </div>

            {/* Attempts Information */}
            {userAttempts > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-800 mb-2">Your Attempts:</h3>
                <div className="text-sm text-blue-700">
                  <p>Attempts taken: {userAttempts} / {quiz.maxAttempts}</p>
                  {latestAttempt && (
                    <p>Latest score: {latestAttempt.score}/{quiz.totalMarks} ({latestAttempt.percentage}%)</p>
                  )}
                </div>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-yellow-800 mb-2">
                Instructions:
              </h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>
                  • You have {quiz.timeLimit} minutes to complete this quiz
                </li>
                <li>• Once started, the timer cannot be paused</li>
                <li>• You can navigate between questions</li>
                <li>• Make sure to answer all questions before submitting</li>
                <li>• You need {quiz.passingMarks}% to pass</li>
              </ul>
            </div>

            {userAttempts >= quiz.maxAttempts ? (
              <div className="text-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 font-semibold">Maximum attempts reached</p>
                  <p className="text-red-600 text-sm">You have used all {quiz.maxAttempts} attempts for this quiz.</p>
                </div>
                <button
                  onClick={goBack}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Back to Course
                </button>
              </div>
            ) : (
              <button
                onClick={startQuiz}
                className="w-full bg-[var(--rose-500)] hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {userAttempts > 0 ? `Retake Quiz (${userAttempts + 1}/${quiz.maxAttempts})` : 'Start Quiz'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    const percentage = ((score / quiz.questions.length) * 100).toFixed(0);
    const passed = percentage >= quiz.passingMarks; // passingMarks is already a percentage

    return (
      <div className="mx-auto px-6 pb-6 bg-white min-h-screen">
        <div className="max-w-2xl mx-auto pt-10">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[var(--gray-900)] mb-6">
              Quiz Completed!
            </h1>
            <div
              className={`${
                passed
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              } border rounded-lg p-8 mb-6`}
            >
              <h2
                className={`text-2xl font-semibold ${
                  passed ? "text-green-800" : "text-red-800"
                } mb-4`}
              >
                Your Score
              </h2>
              <div
                className={`text-4xl font-bold ${
                  passed ? "text-green-600" : "text-red-600"
                } mb-2`}
              >
                {score}/{quiz.questions.length}
              </div>
              <p className={passed ? "text-green-700" : "text-red-700"}>
                {percentage}% correct
              </p>
              <p
                className={`mt-2 font-semibold ${
                  passed ? "text-green-800" : "text-red-800"
                }`}
              >
                {passed
                  ? "🎉 Congratulations! You passed!"
                  : "❌ You did not meet the passing criteria"}
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              {userAttempts < quiz.maxAttempts && (
                <button
                  onClick={resetQuiz}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Retake Quiz ({userAttempts + 1}/{quiz.maxAttempts})
                </button>
              )}
              <button
                onClick={goBack}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Back to Course
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="mx-auto px-6 pb-6 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button
          className="flex items-center text-gray-600 cursor-pointer hover:text-gray-800 mb-4"
          onClick={goBack}
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Course
        </button>
        <h1 className="text-2xl font-bold text-gray-900 border-b-[1px] border-[var(--gray-100)] pb-4">
          {quiz.title}
        </h1>
      </div>

      {/* Quiz Info Card */}
      <div className="border border-[var(--gray-100)] p-6">
        <div className="border border-gray-200 bg-[var(--gray-50)] rounded-lg p-4 sm:p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Title Section */}
            <div className="flex items-center gap-3">
              <div className="w-[44px] h-[44px] bg-[var(--rose-500)] rounded-[6px] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">Q</span>
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 leading-tight">
                {quiz.title}
              </h2>
            </div>

            {/* Timer Section */}
            <div className="flex items-center text-gray-600 justify-start sm:justify-end">
              <Clock className="w-5 h-5 mr-2 flex-shrink-0" />
              <div className="flex items-center gap-1">
                <span
                  className={`text-sm sm:text-[15px] ${
                    timeRemaining <= 300
                      ? "text-red-600 font-bold"
                      : "text-[var(--gray-600)]"
                  }`}
                >
                  {formatTime(timeRemaining)}
                </span>
                <span className="text-[var(--gray-600)] text-sm sm:text-[15px]">
                  /
                </span>
                <span className="text-[var(--gray-900)] text-sm sm:text-[15px] font-medium">
                  {formatTime(quiz.timeLimit * 60)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Quiz Progress
            </span>
            <span className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} out of {quiz.questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[var(--green-500)] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">
            {currentQuestion.question}
          </h3>

          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => (
              <label
                key={index}
                className="flex items-start cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
              >
                <input
                  type="radio"
                  name="answer"
                  value={index}
                  checked={selectedAnswer === index}
                  onChange={() => handleAnswerSelect(index)}
                  className="w-[14px] h-[14px] text-blue-600 mr-3 cursor-pointer mt-1 flex-shrink-0"
                />
                <span className="text-gray-700 text-lg leading-relaxed">
                  {option}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-4">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className={`flex items-center px-[16px] py-[8px] rounded-[100px] font-medium transition-colors ${
            currentQuestionIndex > 0
              ? "bg-gray-500 hover:bg-gray-600 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Previous
        </button>

        <button
          onClick={handleNext}
          disabled={selectedAnswer === null}
          className={`flex items-center px-[16px] py-[8px] rounded-[100px] font-medium transition-colors ${
            selectedAnswer !== null
              ? "bg-[var(--rose-500)] hover:bg-red-600 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {currentQuestionIndex === quiz.questions.length - 1
            ? "Finish Quiz"
            : "Next"}
          <ChevronRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default QuizTakingPage;
