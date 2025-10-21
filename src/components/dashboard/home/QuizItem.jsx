import { ChevronRight, Pencil, Trash2, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const QuizItem = ({ quiz, onQuizClick, isStart }) => {
  const router = useRouter();
  return (
    <div className="bg-white rounded-[10px] border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 ">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {quiz.title}
          </h3>
          {!isStart ? (
            <p className="text-[var(--gray-600)] text-sm">
              Number of Questions :{" "}
              {quiz.questionCount.toString().padStart(2, "0")}
            </p>
          ) : (
            <p className="text-[var(--gray-600)] text-sm flex items-center gap-1">
              <HelpCircle className="w-4 h-4 mr-2" />
              {quiz.questionCount} Questions
            </p>
          )}
        </div>
        {isStart ? (
          <div className="flex items-center gap-10">
            <button
              className="text-[var(--indigo-800)] underline cursor-pointer hover:text-indigo-900"
              onClick={onQuizClick}
            >
              View Quiz
            </button>

            <button className="hover:text-indigo-700">
              <Pencil className="w-[13px] h-[12px]" />
            </button>

            <button className="hover:text-red-600">
              <Trash2 className="w-[13px] h-[12px]" />
            </button>
          </div>
        ) : (
          <div
            className="ml-6 cursor-pointer bg-gray-400 hover:bg-gray-500 text-white rounded-full p-2 transition-colors duration-200"
            onClick={() => router.push("/dashboard/student/mcqs-quiz")}
          >
            <ChevronRight className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizItem;
