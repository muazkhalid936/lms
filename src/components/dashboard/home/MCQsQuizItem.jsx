import React from "react";
import QuizItem from "./QuizItem";

const MCQsQuizItem = ({ quizzes = [] }) => {
  const maxHeight = "400px";
  
  const onQuizClick = (quizId) => {
    //console.log("Quiz clicked:", quizId);
  };

  return (
    <div className="w-full mx-auto p-4">
      <h1 className="text-[20px] font-bold text-gray-900 mb-6">MCQs Quiz</h1>
      
      <div
        className="space-y-4 overflow-y-auto scrollbar-hide pr-2"
        style={{ maxHeight }}
      >
        {quizzes && quizzes.map((quiz) => (
          <QuizItem
            key={quiz.id}
            quiz={quiz}
            onQuizClick={onQuizClick}
          />
        ))}
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default MCQsQuizItem;