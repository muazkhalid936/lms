import React from "react";
import { X, Plus, Trash2, Sparkles } from "lucide-react";
import RichTextEditor from "@/components/ui/RichTextEditor";

const QuizFormModal = ({
  isOpen,
  onClose,
  quizTitle,
  setQuizTitle,
  quizDescription,
  setQuizDescription,
  quizPassingMarks,
  setQuizPassingMarks,
  quizTimeLimit,
  setQuizTimeLimit,
  quizInstructions,
  setQuizInstructions,
  quizQuestions,
  setQuizQuestions,
  quizAllowRetake,
  setQuizAllowRetake,
  quizMaxAttempts,
  setQuizMaxAttempts,
  quizShuffleQuestions,
  setQuizShuffleQuestions,
  quizShuffleOptions,
  setQuizShuffleOptions,
  quizShowResults,
  setQuizShowResults,
  quizShowCorrectAnswers,
  setQuizShowCorrectAnswers,
  quizIsFree,
  setQuizIsFree,
  isLoadingQuiz,
  isGeneratingQuiz,
  editingQuizId,
  onSubmit,
  onGenerateWithAI,
  addQuestion,
  removeQuestion,
  updateQuestion,
  addOption,
  removeOption,
  updateOption,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingQuizId ? "Edit Quiz" : "Create Quiz"}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onGenerateWithAI}
              disabled={isGeneratingQuiz}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-colors text-sm"
            >
              <Sparkles size={16} />
              {isGeneratingQuiz ? "Generating..." : "Generate with AI"}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Quiz Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quiz Title *
              </label>
              <input
                type="text"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter quiz title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Passing Marks (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={quizPassingMarks}
                onChange={(e) => setQuizPassingMarks(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <RichTextEditor
              value={quizDescription}
              onChange={setQuizDescription}
              placeholder="Enter quiz description..."
            />
          </div>

          {/* Time Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Limit
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={quizTimeLimit.hours}
                onChange={(e) =>
                  setQuizTimeLimit({
                    ...quizTimeLimit,
                    hours: Number(e.target.value),
                  })
                }
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <span className="text-sm text-gray-600">hours</span>
              <input
                type="number"
                min="0"
                max="59"
                value={quizTimeLimit.minutes}
                onChange={(e) =>
                  setQuizTimeLimit({
                    ...quizTimeLimit,
                    minutes: Number(e.target.value),
                  })
                }
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <span className="text-sm text-gray-600">minutes</span>
              <input
                type="number"
                min="0"
                max="59"
                value={quizTimeLimit.seconds}
                onChange={(e) =>
                  setQuizTimeLimit({
                    ...quizTimeLimit,
                    seconds: Number(e.target.value),
                  })
                }
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <span className="text-sm text-gray-600">seconds</span>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instructions
            </label>
            <textarea
              value={quizInstructions}
              onChange={(e) => setQuizInstructions(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter quiz instructions..."
            />
          </div>

          {/* Quiz Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowRetake"
                  checked={quizAllowRetake}
                  onChange={(e) => setQuizAllowRetake(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="allowRetake" className="ml-2 text-sm text-gray-700">
                  Allow Retake
                </label>
              </div>

              {quizAllowRetake && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Attempts
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quizMaxAttempts}
                    onChange={(e) => setQuizMaxAttempts(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="shuffleQuestions"
                  checked={quizShuffleQuestions}
                  onChange={(e) => setQuizShuffleQuestions(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="shuffleQuestions" className="ml-2 text-sm text-gray-700">
                  Shuffle Questions
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="shuffleOptions"
                  checked={quizShuffleOptions}
                  onChange={(e) => setQuizShuffleOptions(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="shuffleOptions" className="ml-2 text-sm text-gray-700">
                  Shuffle Options
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showResults"
                  checked={quizShowResults}
                  onChange={(e) => setQuizShowResults(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="showResults" className="ml-2 text-sm text-gray-700">
                  Show Results
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showCorrectAnswers"
                  checked={quizShowCorrectAnswers}
                  onChange={(e) => setQuizShowCorrectAnswers(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="showCorrectAnswers" className="ml-2 text-sm text-gray-700">
                  Show Correct Answers
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isFree"
                  checked={quizIsFree}
                  onChange={(e) => setQuizIsFree(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isFree" className="ml-2 text-sm text-gray-700">
                  Free Quiz
                </label>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Questions</h3>
              <button
                onClick={addQuestion}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--indigo-800)] hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                <Plus size={16} />
                Add Question
              </button>
            </div>

            {quizQuestions.map((question, questionIndex) => (
              <div key={questionIndex} className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium text-gray-900">
                    Question {questionIndex + 1}
                  </h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={question.points}
                      onChange={(e) =>
                        updateQuestion(questionIndex, "points", Number(e.target.value))
                      }
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Points"
                    />
                    <span className="text-sm text-gray-500">marks</span>
                    <button
                      onClick={() => removeQuestion(questionIndex)}
                      className="p-1 hover:bg-red-100 rounded transition-colors"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                </div>

                <textarea
                  value={question.question}
                  onChange={(e) =>
                    updateQuestion(questionIndex, "question", e.target.value)
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-3"
                  placeholder="Enter your question..."
                />

                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`question-${questionIndex}`}
                        checked={option.isCorrect}
                        onChange={() =>
                          updateOption(questionIndex, optionIndex, "isCorrect", true)
                        }
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) =>
                          updateOption(questionIndex, optionIndex, "text", e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder={`Option ${optionIndex + 1}`}
                      />
                      {question.options.length > 2 && (
                        <button
                          onClick={() => removeOption(questionIndex, optionIndex)}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addOption(questionIndex)}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    <Plus size={14} />
                    Add Option
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isLoadingQuiz}
            className="px-6 py-2 bg-[var(--indigo-800)] hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            {isLoadingQuiz
              ? "Saving..."
              : editingQuizId
              ? "Update Quiz"
              : "Create Quiz"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizFormModal;