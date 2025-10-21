"use client";
import Header from "@/components/landing/Header";
import Navbar from "@/components/landing/Navbar";
import CourseDetailHeader from "@/components/CouseDetail/CourseDetailHeader";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Content from "@/components/CouseDetail/Content";
import About from "@/components/CouseDetail/About";
import Desc from "@/components/course/Desc";
import Comment from "@/components/CouseDetail/Comment";
import ReviewModal from "@/components/CouseDetail/ReviewModal";
import CourseReviews from "@/components/CouseDetail/CourseReviews";
import Footer from "@/components/landing/Footer";
import useAuthStore from "@/store/authStore";
import Reviews from "@/components/dashboard/profile/Reviews";
import { useParams } from "next/navigation";
import CourseService from "@/lib/services/courseService";
import EnrollButton from "@/components/course/EnrollButton";
import WishlistButton from "@/components/course/WishlistButton";
import EnrollmentService from "@/lib/services/enrollmentService";
import {
  FaCheckCircle,
  FaUserGraduate,
  FaSignInAlt,
  FaShare,
  FaStar,
} from "react-icons/fa";

const page = () => {
  const { user } = useAuthStore();
  const params = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [reviewEligibility, setReviewEligibility] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsPagination, setReviewsPagination] = useState(null);
  const [ratingStats, setRatingStats] = useState(null);

  const fetchCourse = async () => {
    try {
      setLoading(true);

      // Fetch course with all necessary data in one API call
      const options = {
        includeReviews: true,
        reviewsLimit: 10,
        reviewsPage: 1,
      };

      // Include enrollment and review eligibility data if user is logged in
      if (user && user.userType === "Student") {
        options.includeEnrollmentStatus = true;
        options.includeReviewEligibility = true;
      }

      const result = await CourseService.getCourseDetailed(params.id, options);

      console.log(result.data);
      if (result.success) {
        setCourse(result.data);

        // Set reviews data if available
        if (result.data.reviews) {
          setReviews(result.data.reviews.data);
          setReviewsPagination(result.data.reviews.pagination);
          setRatingStats(result.data.reviews.ratingStats);
        }

        // Set enrollment status if available
        if (result.data.enrollmentStatus) {
          setIsEnrolled(result.data.enrollmentStatus.isEnrolled);
        }

        // Set review eligibility if available
        if (result.data.reviewEligibility) {
          setReviewEligibility(result.data.reviewEligibility);
        }
      } else {
        setError(result.message || "Failed to fetch course");
      }
    } catch (err) {
      setError("An error occurred while fetching the course");
      console.error("Error fetching course:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (params.id) {
      fetchCourse();
    }
  }, [params.id, user]);

  // Load more reviews function
  const handleLoadMoreReviews = async () => {
    if (!reviewsPagination?.hasNextPage) return;

    setReviewsLoading(true);
    try {
      const nextPage = reviewsPagination.currentPage + 1;
      const result = await CourseService.getCourse(params.id, {
        includeReviews: true,
        reviewsPage: nextPage,
        reviewsLimit: 10,
      });

      if (result.success && result.data.reviews) {
        setReviews((prev) => [...prev, ...result.data.reviews.data]);
        setReviewsPagination(result.data.reviews.pagination);
      }
    } catch (error) {
      console.error("Error loading more reviews:", error);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Check enrollment status when user and course are loaded (fallback for non-detailed API)
  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      if (
        user &&
        course &&
        user.userType === "Student" &&
        course.enrollmentStatus === undefined
      ) {
        setEnrollmentLoading(true);
        try {
          const result = await EnrollmentService.checkEnrollmentStatus(
            params.id
          );
          if (result.success) {
            setIsEnrolled(result.data.isEnrolled);
          }
        } catch (error) {
          console.error("Error checking enrollment status:", error);
        } finally {
          setEnrollmentLoading(false);
        }
      }
    };

    checkEnrollmentStatus();
  }, [user, course, params.id]);

  // Check review eligibility when user and course are loaded (fallback for non-detailed API)
  useEffect(() => {
    const checkReviewEligibility = async () => {
      if (
        user &&
        course &&
        user.userType === "Student" &&
        isEnrolled &&
        course.reviewEligibility === undefined
      ) {
        try {
          const response = await fetch(
            `/api/courses/${params.id}/reviews/eligibility`,
            {
              method: "GET",
              credentials: "include",
            }
          );
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
  }, [user, course, params.id, isEnrolled]);

  const handleEnrollmentSuccess = (enrollment) => {
    setIsEnrolled(true);
    // You can add more success handling here, like showing a success message
    //console.log("Enrollment successful:", enrollment);
  };

  const handleWishlistToggle = (isInWishlist) => {
    //console.log("Wishlist status changed:", isInWishlist);
    // You can add UI feedback here if needed
  };

  const handleReviewSubmitted = (newReview) => {
    // Refresh review eligibility after submitting a review
    setReviewEligibility((prev) => ({
      ...prev,
      canReview: false,
      hasReviewed: true,
    }));

    // Add the new review to the top of the reviews list
    setReviews((prev) => [newReview, ...prev]);

    // Update rating stats if available
    if (ratingStats) {
      const newCount = ratingStats.count + 1;
      const newTotal =
        ratingStats.average * ratingStats.count + newReview.rating;
      const newAverage = newTotal / newCount;
      setRatingStats((prev) => ({
        ...prev,
        average: newAverage,
        count: newCount,
      }));
    }
  };

  // Helper function to format duration
  const formatDuration = (duration) => {
    if (!duration) return "0min";

    const h = duration.hours || 0;
    const m = duration.minutes || 0;
    const s = duration.seconds || 0;

    if (h > 0) {
      return `${h}h ${m}m`;
    } else if (m > 0) {
      return `${m}m ${s > 0 ? ` ${s}s` : ""}`;
    } else {
      return `${s}s`;
    }
  };

  // Calculate total video duration
  const calculateTotalVideoDuration = () => {
    if (!course?.chapters) return { hours: 0, minutes: 0, seconds: 0 };

    let totalSeconds = 0;

    course.chapters.forEach((chapter) => {
      chapter.lessons?.forEach((lesson) => {
        if (
          (lesson.type === "video" || lesson.type === "youtube") &&
          lesson.duration
        ) {
          totalSeconds +=
            (lesson.duration.hours || 0) * 3600 +
            (lesson.duration.minutes || 0) * 60 +
            (lesson.duration.seconds || 0);
        }
      });
    });

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { hours, minutes, seconds };
  };

  const totalVideoDuration = calculateTotalVideoDuration();

  const getVideoStats = () => {
    if (!course?.chapters) return { totalVideos: 0, breakdown: [] };

    let totalVideos = 0;
    const breakdown = course.chapters.map((chapter) => {
      const videoLessons =
        chapter.lessons?.filter(
          (lesson) => lesson.type === "video" || lesson.type === "youtube"
        ) || [];

      let chapterVideoSeconds = 0;
      videoLessons.forEach((lesson) => {
        if (lesson.duration) {
          chapterVideoSeconds +=
            (lesson.duration.hours || 0) * 3600 +
            (lesson.duration.minutes || 0) * 60 +
            (lesson.duration.seconds || 0);
        }
      });

      totalVideos += videoLessons.length;

      const hours = Math.floor(chapterVideoSeconds / 3600);
      const minutes = Math.floor((chapterVideoSeconds % 3600) / 60);
      const seconds = chapterVideoSeconds % 60;

      return {
        chapterTitle: chapter.title,
        videoCount: videoLessons.length,
        duration: { hours, minutes, seconds },
        formattedDuration: formatDuration({ hours, minutes, seconds }),
      };
    });

    return { totalVideos, breakdown };
  };

  const videoStats = getVideoStats();

  const includes = course
    ? [
        {
          title: `${formatDuration(totalVideoDuration)} of on-demand video`,
          img: "/CourseDetails/video.svg",
        },
        {
          title: `${videoStats.totalVideos} downloadable resources`,
          img: "/CourseDetails/download.svg",
        },
        {
          title: " Full lifetime access",
          img: "/CourseDetails/access.svg",
        },
        {
          title: "Assignment",
          img: "/CourseDetails/assignments.svg",
        },
        {
          title: "Certification of completion",
          img: "/CourseDetails/certificate.svg",
        },
      ]
    : [];
  const features = course
    ? [
        {
          title: `Enrolled: ${
            course.enrolledStudents.length || course.studentsCount || 0
          } students`,
          img: "/CourseDetails/enrolled_student.svg",
        },
        {
          title: `Duration: ${
            course.totalDuration
              ? formatDuration(course.totalDuration)
              : formatDuration(totalVideoDuration)
          }`,
          img: "/CourseDetails/p.svg",
        },
        {
          title: `Chapter: ${course.chapters?.length || 12}`,
          img: "/CourseDetails/Chapter.svg",
        },
        {
          title: `Videos: ${videoStats.totalVideos}`,
          img: "/CourseDetails/videoPurple.svg",
        },
        {
          title: `Level: ${course.courseLevel || "Beginner"}`,
          img: "/CourseDetails/level.svg",
        },
      ]
    : [];

  // Loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <Header title="Course Details" />
        <div className="max-w-[1440px] flex flex-col gap-4 mx-auto px-4 py-16 sm:px-10 w-full">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#392C7D]"></div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Navbar />
        <Header title="Course Details" />
        <div className="max-w-[1440px] flex flex-col gap-4 mx-auto px-4 py-16 sm:px-10 w-full">
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <h2 className="text-2xl font-semibold text-red-600 mb-4">
              Error Loading Course
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#392C7D] text-white px-6 py-2 rounded-full hover:bg-[#2d1f5f] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Course not found
  if (!course) {
    return (
      <>
        <Navbar />
        <Header title="Course Details" />
        <div className="max-w-[1440px] flex flex-col gap-4 mx-auto px-4 py-16 sm:px-10 w-full">
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Course Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              The course you're looking for doesn't exist or has been removed.
            </p>
            <a
              href="/courses"
              className="bg-[#392C7D] text-white px-6 py-2 rounded-full hover:bg-[#2d1f5f] transition-colors"
            >
              Browse All Courses
            </a>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  return (
    <>
      <Navbar />
      <Header title="Course Details" />
      <div className="max-w-[1440px] flex flex-col gap-4 mx-auto px-4 py-16 sm:px-10 w-full">
        <CourseDetailHeader course={course} />

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex flex-1 flex-col gap-4">
            <Desc course={course} />
            <Content course={course} />

            {user?.userType === "Instructor" ? (
              <Reviews />
            ) : (
              <div className="flex flex-col gap-4">
                <About course={course} />
                <CourseReviews
                  reviews={reviews}
                  ratingStats={ratingStats}
                  onLoadMore={
                    reviewsPagination?.hasNextPage
                      ? handleLoadMoreReviews
                      : null
                  }
                  loading={reviewsLoading}
                />
                {/* <Comment course={course} /> */}
              </div>
            )}
          </div>

          <div className="w-full lg:w-[366px] flex flex-col gap-6 ">
            <div className="rounded-[10px] flex flex-col gap-3 border border-[#e7e7e7] p-6">
              <div className="flex  items-center justify-between">
                <div className="text-[30px] font-semibold text-[#03C95A]">
                  <div className="flex items-center space-x-3">
                    {course.isFreeCourse ? (
                      <span className="text-[#03C95A] text-[28px] font-semibold">
                        Free
                      </span>
                    ) : course.discountPrice ? (
                      <>
                        <span className="text-[#03C95A] text-[28px] font-semibold">
                          ${course.discountPrice}
                        </span>
                        <span className="line-through text-[#6D6D6D] text-[16px] font-normal">
                          ${course.coursePrice}
                        </span>
                        <span className="bg-[#03C95A]/10 text-[#03C95A] text-xs font-medium px-2 py-1 rounded-full">
                          Save{" "}
                          {Math.round(
                            ((course.coursePrice - course.discountPrice) /
                              course.coursePrice) *
                              100
                          )}
                          %
                        </span>
                      </>
                    ) : (
                      <span className="text-[#03C95A] text-[28px] font-semibold">
                        ${course.coursePrice}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between gap-4 flex-col sm:flex-row">
                <WishlistButton
                  course={course}
                  onWishlistToggle={handleWishlistToggle}
                />

                <button className="whitespace-nowrap border-[#E7E7E7]  rounded-full px-6 py-2 border w-full flex items-center justify-center gap-2">
                  <FaShare className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>

              {/* Enrollment Section */}
              {user?.userType === "Student" ? (
                !isEnrolled ? (
                  <EnrollButton
                    course={course}
                    onEnrollmentSuccess={handleEnrollmentSuccess}
                  />
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="bg-green-100 border border-green-300 rounded-full px-6 py-2 text-green-700 text-center w-full flex items-center justify-center gap-2">
                      <FaCheckCircle className="w-4 h-4" />
                      <span>Already Enrolled</span>
                    </div>

                    {/* Review Button */}
                    {reviewEligibility?.canReview && (
                      <button
                        onClick={() => setShowReviewModal(true)}
                        className="bg-[#392C7D] rounded-full px-6 py-2 text-white text-center w-full hover:bg-[#2d1f5f] transition-colors flex items-center justify-center gap-2"
                      >
                        <FaStar className="w-4 h-4" />
                        <span>Post a Review</span>
                      </button>
                    )}
                  </div>
                )
              ) : user?.userType === "Instructor" ? (
                <div className="bg-gray-100 border border-gray-300 rounded-full px-6 py-2 text-gray-600 text-center w-full flex items-center justify-center gap-2">
                  <FaUserGraduate className="w-4 h-4" />
                  <span>Instructors cannot enroll in courses</span>
                </div>
              ) : (
                <a
                  href="/auth/login"
                  className="bg-[#392C7D] rounded-full px-6 py-2 text-white text-center w-full hover:bg-[#2d1f5f] transition-colors flex items-center justify-center gap-2"
                >
                  <FaSignInAlt className="w-4 h-4" />
                  <span>Login to Enroll</span>
                </a>
              )}
            </div>

            <div className="rounded-[10px] flex flex-col gap-3 border border-[#e7e7e7] p-6">
              <p className="text-black text-[20px] font-semibold">Includes</p>

              {includes.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 text-[#6D6D6D] text-[14px]"
                >
                  <Image
                    src={item.img}
                    alt={item.title}
                    width={24}
                    height={24}
                    className="w-[24px] h-[24px] object-contain"
                  />
                  <p className="capitalized">{item.title}</p>
                </div>
              ))}
            </div>
            <div className="rounded-[10px] flex flex-col gap-3 border border-[#e7e7e7] p-6">
              <p className="text-black text-[20px] font-semibold">
                Course Features
              </p>

              {features.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 text-[#6D6D6D] text-[14px]"
                >
                  <Image
                    src={item.img}
                    alt={item.title}
                    width={24}
                    height={24}
                    className="w-[24px] h-[24px] object-contain"
                  />
                  <p className="capitalize">{item.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

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

      <Footer />
    </>
  );
};

export default page;
