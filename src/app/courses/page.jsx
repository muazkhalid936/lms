"use client";
import FilterSidebar from "@/components/landing/FilterSidebar";
import Header from "@/components/landing/Header";
import Navbar from "@/components/landing/Navbar";
import React, { useMemo, useState, useEffect } from "react";
import CourseCard from "@/components/landing/CourseCard";
import { CiSearch } from "react-icons/ci";
import Footer from "@/components/landing/Footer";
import CourseService from "@/lib/services/courseService";
import EnrollmentService from "@/lib/services/enrollmentService";

export default function CourseListingPage() {
  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [selectedRating, setSelectedRating] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [page, setPage] = useState(1);
  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch enrolled courses
  const fetchEnrolledCourses = async () => {
    try {
      const result = await EnrollmentService.getUserEnrollments({
        status: "active",
        limit: 100,
      });

      if (result.success && result.data?.enrollments) {
        const enrolledIds = result.data.enrollments.map(
          (enrollment) => enrollment.course._id
        );
        setEnrolledCourseIds(new Set(enrolledIds));
      } else {
        setEnrolledCourseIds(new Set());
      }
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      setEnrolledCourseIds(new Set());
    }
  };

  // Fetch courses from API
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch both courses and enrollments in parallel
      const [coursesResponse] = await Promise.all([
        CourseService.getCourses(),
        fetchEnrolledCourses(),
      ]);

      //console.log("Fetched courses:", coursesResponse);
      if (coursesResponse.success) {
        // Transform API data to match CourseCard component expectations
        const transformedCourses = coursesResponse.data.map((course) => ({
          id: course._id,
          title: course.courseTitle,
          instructor: course.instructor?.firstName || "Anonymous",
          avatar: course.instructor?.avatar || "Anonymous",
          image: course.thumbnail?.url || "/course/thumb1.png",
          price: course.discountPrice || 0,
          originalPrice: course.coursePrice || course.pricing?.price || 0,
          rating: course.rating?.average || 0,
          reviews: course.rating?.count || 0,
          students: course.totalStudents || 0,
          category: course.courseCategory || "General",
          level: course.courseLevel || "Beginner",
          duration: course.totalDuration
            ? `${course.totalDuration.hours}h ${course.totalDuration.minutes}m`
            : "0h 0m",
          lessons: course.totalLessons || 0,
          tags: course.tags || [],
          isFree: course.isFreeCourse || false,
          discount: course.discountPrice || 0,
        }));

        setCourses(transformedCourses);
      } else {
        setError(coursesResponse.message || "Failed to fetch courses");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("An error occurred while fetching courses");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const itemsPerPage = 9;

  // Helper functions for filter handlers
  const handleToggleCategory = (category) => {
    const newCategories = new Set(selectedCategories);
    if (newCategories.has(category)) {
      newCategories.delete(category);
    } else {
      newCategories.add(category);
    }
    setSelectedCategories(newCategories);
    setPage(1); // Reset to first page when filter changes
  };

  const handlePriceChange = (price) => {
    setSelectedPrice(price);
    setPage(1);
  };

  const handleRatingChange = (rating) => {
    setSelectedRating(rating);
    setPage(1);
  };

  const handleLevelChange = (level) => {
    setSelectedLevel(level);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSelectedCategories(new Set());
    setSelectedPrice("all");
    setSelectedRating(null);
    setSelectedLevel("all");
    setPage(1);
  };

  // Get available categories from courses data
  const availableCategories = useMemo(() => {
    const categories = [...new Set(courses.map((course) => course.category))];
    return categories.filter(Boolean); // Remove any null/undefined categories
  }, [courses]);

  // Filter logic
  const filteredCourses = useMemo(() => {
    //console.log("Applying filters:", {
    //  query,
    //  selectedCategories: Array.from(selectedCategories),
    //  selectedPrice,
    //  selectedRating,
    //  selectedLevel,
    //  totalCourses: courses.length
    //});

    const filtered = courses.filter((course) => {
      const matchesQuery =
        query === "" ||
        course.title.toLowerCase().includes(query.toLowerCase()) ||
        course.instructor.toLowerCase().includes(query.toLowerCase()) ||
        course.category.toLowerCase().includes(query.toLowerCase());

      const matchesCategory =
        selectedCategories.size === 0 ||
        selectedCategories.has(course.category);

      const matchesPrice =
        selectedPrice === "all" ||
        (selectedPrice === "free" && (course.isFree || course.price === 0)) ||
        (selectedPrice === "paid" && !course.isFree && course.price > 0);

      const matchesRating = !selectedRating || course.rating >= selectedRating;

      const matchesLevel =
        selectedLevel === "all" ||
        course.level.toLowerCase() === selectedLevel.toLowerCase();

      const passes =
        matchesQuery &&
        matchesCategory &&
        matchesPrice &&
        matchesRating &&
        matchesLevel;

      // Log details for debugging
      if (!passes) {
        //console.log(`Course "${course.title}" filtered out:`, {
        //  matchesQuery,
        //  matchesCategory,
        //  matchesPrice,
        //  matchesRating,
        //  matchesLevel,
        //  courseData: {
        //    category: course.category,
        //    price: course.price,
        //    isFree: course.isFree,
        //    rating: course.rating,
        //    level: course.level
        //  }
        //});
      }

      return passes;
    });

    //console.log(`Filtered results: ${filtered.length} out of ${courses.length} courses`);
    return filtered;
  }, [
    courses,
    query,
    selectedCategories,
    selectedPrice,
    selectedRating,
    selectedLevel,
  ]);

  // Pagination logic
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const pageData = filteredCourses.slice(startIndex, startIndex + itemsPerPage);

  return (
    <main>
      <Navbar />
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <FilterSidebar
              availableCategories={availableCategories}
              selectedCategories={selectedCategories}
              onToggleCategory={handleToggleCategory}
              selectedPrice={selectedPrice}
              onChangePrice={handlePriceChange}
              selectedRating={selectedRating}
              onChangeRating={handleRatingChange}
              selectedLevel={selectedLevel}
              onChangeLevel={handleLevelChange}
              onClear={handleClearFilters}
            />
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Search and Results Header */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  All Courses ({filteredCourses.length})
                </h1>

                {/* Search Bar */}
                <div className="relative w-full sm:w-auto">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CiSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search courses..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-[10px] border border-gray-200 p-4 animate-pulse"
                  >
                    <div className="bg-gray-300 h-[212px] rounded-[10px] mb-4"></div>
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full mr-2"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 rounded mb-1 w-3/4"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="h-6 bg-gray-300 rounded mb-3 w-full"></div>
                    <div className="h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </div>
                ))
              ) : error ? (
                // Error state
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-500 mb-4">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Failed to load courses
                  </h3>
                  <p className="text-gray-500 mb-4">{error}</p>
                  <button
                    onClick={() => fetchData()}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : pageData.length === 0 ? (
                // No courses found
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-500 mb-4">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No courses found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {query ||
                    selectedCategories.size > 0 ||
                    selectedPrice !== "all" ||
                    selectedRating ||
                    selectedLevel !== "all"
                      ? "Try adjusting your filters to see more courses."
                      : "No courses are available at the moment."}
                  </p>
                  {(query ||
                    selectedCategories.size > 0 ||
                    selectedPrice !== "all" ||
                    selectedRating ||
                    selectedLevel !== "all") && (
                    <button
                      onClick={handleClearFilters}
                      className="text-red-500 hover:text-red-600 font-medium"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              ) : (
                // Render course cards
                pageData.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={{
                      ...course,
                      isBuy: enrolledCourseIds.has(course.id),
                    }}
                  />
                ))
              )}
            </div>

            {/* Pagination */}
            {!isLoading && !error && pageData.length > 0 && totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 space-x-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-2 rounded-lg ${
                        page === pageNum
                          ? "bg-red-500 text-white"
                          : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                )}

                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
