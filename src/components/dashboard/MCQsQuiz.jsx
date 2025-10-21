"use client";
import React, { useState, useEffect } from "react";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { sampleQuizzes } from "@/data";
import { useRouter } from "next/navigation";
import MCQsQuizItem from "./home/MCQsQuizItem";
import QuizItem from "./home/QuizItem";

const MCQQuiz = () => {
  const [selectedQuiz, setSelectedQuiz] = useState(sampleQuizzes[0]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(selectedQuiz.duration);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const router = useRouter();
  useEffect(() => {
    if (quizStarted && !quizCompleted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeRemaining === 0) {
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
    if (currentQuestionIndex < selectedQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(answers[currentQuestionIndex + 1] || null);
    } else {
      handleQuizComplete();
    }
  };

  const handleQuizComplete = () => {
    let finalScore = 0;
    selectedQuiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        finalScore++;
      }
    });
    setScore(finalScore);
    setQuizCompleted(true);
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setTimeRemaining(selectedQuiz.duration);
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswers({});
    setQuizStarted(false);
    setQuizCompleted(false);
    setScore(0);
    setTimeRemaining(selectedQuiz.duration);
  };

  if (!quizStarted) {
    return (
      <div className="mx-auto px-6 pb-6 bg-white">
        <div className="mb-6">
          <button className="flex items-center text-gray-600 hover:text-gray-800 mb-4">
            <ChevronLeft className="w-5 h-5 mr-1" />
          </button>
          <h1 className="text-[20px] border-b border-[var(--gray-100)] pb-4 font-bold text-[var(--gray-900)] mb-6">
            MCQs Quiz
          </h1>
        </div>

        <div className="flex flex-col gap-6">
          {sampleQuizzes.map((quiz) => (
            <QuizItem
              key={quiz.id}
              quiz={quiz}
              onQuizClick={startQuiz}
              isStart={true}
            />
          ))}
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[var(--gray-900)] mb-6">
            Quiz Completed!
          </h1>
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 mb-6">
            <h2 className="text-2xl font-semibold text-green-800 mb-4">
              Your Score
            </h2>
            <div className="text-4xl font-bold text-green-600 mb-2">
              {score}/{selectedQuiz.questionCount}
            </div>
            <p className="text-green-700">
              {((score / selectedQuiz.questionCount) * 100).toFixed(0)}% correct
            </p>
          </div>
          <button
            onClick={resetQuiz}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Take Quiz Again
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = selectedQuiz.questions[currentQuestionIndex];
  const progress =
    ((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100;

  return (
    <div className="mx-auto px-6 pb-6 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button
          className="flex items-center text-gray-600 cursor-pointer hover:text-gray-800 mb-4"
          onClick={() => window.location.reload()}
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 border-b-[1px] border-[var(--gray-100)] pb-4">
          MCQs Quiz
        </h1>
      </div>

      {/* Quiz Info Card */}
      <div className="border border-[var(--gray-100)] p-6">
        <div className="border border-gray-200 bg-[var(--gray-50)] rounded-lg p-4 sm:p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Title and Image Section */}
            <div className="flex items-center gap-3">
              <img
                src={selectedQuiz.thumbnailImage}
                className="w-[44px] h-[44px] rounded-[6px] flex-shrink-0"
                alt="Quiz thumbnail"
              />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 leading-tight">
                {selectedQuiz.title}
              </h2>
            </div>

            {/* Timer Section */}
            <div className="flex items-center text-gray-600 justify-start sm:justify-end">
              <Clock className="w-5 h-5 mr-2 flex-shrink-0" />
              <div className="flex items-center gap-1">
                <span className="text-[var(--gray-600)] text-sm sm:text-[15px]">
                  {formatTime(timeRemaining)}
                </span>
                <span className="text-[var(--gray-600)] text-sm sm:text-[15px]">
                  /
                </span>
                <span className="text-[var(--gray-900)] text-sm sm:text-[15px] font-medium">
                  {formatTime(selectedQuiz.duration)}
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
              Question {currentQuestionIndex + 1} out of{" "}
              {selectedQuiz.questionCount}
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
              <div key={index}>
                <input
                  type="radio"
                  name="answer"
                  value={index}
                  checked={selectedAnswer === index}
                  onChange={() => handleAnswerSelect(index)}
                  className="w-[14px] h-[14px] text-blue-600 mr-3 cursor-pointer"
                />
                <span className="text-gray-700 text-lg">{option}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end mt-4">
        <button
          onClick={handleNext}
          disabled={selectedAnswer === null}
          className={`flex items-center px-[16px] py-[8px] rounded-[100px] font-medium transition-colors ${
            selectedAnswer !== null
              ? "bg-[var(--rose-500)] hover:bg-red-600 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {currentQuestionIndex === selectedQuiz.questions.length - 1
            ? "Finish"
            : "Next"}
          <ChevronRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default MCQQuiz;
