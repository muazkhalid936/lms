"use client";
import React, { useState } from "react";
import { Video, Youtube, Play, FileText } from "lucide-react";

const Content = ({ course }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleSection = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Helper function to format duration (safe default)
  const formatDuration = (
    duration = { hours: 0, minutes: 0, seconds: 0 }
  ) => {
    const { hours, minutes, seconds } = duration;
    return `${(hours || 0).toString().padStart(2, "0")}:${(
      minutes || 0
    )
      .toString()
      .padStart(2, "0")}:${(seconds || 0).toString().padStart(2, "0")}`;
  };

  // Helper function to get lesson icon based on type (returns lucide icons)
  const getLessonIcon = (type) => {
    switch (type) {
      case "video":
        return <Video className="w-5 h-5" />;
      case "youtube":
        return <Youtube className="w-5 h-5" />;
      case "liveClass":
        return <Play className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  // Helper function to get quiz icon
  const getQuizIcon = () => <FileText className="w-5 h-5" />;

  // Helper function to format time limit
  const formatTimeLimit = (timeLimit) => {
    if (!timeLimit) return "No time limit";
    const { hours, minutes, seconds } = timeLimit;
    let result = "";
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m `;
    if (seconds > 0) result += `${seconds}s`;
    return result.trim() || "No time limit";
  };

  // Use course.chapters if available, otherwise fallback to empty array
  const chapters = course?.chapters || [];

  return (
    <div className="rounded-[10px] flex flex-col gap-3 border border-[#e7e7e7] p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[20px] font-bold">Course Content</p>
        <p className="text-[16px] font-normal">
          {course?.totalLessons ||
            chapters.reduce(
              (total, chapter) =>
                total +
                (chapter.lessons?.length || 0) +
                (chapter.quizzes?.length || 0),
              0
            )}{" "}
          Items{" "}
          <span className="text-[#FF4667] font-normal">
            {course?.totalDuration
              ? formatDuration(course.totalDuration)
              : "00:00:00"}
          </span>
        </p>
      </div>

      {/* Chapters */}
      <div className="flex flex-col gap-2">
        {chapters.length > 0 ? (
          chapters.map((chapter, index) => (
            <div
              key={chapter._id || index}
              className="bg-[#F8F8F8] border border-[#E7E7E7] rounded-[10px] overflow-hidden"
            >
              {/* Chapter Header */}
              <button
                onClick={() => toggleSection(index)}
                className="w-full flex justify-between items-center p-4 text-left font-medium"
              >
                <div className="flex flex-col items-start">
                  <span className="font-semibold">{chapter.title}</span>
                  <span className="text-sm text-gray-600">
                    {chapter.lessons?.length || 0} lessons
                    {(chapter.quizzes?.length || 0) > 0 && (
                      <span>
                        {" "}
                        • {chapter.quizzes.length} quiz
                        {chapter.quizzes.length > 1 ? "zes" : ""}
                      </span>
                    )}
                    {chapter.lessons?.length > 0 && (
                      <span className="ml-2">
                        •{" "}
                        {formatDuration(
                          chapter.lessons
                            .filter((lesson) =>
                              ["video", "youtube", "ytVideo"].includes(
                                lesson.type
                              )
                            )
                            .reduce(
                              (total, lesson) => ({
                                hours:
                                  total.hours + (lesson.duration?.hours || 0),
                                minutes:
                                  total.minutes + (lesson.duration?.minutes || 0),
                                seconds:
                                  total.seconds + (lesson.duration?.seconds || 0),
                              }),
                              { hours: 0, minutes: 0, seconds: 0 }
                            )
                        )} video
                      </span>
                    )}
                  </span>
                </div>
                <span
                  className={`transform transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : "rotate-0"
                  }`}
                >
                  ▼
                </span>
              </button>

              {/* Animated Content */}
              <div
                className={`transition-all duration-500 ease-in-out ${
                  openIndex === index ? "max-h-[500px]" : "max-h-0"
                } overflow-hidden`}
              >
                <div className="px-6 pb-3 flex flex-col gap-2">
                  {/* Display Lessons */}
                  {chapter.lessons?.map((lesson, i) => (
                    <div
                      key={lesson._id || i}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">
                          {getLessonIcon(lesson.type)}
                        </span>
                        <div>
                          <p className="font-medium text-gray-800">
                            {lesson.title}
                          </p>
                          {lesson.description &&
                            lesson.description !== "[object Object]" && (
                              <p
                                className="text-sm text-gray-600 mt-1"
                                dangerouslySetInnerHTML={{
                                  __html: lesson.description,
                                }}
                              />
                            )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        { ["video", "youtube", "ytVideo"].includes(lesson.type) ? (
                          <span>{formatDuration(lesson.duration)}</span>
                        ) : (
                          lesson.type === 'liveClass' && (
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                              Live
                            </span>
                          )
                        )}
                        {lesson.isFree && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            Free
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Display Quizzes */}
                  {chapter.quizzes?.map((quiz, i) => (
                    <div
                      key={quiz._id || i}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white "
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getQuizIcon()}</span>
                        <div>
                          <p className="font-medium text-gray-800">
                            {quiz.title}
                          </p>
                          {quiz.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {quiz.description}
                            </p>
                          )}
                          <div className="flex gap-4 mt-1 text-xs text-gray-500">
                            <span>{quiz.questions?.length || 0} questions</span>
                            <span>{quiz.totalMarks || 0} points</span>
                            <span>Passing: {quiz.passingMarks || 0}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 text-sm text-gray-500">
                        <span>{formatTimeLimit(quiz.timeLimit)}</span>
                        <div className="flex gap-2">
                          {quiz.isFree && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                              Free
                            </span>
                          )}
                          {quiz.allowRetake && (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                              Retakeable
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Show message if no content */}
                  {(!chapter.lessons || chapter.lessons.length === 0) &&
                    (!chapter.quizzes || chapter.quizzes.length === 0) && (
                      <p className="text-gray-500 text-sm px-3">
                        No content in this chapter
                      </p>
                    )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No course content available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Content;
