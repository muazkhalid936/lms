import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, Play, HelpCircle, Lock, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import ProgressService from "@/lib/services/progressService";

import toast from "react-hot-toast";

const LectureList = ({
  title = "Lecture List",
  totalLectures = 0,
  totalDuration = "00:00:00",
  sections = [],
  courseId = null,
}) => {
  const [expandedSections, setExpandedSections] = useState({});
  const [quizAttempts, setQuizAttempts] = useState({});
  const [progressData, setProgressData] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const router = useRouter();

  // Fetch course progress
  useEffect(() => {
    const fetchProgress = async () => {
      if (!courseId) return;
      
      setLoadingProgress(true);
      try {
        const result = await ProgressService.getCourseProgress(courseId);
        if (result.success) {
          setProgressData(result.data);
        } else {
          console.error('Failed to fetch progress:', result.message);
          setProgressData(null);
        }
      } catch (error) {
        console.error('Error fetching progress:', error);
        setProgressData(null);
      } finally {
        setLoadingProgress(false);
      }
    };

    fetchProgress();
  }, [courseId]);

  // Fetch quiz attempts for all quizzes in the course
  useEffect(() => {
    const fetchQuizAttempts = async () => {
      const quizIds = [];
      sections.forEach(section => {
        section.lectures?.forEach(lecture => {
          if (lecture.itemType === 'quiz') {
            quizIds.push(lecture.id);
          }
        });
      });

      const attemptPromises = quizIds.map(async (quizId) => {
        try {
          const response = await fetch(`/api/quiz/${quizId}/attempts`);
          if (response.ok) {
            const data = await response.json();
            return { quizId, data: data.data };
          }
        } catch (error) {
          console.error(`Error fetching attempts for quiz ${quizId}:`, error);
        }
        return { quizId, data: { hasAttempted: false } };
      });

      const results = await Promise.all(attemptPromises);
      const attemptsMap = {};
      results.forEach(({ quizId, data }) => {
        attemptsMap[quizId] = data;
      });
      setQuizAttempts(attemptsMap);
    };

    if (sections.length > 0) {
      fetchQuizAttempts();
    }
  }, [sections]);

  const toggleSection = (sectionIndex) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionIndex]: !prev[sectionIndex],
    }));
  };

  const formatDuration = (duration) => {
    return duration || "00:00";
  };

  const navigateToLesson = async (lecture) => {
    if (!progressData) {
      toast.error("Loading progress data...");
      return;
    }

    // Check if user is enrolled
    if (!progressData.enrolled) {
      toast.error("You need to enroll in this course first");
      return;
    }

    if (lecture.itemType === "quiz") {
      // Check if quiz is accessible (all lessons in chapter completed)
      const canAccess = await ProgressService.isQuizAccessible(courseId, lecture.id, progressData);
      if (!canAccess) {
        toast.error("Complete all lessons in this chapter to unlock the quiz");
        return;
      }
      
      // Navigate to quiz page with quiz ID
      router.push(`/dashboard/student/quiz/${lecture.id}`);
    } else if (courseId && lecture.id) {
      // Check if lesson is accessible (previous lessons completed)
      const canAccess = await ProgressService.isLessonAccessible(courseId, lecture.id, progressData);
      if (!canAccess) {
        toast.error("Complete previous lessons to unlock this lesson");
        return;
      }

      router.push(
        `/dashboard/student/courses/${courseId}/lesson/${lecture.id}`
      );
    } else {
      // Fallback to old route if no courseId or lessonId
      router.push("/dashboard/student/courses/lecture");
    }
  };

  const markLessonComplete = async (lessonId) => {
    if (!progressData?.enrolled) {
      toast.error("You need to be enrolled to mark lessons complete");
      return;
    }

    try {
      const result = await ProgressService.markLessonComplete(courseId, lessonId);
      if (result.success) {
        toast.success(result.message);
        // Refresh progress data
        const progressResult = await ProgressService.getCourseProgress(courseId);
        if (progressResult.success) {
          setProgressData(progressResult.data);
          
          // Trigger completion check for course completion modal

        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to mark lesson as complete");
    }
  };

  const isLessonCompleted = (lessonId) => {
    return progressData?.completedLessons?.includes(lessonId) || false;
  };

  const isLessonAccessible = (lessonId) => {
    if (!progressData?.enrolled) return false;
    return progressData?.accessibleLessons?.[lessonId] || false;
  };

  const isQuizAccessible = (quizId) => {
    if (!progressData?.enrolled) return false;
    return progressData?.canAccessQuizzes?.[quizId] || false;
  };

  return (
    <div className="mx-auto bg-white max-h-[80vh] flex flex-col">
      {loadingProgress && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4667]"></div>
          <span className="ml-2 text-gray-600">Loading progress...</span>
        </div>
      )}
      
      <div className="flex justify-between items-center p-6 md:pt-0 flex-shrink-0">
        <h1 className="text-[20px] font-bold text-gray-900">{title}</h1>
        <div className="text-[var(--gray-900)] text-[14px]">
          <span>{totalLectures} Lectures</span>
          <span className="ml-2 text-[var(--rose-500)]">{totalDuration}</span>
          {progressData?.enrolled && (
            <span className="ml-2 text-green-600">
              Progress: {progressData.progress}% ({progressData.completedCount}/{progressData.totalLessons})
            </span>
          )}
        </div>
      </div>

      <div className="border border-[var(--gray-100)] rounded-[10px] ml-5 p-5 overflow-y-auto flex-1">
        <div className="divide-y divide-gray-200 space-y-2">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="bg-[var(--gray-100-50)]">
              <button
                onClick={() => toggleSection(sectionIndex)}
                className="w-full flex justify-between items-center p-4 text-left hover:bg-[var(--gray-100)] transition-colors"
              >
                <h2 className="text-[20px] text-gray-900">{section.title}</h2>
                {expandedSections[sectionIndex] ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {expandedSections[sectionIndex] && (
                <div className="bg-white">
                  {section.lectures &&
                    section.lectures.map((lecture, lectureIndex) => (
                      <div
                        key={lectureIndex}
                        className={`flex items-center justify-between p-4 border-b border-[var(--gray-100)] last:border-b-0 transition-colors ${
                          lecture.itemType === "quiz" 
                            ? isQuizAccessible(lecture.id) 
                              ? "hover:bg-gray-50" 
                              : "bg-gray-50 opacity-60"
                            : isLessonAccessible(lecture.id) 
                              ? "hover:bg-gray-50" 
                              : "bg-gray-50 opacity-60"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 relative">
                            {lecture.itemType === "quiz" ? (
                              (() => {
                                const attempt = quizAttempts[lecture.id];
                                if (!attempt?.hasAttempted) {
                                  return isQuizAccessible(lecture.id) ? (
                                    <HelpCircle
                                      className="cursor-pointer w-4 h-4 text-[var(--rose-500)] fill-current"
                                      onClick={() => navigateToLesson(lecture)}
                                    />
                                  ) : (
                                    <Lock className="w-4 h-4 text-gray-400" />
                                  );
                                } else if (attempt.latestAttempt?.isPassed) {
                                  return (
                                    <CheckCircle
                                      className="cursor-pointer w-4 h-4 text-green-500 fill-current"
                                      onClick={() => navigateToLesson(lecture)}
                                    />
                                  );
                                } else {
                                  return (
                                    <HelpCircle
                                      className="cursor-pointer w-4 h-4 text-red-500 fill-current"
                                      onClick={() => navigateToLesson(lecture)}
                                    />
                                  );
                                }
                              })()
                            ) : (
                              <>
                                {isLessonCompleted(lecture.id) ? (
                                  <CheckCircle className="w-4 h-4 text-green-500 fill-current" />
                                ) : isLessonAccessible(lecture.id) ? (
                                  <Play
                                    className="cursor-pointer w-4 h-4 text-[var(--rose-500)] fill-current"
                                    onClick={() => navigateToLesson(lecture)}
                                  />
                                ) : (
                                  <Lock className="w-4 h-4 text-gray-400" />
                                )}
                              </>
                            )}
                          </div>
                          <div>
                            <h3 className={`font-medium text-[14px] ${
                              lecture.itemType === "quiz"
                                ? isQuizAccessible(lecture.id)
                                  ? "text-[var(--gray-600)]"
                                  : "text-gray-400"
                                : isLessonAccessible(lecture.id)
                                  ? "text-[var(--gray-600)]"
                                  : "text-gray-400"
                            }`}>
                              {lecture.title}
                            </h3>
                            {lecture.itemType !== "quiz" && !isLessonAccessible(lecture.id) && (
                              <p className="text-xs text-gray-400 mt-1">
                                Complete previous lessons to unlock
                              </p>
                            )}
                            {lecture.itemType === "quiz" && !isQuizAccessible(lecture.id) && (
                              <p className="text-xs text-gray-400 mt-1">
                                Complete all lessons in this chapter to unlock
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-5 lg:space-x-10">
                          {lecture.itemType === "quiz" ? (
                            isQuizAccessible(lecture.id) ? (
                              <button
                                className={`cursor-pointer text-[14px] hover:opacity-80 underline text-sm ${
                                  quizAttempts[lecture.id]?.latestAttempt?.isPassed 
                                    ? "text-green-600" 
                                    : "text-[var(--indigo-800)]"
                                }`}
                                onClick={() => navigateToLesson(lecture)}
                              >
                                {(() => {
                                  const attempt = quizAttempts[lecture.id];
                                  if (!attempt?.hasAttempted) return "Take Quiz";
                                  if (attempt.latestAttempt?.isPassed) return "✓ Passed - Retake";
                                  return "❌ Failed - Retake";
                                })()}
                              </button>
                            ) : (
                              <span className="text-gray-400 text-[14px]">Locked</span>
                            )
                          ) : (
                            <div className="flex items-center space-x-3">
                              {isLessonAccessible(lecture.id) ? (
                                <button
                                  className="text-[var(--indigo-800)] cursor-pointer text-[14px] hover:text-blue-800 underline text-sm"
                                  onClick={() => navigateToLesson(lecture)}
                                >
                                  {isLessonCompleted(lecture.id) ? "Review" : "Watch"}
                                </button>
                              ) : (
                                <span className="text-gray-400 text-[14px]">Locked</span>
                              )}
                            </div>
                          )}

                          {lecture.itemType !== "quiz" ? (
                            <span className={`text-[14px] ${
                              isLessonAccessible(lecture.id) ? "text-[var(--gray-500)]" : "text-gray-400"
                            }`}>
                              {formatDuration(lecture.duration)}
                            </span>
                          ) : (
                            <span className={`text-[14px] ${
                              isQuizAccessible(lecture.id) ? "text-[var(--gray-500)]" : "text-gray-400"
                            }`}>
                              {lecture.questionCount} Qs • {lecture.timeLimit} mins
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LectureList;
