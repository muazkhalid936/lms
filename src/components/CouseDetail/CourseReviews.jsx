"use client";
import React, { useState } from "react";
import Image from "next/image";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { ChevronLeft, ChevronRight } from "lucide-react";

const StarRating = ({ rating, size = "sm" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FaStar
          key={`full-${i}`}
          className={`${sizeClasses[size]} text-yellow-500`}
        />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <FaStarHalfAlt
          key="half"
          className={`${sizeClasses[size]} text-yellow-500`}
        />
      );
    }

    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FaRegStar
          key={`empty-${i}`}
          className={`${sizeClasses[size]} text-gray-300`}
        />
      );
    }

    return stars;
  };

  return <div className="flex items-center gap-1">{renderStars()}</div>;
};

const CourseReviews = ({
  reviews,
  ratingStats,
  onLoadMore,
  loading = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  if (!reviews || reviews.length === 0) {
    return (
      <div className="rounded-[10px] border border-[#e7e7e7] p-6">
        <h3 className="text-xl font-semibold mb-6">Student Reviews</h3>
        <div className="text-center py-8 text-gray-500">
          <p>No reviews yet. Be the first to review this course!</p>
        </div>
      </div>
    );
  }

  const formatTimeAgo = (date) => {
    const now = new Date();
    const reviewDate = new Date(date);
    const diffInMs = now - reviewDate;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInYears > 0) {
      return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
    } else if (diffInMonths > 0) {
      return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
    } else if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    } else {
      return "Today";
    }
  };

  return (
    <div className="rounded-[10px] border border-[#e7e7e7] p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Student Reviews</h3>
        {ratingStats && (
          <div className="flex items-center gap-2">
            <StarRating rating={ratingStats.average} size="md" />
            <span className="text-lg font-semibold">
              {ratingStats.average.toFixed(1)}
            </span>
            <span className="text-gray-500">({ratingStats.count} reviews)</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div
            key={review._id}
            className="border-b border-gray-100 pb-6 last:border-b-0"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Image
                  src={
                    review.student?.avatar ||
                    "/dashboard/student/profileAvatar.png"
                  }
                  alt={`${review.student?.firstName || "Student"} avatar`}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover"
                  unoptimized
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {review.student?.firstName} {review.student?.lastName}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <StarRating rating={review.rating} size="sm" />
                      <span className="text-sm text-gray-500">
                        {formatTimeAgo(review.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed">
                  {review.comment}
                </p>

                {review.reply && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-blue-800">
                        Instructor Reply
                      </span>
                      <span className="text-xs text-blue-600">
                        {formatTimeAgo(review.reply.createdAt)}
                      </span>
                    </div>
                    <p className="text-blue-800 text-sm">
                      {review.reply.comment}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {onLoadMore && (
        <div className="mt-6 text-center">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="bg-[#392C7D] text-white px-6 py-2 rounded-full hover:bg-[#2d1f5f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : "Load More Reviews"}
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseReviews;
