"use client"
import React, { useState } from "react";
import CourseCard from "../course/CourseCard";
import { Heart, Star, ChevronLeft, ChevronRight } from "lucide-react";

const Wishlist = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const onViewCourse = (courseId) => {
    //console.log("View course:", courseId);
  };
  const onToggleFavorite = (courseId) => {
    //console.log("Toggle favorite:", courseId);
  };
  const courses = [
    {
      courseId: "1",
      courseName: "Information About UI/UX Design Degree",
      thumbnail: "/course/thumb1.png",
      authorName: "Brenda Slaton",
      authorAvatar: "/course/author1.png",
      courseCategory: "Design",
      courseRatings: 4.9,
      courseReviews: 200,
      coursePrice: 120,
    },
    {
      courseId: "17",
      courseName: "Information About UI/UX Design Degree",
      thumbnail: "/course/thumb1.png",
      authorName: "Brenda Slaton",
      authorAvatar: "/course/author1.png",
      courseCategory: "Design",
      courseRatings: 4.9,
      courseReviews: 200,
      coursePrice: 120,
    },
    {
      courseId: "16",
      courseName: "Information About UI/UX Design Degree",
      thumbnail: "/course/thumb1.png",
      authorName: "Brenda Slaton",
      authorAvatar: "/course/author1.png",
      courseCategory: "Design",
      courseRatings: 4.9,
      courseReviews: 200,
      coursePrice: 120,
    },
    {
      courseId: "15",
      courseName: "Information About UI/UX Design Degree",
      thumbnail: "/course/thumb1.png",
      authorName: "Brenda Slaton",
      authorAvatar: "/course/author1.png",
      courseCategory: "Design",
      courseRatings: 4.9,
      courseReviews: 200,
      coursePrice: 120,
    },
    {
      courseId: "14",
      courseName: "Information About UI/UX Design Degree",
      thumbnail: "/course/thumb1.png",
      authorName: "Brenda Slaton",
      authorAvatar: "/course/author1.png",
      courseCategory: "Design",
      courseRatings: 4.9,
      courseReviews: 200,
      coursePrice: 120,
    },
    {
      courseId: "13",
      courseName: "Information About UI/UX Design Degree",
      thumbnail: "/course/thumb1.png",
      authorName: "Brenda Slaton",
      authorAvatar: "/course/author1.png",
      courseCategory: "Design",
      courseRatings: 4.9,
      courseReviews: 200,
      coursePrice: 120,
    },
    {
      courseId: "12",
      courseName: "Information About UI/UX Design Degree",
      thumbnail: "/course/thumb1.png",
      authorName: "Brenda Slaton",
      authorAvatar: "/course/author1.png",
      courseCategory: "Design",
      courseRatings: 4.9,
      courseReviews: 200,
      coursePrice: 120,
    },
    {
      courseId: "11",
      courseName: "Information About UI/UX Design Degree",
      thumbnail: "/course/thumb1.png",
      authorName: "Brenda Slaton",
      authorAvatar: "/course/author1.png",
      courseCategory: "Design",
      courseRatings: 4.9,
      courseReviews: 200,
      coursePrice: 120,
    },
    {
      courseId: "2",
      courseName: "WordPress for Beginners - Master WordPress Quickly",
      thumbnail: "/course/thumb2.png",
      authorName: "Ana Reyes",
      authorAvatar: "/course/author2.png",
      courseCategory: "Wordpress",
      courseRatings: 4.4,
      courseReviews: 160,
      coursePrice: 140,
    },
    {
      courseId: "3",
      courseName: "Sketch from A to Z (2024): Become an app designer",
      thumbnail: "/course/thumb3.png",
      authorName: "Andrew Pirtle",
      authorAvatar: "/course/author3.png",
      courseCategory: "Design",
      courseRatings: 4.4,
      courseReviews: 160,
      coursePrice: 140,
    },
    {
      courseId: "4",
      courseName: "Complete React Development Course",
      thumbnail: "/course/thumb1.png",
      authorName: "Sarah Johnson",
      authorAvatar: "/course/thumb1.png",
      courseCategory: "Development",
      courseRatings: 4.8,
      courseReviews: 320,
      coursePrice: 99,
    },
    {
      courseId: "5",
      courseName: "Complete React Development Course",
      thumbnail: "/course/thumb1.png",
      authorName: "Sarah Johnson",
      authorAvatar: "/course/thumb1.png",
      courseCategory: "Development",
      courseRatings: 4.8,
      courseReviews: 320,
      coursePrice: 99,
    },
  ];
  // Calculate pagination
  const totalPages = Math.ceil(courses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCourses = courses.slice(startIndex, endIndex);

  const renderPaginationButton = (page) => (
    <button
      key={page}
      onClick={() => setCurrentPage(page)}
      className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
        currentPage === page
          ? "bg-red-500 text-white"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {page}
    </button>
  );

  return (
    <div className="mx-auto px-6 pb-6 lg:pr-20 min-h-screen">
      <h1 className="text-2xl font-bold border-b border-[var(--gray-100)] pb-4 text-gray-900 mb-6">
        Wishlist
      </h1>

      {/* Courses Grid */}
      {currentCourses.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {currentCourses.map((course) => (
              <CourseCard
              isWished={true}
                key={course.courseId}
                course={course}
                onViewCourse={onViewCourse}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded-md text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex gap-2">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNumber =
                      Math.max(1, Math.min(totalPages - 4, currentPage - 2)) +
                      i;
                    return renderPaginationButton(pageNumber);
                  })}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-1 rounded-md text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Heart className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Your wishlist is empty
          </h3>
          <p className="text-gray-500">
            Start adding courses to your wishlist to see them here.
          </p>
        </div>
      )}

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Wishlist;
