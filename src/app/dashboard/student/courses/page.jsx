"use client";
import React, { useState, useEffect } from "react";
import { Search, BookOpen, Clock, User, RefreshCw } from "lucide-react";
import CourseCard from "@/components/landing/CourseCard";
import EnrollmentService from "@/lib/services/enrollmentService";
import WishlistService from "@/lib/services/wishlistService";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const StudentCoursesPage = () => {
  const router = useRouter();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [wishlistCourses, setWishlistCourses] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 9;

  // Fetch enrolled courses
  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await EnrollmentService.getUserEnrollments({
        status: statusFilter === "all" ? undefined : statusFilter,
        limit: 100, // Get all enrolled courses
      });

      if (result.success) {
        console.log(result.data?.enrollments)
        if (result.data?.enrollments) {

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
              enrollment.course.instructor?.firstName ||
              enrollment.course.instructor?.userName ||
              "Unknown Instructor"
            }`,
            instructorRole: "Instructor",
            category: "Course",
            rating: enrollment.course.rating?.average || 0,
            reviews: enrollment.course.rating?.count || 0,
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
            progress: enrollment.progress || 0,
            completedLessons: enrollment.completedLessons?.length || 0,
          }));

          setEnrolledCourses(courses);
          setFilteredCourses(courses);
        } else {
          setEnrolledCourses([]);
          setFilteredCourses([]);
        }
      } else {
        setError(result.message || "Failed to fetch enrolled courses");
        toast.error(result.message || "Failed to fetch enrolled courses");
      }
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      setError("Failed to fetch enrolled courses");
      toast.error("Failed to fetch enrolled courses");
    } finally {
      setLoading(false);
    }
  };

  // Fetch wishlist courses
  const fetchWishlistCourses = async () => {
    try {
      const result = await WishlistService.getUserWishlist({
        limit: 100, // Get all wishlist courses
      });

      if (result.success) {
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
            instructor:
              wishlistItem.course.instructor?.firstName || 
              wishlistItem.course.instructor?.userName ||
              "Unknown Instructor",
            instructorRole: "Instructor",
            category: "Course",
            rating: wishlistItem.course.rating?.average || 0,
            reviews: wishlistItem.course.rating?.count || 0,
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
        } else {
          setWishlistCourses([]);
          setWishlistIds([]);
        }
      } else {
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
    }
  };

  // Filter courses based on search query
  useEffect(() => {
    let filtered = enrolledCourses;

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCourses(filtered);
    setCurrentPage(1);
  }, [searchQuery, enrolledCourses]);

  // Load courses on component mount
  useEffect(() => {
    fetchEnrolledCourses();
    fetchWishlistCourses(); // Also fetch wishlist data
  }, [statusFilter]);

  // Handle refresh
  const handleRefresh = () => {
    fetchEnrolledCourses();
    fetchWishlistCourses(); // Also refresh wishlist data
  };

  // Handle wishlist toggle
  const handleToggleFavorite = async (courseId) => {
    // Check if user is authenticated
    const userId = localStorage.getItem("userId");
    if (!userId) {
      toast.error("Please log in to manage your wishlist");
      return;
    }

    try {
      if (wishlistIds.includes(courseId)) {
        // Remove from wishlist
        const result = await WishlistService.removeFromWishlist(courseId);

        if (result.success) {
          setWishlistIds((prev) => prev.filter((id) => id !== courseId));
          setWishlistCourses((prev) =>
            prev.filter((course) => course.id !== courseId)
          );
          toast.success("Course removed from wishlist");
        } else {
          console.error("Remove from wishlist failed:", result);
          toast.error(result.message || "Failed to remove from wishlist");
        }
      } else {
        // Add to wishlist
        const result = await WishlistService.addToWishlist(courseId);

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
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const startIndex = (currentPage - 1) * coursesPerPage;
  const endIndex = startIndex + coursesPerPage;
  const currentCourses = filteredCourses.slice(startIndex, endIndex);

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

  if (loading) {
    return (
      <div className="px-6 pb-6 min-h-screen mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4667]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pb-6 min-h-screen mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Courses
            </h1>
            <p className="text-gray-600">
              Manage and continue your learning journey
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#342777] text-white rounded-lg hover:bg-[#2a1f5f] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Courses</p>
                <p className="text-xl font-semibold text-gray-900">
                  {enrolledCourses.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-xl font-semibold text-gray-900">
                  {
                    enrolledCourses.filter(
                      (course) => course.enrollmentStatus === "active"
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-xl font-semibold text-gray-900">
                  {
                    enrolledCourses.filter(
                      (course) => course.enrollmentStatus === "completed"
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        {/* <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search your courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#342777] focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#342777] focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
          </select>
        </div> */}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <p className="text-red-700">{error}</p>
            </div>
            <button
              onClick={handleRefresh}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery ? "No courses found" : "No enrolled courses"}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery
              ? "Try adjusting your search criteria"
              : "Start learning by exploring our course catalog"}
          </p>
          {!searchQuery && (
            <button
              onClick={() => router.push("/dashboard/student/explore")}
              className="bg-[#342777] text-white px-6 py-3 rounded-lg hover:bg-[#2a1f5f] transition-colors"
            >
              Explore Courses
            </button>
          )}
        </div>
      )}

      {/* Courses Grid */}
      {!loading && filteredCourses.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {currentCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                isFavorite={wishlistIds.includes(course.id)}
                onToggleFavorite={() => handleToggleFavorite(course.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                return (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-2 rounded-lg ${
                      currentPage === page
                        ? "bg-[#342777] text-white"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudentCoursesPage;
