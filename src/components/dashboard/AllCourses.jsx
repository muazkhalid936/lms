"use client";
import React, { useState, useEffect } from "react";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Heart,
  Trash,
  RefreshCw,
} from "lucide-react";
import CourseCard from "../landing/CourseCard";
import EnrollmentService from "@/lib/services/enrollmentService";
import WishlistService from "@/lib/services/wishlistService";
import CourseService from "@/lib/services/courseService";
import toast from "react-hot-toast";

const AllCourses = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());
  const [wishlistCourses, setWishlistCourses] = useState([]);
  const [allPublishedCourses, setAllPublishedCourses] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const coursesPerPage = 5;

  // Fetch all published courses
  const fetchAllPublishedCourses = async () => {
    try {
      //console.log("Fetching all published courses...");
      const result = await CourseService.getCourses({
        status: "published",
        limit: 100, // Get all published courses
      });

      //console.log("All published courses result:", result);

      if (result.success) {
        //console.log("All published courses raw data:", result.data);

        if (result.data && Array.isArray(result.data)) {
          // Transform course data to match the expected format
          const courses = result.data.map((course) => ({
            id: course._id,
            title: course.courseTitle,
            image:
              course.thumbnail?.url || course.thumbnail || "/course/thumb1.png",
            avatar: course.instructor?.avatar || "/dashboard/avatar.png",
            instructor: `${course.instructor?.firstName || "Unknown"} ${
              course.instructor?.lastName || "Instructor"
            }`,
            instructorRole: "Instructor",
            category: course.courseCategory || "Course",
            rating: course.rating?.average || 0,
            reviews: course.rating?.count || 0,
            price:
              Number(
                course.hasDiscount ? course.discountPrice : course.coursePrice
              ) || 0,
            originalPrice: Number(course.coursePrice) || 0,
            isFree: course.isFreeCourse || false,
            lessons:
              Number(course.totalLessons) ||
              course.chapters?.reduce((total, chapter) => {
                return total + (chapter.lessons?.length || 0);
              }, 0) ||
              0,
            duration: course.totalDuration
              ? `${course.totalDuration.hours}h ${course.totalDuration.minutes}m`
              : "0h 0m",
            level: course.courseLevel,
            language: course.language,
            isPublished: course.status === "published",
            createdAt: course.createdAt,
          }));
          setAllPublishedCourses(courses);
          //console.log("All published courses set:", courses.length);
        } else {
          setAllPublishedCourses([]);
          //console.log("No published courses data");
        }
      } else {
        //console.log("Published courses fetch failed:", result.message);
        setAllPublishedCourses([]);
        if (result.message) {
          setError(result.message);
        }
      }
    } catch (error) {
      console.error("Error fetching all published courses:", error);
      setAllPublishedCourses([]);
      setError("Failed to fetch published courses");
    }
  };

  // Fetch enrolled courses
  const fetchEnrolledCourses = async () => {
    try {
      //console.log("Fetching enrolled courses...");
      const result = await EnrollmentService.getUserEnrollments({
        status: "active",
        limit: 100, // Get all enrolled courses
      });

      //console.log("Enrolled courses result:", result);

      if (result.success) {
        //console.log("Enrolled courses raw data:", result.data?.enrollments);

        if (result.data?.enrollments) {
          // Transform enrollment data to course format
          const courses = result.data.enrollments.map((enrollment) => ({
            id: enrollment.course._id,
            title: enrollment.course.courseTitle,
            image:
              enrollment.course.thumbnail?.url ||
              enrollment.course.thumbnail ||
              "/course/thumb1.png",
            avatar:
              enrollment.course.instructor?.avatar || "/dashboard/avatar.png",
            instructor: `${
              enrollment.course.instructor?.firstName || "Unknown"
            } ${enrollment.course.instructor?.lastName || "Instructor"}`,
            instructorRole: "Instructor",
            category: "Course",
            rating: course.rating?.average || 0,
            reviews: course.rating?.count || 0,
            price:
              Number(
                enrollment.course.hasDiscount
                  ? enrollment.course.discountPrice
                  : enrollment.course.coursePrice
              ) || 0,
            originalPrice: Number(enrollment.course.coursePrice) || 0,
            isFree: enrollment.course.isFreeCourse || false,
            lessons: Number(enrollment.course.totalLessons) || 0,
            duration: enrollment.course.totalDuration
              ? `${enrollment.course.totalDuration.hours}h ${enrollment.course.totalDuration.minutes}m`
              : "0h 0m",
            enrollmentStatus: enrollment.status,
            enrolledAt: enrollment.enrolledAt,
            isBuy: true,
          }));
          setEnrolledCourses(courses);
          // Create a Set of enrolled course IDs for quick lookup
          setEnrolledCourseIds(new Set(courses.map((course) => course.id)));
          //console.log("Enrolled courses set:", courses.length);
        } else {
          setEnrolledCourses([]);
          setEnrolledCourseIds(new Set());
          //console.log("No enrolled courses data");
        }
      } else {
        //console.log("Enrolled courses fetch failed:", result.message);
        setEnrolledCourses([]);
        setEnrolledCourseIds(new Set());
        // Don't set error for enrolled courses if user is not authenticated
        if (result.message && !result.message.includes("Authentication")) {
          setError(result.message);
        }
      }
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      setEnrolledCourses([]);
      setEnrolledCourseIds(new Set());
      // setError("Failed to fetch enrolled courses");
    }
  };

  // Fetch wishlist courses
  const fetchWishlistCourses = async () => {
    try {
      //console.log("Fetching wishlist courses...");
      const result = await WishlistService.getUserWishlist({
        limit: 100, // Get all wishlist courses
      });

      //console.log("Wishlist courses result:", result);

      if (result.success) {
        //console.log("Wishlist courses raw data:", result.data?.wishlist);

        if (result.data?.wishlist) {
          // Transform wishlist data to course format
          const courses = result.data.wishlist.map((wishlistItem) => ({
            id: wishlistItem.course._id,
            title: wishlistItem.course.courseTitle,
            image:
              wishlistItem.course.thumbnail?.url ||
              wishlistItem.course.thumbnail ||
              "/course/thumb1.png",
            avatar:
              wishlistItem.course.instructor?.avatar || "/dashboard/avatar.png",
            instructor: `${
              wishlistItem.course.instructor?.firstName || "Unknown"
            } ${wishlistItem.course.instructor?.lastName || "Instructor"}`,
            instructorRole: "Instructor",
            category: "Course",
            rating: course.rating?.average || 0,
            reviews: course.rating?.count || 0,
            price:
              Number(
                wishlistItem.course.hasDiscount
                  ? wishlistItem.course.discountPrice
                  : wishlistItem.course.coursePrice
              ) || 0,
            originalPrice: Number(wishlistItem.course.coursePrice) || 0,
            lessons: Number(wishlistItem.course.totalLessons) || 0,
            duration: "Variable", // This would need to be calculated
            addedAt: wishlistItem.addedAt,
          }));
          setWishlistCourses(courses);
          setWishlistIds(courses.map((course) => course.id));
          //console.log("Wishlist courses set:", courses.length);
        } else {
          setWishlistCourses([]);
          setWishlistIds([]);
          //console.log("No wishlist courses data");
        }
      } else {
        //console.log("Wishlist courses fetch failed:", result.message);
        setWishlistCourses([]);
        setWishlistIds([]);
        // Don't set error for wishlist if user is not authenticated
        if (result.message && !result.message.includes("Authentication")) {
          setError(result.message);
        }
      }
    } catch (error) {
      console.error("Error fetching wishlist courses:", error);
      setWishlistCourses([]);
      setWishlistIds([]);
      // setError("Failed to fetch wishlist courses");
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        //console.log("Loading course data...");
        await Promise.all([
          fetchAllPublishedCourses(),
          fetchEnrolledCourses(),
          fetchWishlistCourses(),
        ]);
        //console.log("Course data loaded successfully");
      } catch (error) {
        setError("Failed to load course data");
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Retry function
  const retryLoadData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchAllPublishedCourses(),
        fetchEnrolledCourses(),
        fetchWishlistCourses(),
      ]);
      toast.success("Data refreshed successfully");
    } catch (error) {
      setError("Failed to refresh data");
      toast.error("Failed to refresh data");
      console.error("Error refreshing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (courseId) => {
    // Check if user is authenticated
    const userId = localStorage.getItem("userId");
    //console.log("Toggling wishlist for course:", courseId, "User ID:", userId);
    if (!userId) {
      toast.error("Please log in to manage your wishlist");
      return;
    }

    try {
      //console.log("User:", userId, "Toggling wishlist for course:", courseId);

      if (wishlistIds.includes(courseId)) {
        // Remove from wishlist
        //console.log("Removing from wishlist...");
        const result = await WishlistService.removeFromWishlist(courseId);
        //console.log("Remove result:", result);

        if (result.success) {
          setWishlistIds((prev) => prev.filter((id) => id !== courseId));
          setWishlistCourses((prev) =>
            prev.filter((course) => course.id !== courseId)
          );
          toast.success("Course removed from wishlist");
        } else {
          console.error("Remove from wishlist failed:", result);
          toast.error(result.message || "Failed to remove from wishlist");
          setError(result.message);
        }
      } else {
        // Add to wishlist
        //console.log("Adding to wishlist...");
        const result = await WishlistService.addToWishlist(courseId);
        //console.log("Add result:", result);

        if (result.success) {
          setWishlistIds((prev) => [...prev, courseId]);
          // Refresh wishlist to get the updated data
          await fetchWishlistCourses();
          toast.success("Course added to wishlist");
        } else {
          console.error("Add to wishlist failed:", result);

          // Handle specific error cases
          if (result.message && result.message.includes("duplicate")) {
            toast.error("Course is already in your wishlist");
          } else if (
            result.message &&
            result.message.includes("authentication")
          ) {
            toast.error("Please log in to add courses to wishlist");
          } else {
            toast.error(result.message || "Failed to add to wishlist");
          }
          setError(result.message);
        }
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);

      // Handle specific error types
      if (error.message && error.message.includes("duplicate")) {
        toast.error("Course is already in your wishlist");
      } else if (error.message && error.message.includes("401")) {
        toast.error("Please log in to manage your wishlist");
      } else {
        toast.error("Failed to update wishlist");
      }
      setError("Failed to update wishlist");
    }
  };

  const getFilteredCourses = () => {
    // Helper function to add enrollment status to courses
    const addEnrollmentStatus = (courses) => {
      return courses.map((course) => ({
        ...course,
        isBuy: enrolledCourseIds.has(course.id),
      }));
    };

    switch (activeTab) {
      case "enrolled":
        return enrolledCourses.map((course) => ({ ...course, isBuy: true }));
      case "wishlist":
        return addEnrollmentStatus(wishlistCourses);
      case "recommended":
        // Show published courses that are not enrolled and not in wishlist
        return allPublishedCourses
          .filter(
            (course) =>
              !enrolledCourseIds.has(course.id) &&
              !wishlistIds.includes(course.id)
          )
          .map((course) => ({ ...course, isBuy: false }));
      case "all":
      default:
        // Show all published courses with enrollment status
        return addEnrollmentStatus(allPublishedCourses);
    }
  };

  const filteredCourses = getFilteredCourses();
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const startIndex = (currentPage - 1) * coursesPerPage;
  const endIndex = startIndex + coursesPerPage;
  const currentCourses = filteredCourses.slice(startIndex, endIndex);

  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);

    // Refresh data when switching to specific tabs to ensure we have latest data
    if (tab === "wishlist") {
      setLoading(true);
      await fetchWishlistCourses();
      setLoading(false);
    } else if (tab === "enrolled") {
      setLoading(true);
      await fetchEnrolledCourses();
      setLoading(false);
    } else if (tab === "all") {
      setLoading(true);
      await fetchAllPublishedCourses();
      setLoading(false);
    }
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const totalCourses = allPublishedCourses.length;
  const enrolledCount = enrolledCourses.length;
  const wishlistCount = wishlistCourses.length;
  const recommendedCount = allPublishedCourses.filter(
    (course) =>
      !enrolledCourseIds.has(course.id) && !wishlistIds.includes(course.id)
  ).length;

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
    return (
      <div className="px-6 pb-6 min-h-screen mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={retryLoadData}
              className="px-4 py-2 bg-[#FF4667] text-white rounded-lg hover:bg-[#FF4667]/90"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pb-6 min-h-screen mx-auto">
      <div className="border-b border-gray-200 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-[20px] font-bold text-gray-900">Explore</h1>
          <button
            onClick={retryLoadData}
            disabled={loading}
            className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Refresh courses"
          >
            <RefreshCw
              className={`w-4 h-4 text-gray-600 ${
                loading ? "animate-spin" : ""
              }`}
            />
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleTabChange("all")}
            className={`px-4 py-2 cursor-pointer rounded-full text-sm font-medium transition-colors ${
              activeTab === "all"
                ? "bg-[#FF4667] text-white"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            All
          </button>
          {/* <button
            onClick={() => handleTabChange("enrolled")}
            className={`px-4 py-2 cursor-pointer rounded-full text-sm font-medium transition-colors ${
              activeTab === "enrolled"
                ? "bg-[#FF4667] text-white"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            Enrolled 
          </button> */}
          <button
            onClick={() => handleTabChange("wishlist")}
            className={`px-4 py-2 cursor-pointer rounded-full text-sm font-medium transition-colors ${
              activeTab === "wishlist"
                ? "bg-[#FF4667] text-white"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            Wishlist
          </button>
          <button
            onClick={() => handleTabChange("recommended")}
            className={`px-4 py-2 cursor-pointer rounded-full text-sm font-medium transition-colors ${
              activeTab === "recommended"
                ? "bg-[#FF4667] text-white"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            Recommended
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {currentCourses.length > 0 ? (
          currentCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={wishlistIds.includes(course.id)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            {activeTab === "all" && allPublishedCourses.length === 0 && (
              <div className="text-gray-500">
                <p className="mb-2">No published courses found.</p>
                <p className="text-sm">Check back later for new courses!</p>
              </div>
            )}
            {activeTab === "enrolled" && enrolledCourses.length === 0 && (
              <div className="text-gray-500">
                <p className="mb-2">You haven't enrolled in any courses yet.</p>
                <p className="text-sm">
                  Browse available courses and start learning!
                </p>
              </div>
            )}
            {activeTab === "wishlist" && wishlistCourses.length === 0 && (
              <div className="text-gray-500">
                <p className="mb-2">Your wishlist is empty.</p>
                <p className="text-sm">
                  Add courses to your wishlist to see them here!
                </p>
              </div>
            )}
            {activeTab === "recommended" &&
              allPublishedCourses.filter(
                (course) =>
                  !enrolledCourseIds.has(course.id) &&
                  !wishlistIds.includes(course.id)
              ).length === 0 && (
                <div className="text-gray-500">
                  <p className="mb-2">No recommended courses available.</p>
                  <p className="text-sm">
                    All courses are either enrolled or in your wishlist!
                  </p>
                </div>
              )}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-2">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`w-10 h-10 rounded-full font-medium transition-colors ${
                currentPage === page
                  ? "bg-[#FF4667] text-white"
                  : "border border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AllCourses;
