"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import useAuthStore from "@/store/authStore";
import { FaStar } from "react-icons/fa";
import LectureList from "./home/LectureList";
import ReviewModal from "../CouseDetail/ReviewModal";
import toast from "react-hot-toast";

const CourseDetail = () => {
  const params = useParams();
  const { user } = useAuthStore();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewEligibility, setReviewEligibility] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!params.id) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/courses/${params.id}`);
        const data = await response.json();

        if (data.success) {
          setCourse(data.data);
          //console.log("Fetched course:", data.data);
        } else {
          setError(data.message || "Failed to fetch course");
        }
      } catch (err) {
        setError("An error occurred while fetching the course");
        console.error("Error fetching course:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [params.id]);

  // Check review eligibility when user and course are loaded
  useEffect(() => {
    const checkReviewEligibility = async () => {
      if (user && course && user.userType === "Student") {
        try {
          const response = await fetch(`/api/courses/${params.id}/reviews/eligibility`, {
            method: 'GET',
            credentials: 'include'
          });
          const result = await response.json();
          if (result.success) {
            setReviewEligibility(result.data);
          }
        } catch (error) {
          console.error("Error checking review eligibility:", error);
        }
      }
    };

    checkReviewEligibility();
  }, [user, course, params.id]);

  const handleReviewSubmitted = (newReview) => {
    // Refresh review eligibility after submitting a review
    setReviewEligibility(prev => ({ ...prev, canReview: false, hasReviewed: true }));
    toast.success("Review posted successfully!");
  };

  if (loading) {
    return (
      <div className="px-6 pb-6 min-h-screen mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4667]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  const transformedSections =
    course?.chapters?.map((chapter, index) => {
      const lectures =
        chapter.lessons?.map((lesson, lessonIndex) => ({
          title: `Lecture ${index + 1}.${lessonIndex + 1} ${lesson.title}`,
          subtitle: lesson.description,
          duration: `${lesson.duration.minutes
            .toString()
            .padStart(2, "0")}:${lesson.duration.seconds
            .toString()
            .padStart(2, "0")}`,
          hasPreview: lesson.isFree,
          id: lesson._id,
          type: lesson.type,
          itemType: "lesson",
        })) || [];

      // Add quizzes at the end of lessons for each chapter
      const quizzes =
        chapter.quizzes?.map((quiz, quizIndex) => {
          const totalMinutes =
            (quiz.timeLimit?.hours || 0) * 60 + (quiz.timeLimit?.minutes || 0);
          return {
            title: `Quiz: ${quiz.title}`,
            subtitle: `${
              quiz.questions?.length || 0
            } questions • ${totalMinutes} minutes`,
            duration: `${totalMinutes}:00`,
            hasPreview: false,
            id: quiz._id,
            type: "quiz",
            itemType: "quiz",
            questionCount: quiz.questions?.length || 0,
            timeLimit: totalMinutes,
            totalMarks: quiz.totalMarks,
            passingMarks: quiz.passingMarks,
          };
        }) || [];

      return {
        title: `Chapter ${index + 1}: ${chapter.title}`,
        lectures: [...lectures, ...quizzes],
      };
    }) || [];

  const transformedQuizzes =
    course?.chapters?.flatMap(
      (chapter, chapterIndex) =>
        chapter.quizzes?.map((quiz) => ({
          id: quiz._id,
          title: `${quiz.title} (Chapter ${chapterIndex + 1}: ${
            chapter.title
          })`,
          questionCount: quiz.questions?.length || 0,
          description: quiz.description,
          timeLimit: quiz.timeLimit,
          totalMarks: quiz.totalMarks,
          passingMarks: quiz.passingMarks,
          chapterTitle: chapter.title,
          chapterIndex: chapterIndex + 1,
        })) || []
    ) || [];

  const totalLectures = course?.totalLessons || 0;
  const totalDuration = course?.totalDuration
    ? `${course.totalDuration.hours
        .toString()
        .padStart(2, "0")}:${course.totalDuration.minutes
        .toString()
        .padStart(2, "0")}:${course.totalDuration.seconds
        .toString()
        .padStart(2, "0")}`
    : "00:00:00";

  return (
    <div>
      <LectureList
        title="Course Content"
        totalLectures={totalLectures}
        totalDuration={totalDuration}
        sections={transformedSections}
        courseId={params.id}
      />
      
      {/* Review Section - Only show for students */}
      {user?.userType === "Student" && reviewEligibility && (
        <div className="mx-5 mt-6 mb-6">
          <div className="bg-white border border-gray-200 rounded-[10px] p-6">
            <h3 className="text-lg font-semibold mb-4">Course Review</h3>
            
            {reviewEligibility.canReview ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-gray-600">
                  Congratulations! You've completed this course and passed all quizzes. 
                  Share your experience to help other students.
                </p>
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="bg-[#392C7D] hover:bg-[#2d1f5f] text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 w-fit"
                >
                  <FaStar className="w-4 h-4" />
                  <span>Post a Review</span>
                </button>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                {reviewEligibility.hasReviewed ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <FaStar className="w-4 h-4" />
                    <span>✓ You have already reviewed this course</span>
                  </div>
                ) : reviewEligibility.progress < 100 ? (
                  <div className="text-orange-600">
                    <p className="font-medium">Complete the course to post a review</p>
                    <p className="text-sm mt-1">Progress: {reviewEligibility.progress}% completed</p>
                  </div>
                ) : reviewEligibility.totalQuizzes > reviewEligibility.passedQuizzes ? (
                  <div className="text-orange-600">
                    <p className="font-medium">Pass all quizzes to post a review</p>
                    <p className="text-sm mt-1">
                      Quizzes passed: {reviewEligibility.passedQuizzes}/{reviewEligibility.totalQuizzes}
                    </p>
                  </div>
                ) : (
                  <div className="text-gray-600">
                    <p>{reviewEligibility.reason}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          courseId={params.id}
          courseName={course?.courseTitle}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
      
      {/* <div className="p-6">
        <UpcomingClasses
          classes={classes}
          isCopyLink={true}
          heading={"Live Classes"}
        />
      </div> */}
    </div>
  );
};

export default CourseDetail;
