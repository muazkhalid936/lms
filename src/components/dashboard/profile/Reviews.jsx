"use client"
import React, { useState } from "react";
import {
  ChevronDown,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Reviews() {
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;


  const reviews = [
    {
      id: 1,
      name: "Ronald Richard",
      avatar: "/dashboard/student/profileAvatar.png",
      timeAgo: "6 months ago",
      rating: 4,
      text: "This is the second Photoshop course I have completed with Nancy Duarte. Worth every penny and recommend it highly. To get the most out of this course, its best to take the beginner to Advanced course first. The sound and video quality is of a good standard. Thank you Nancy Duarte.",
      hasReply: true,
      replyText:
        "As a learner who has navigate through various online platforms, the sophistication user-centric design of this website set a new.",
    },
    {
      id: 2,
      name: "Ronald Richard",
      avatar: "/dashboard/student/profileAvatar.png",
      timeAgo: "6 months ago",
      rating: 4,
      text: "This is the second Photoshop course I have completed with Nancy Duarte. Worth every penny and recommend it highly. To get the most out of this course, its best to take the beginner to Advanced course first. The sound and video quality is of a good standard. Thank you Nancy Duarte.",
      hasReply: false,
    },
    {
      id: 3,
      name: "Ronald Richard",
      avatar: "/dashboard/student/profileAvatar.png",
      timeAgo: "6 months ago",
      rating: 4,
      text: "This is the second Photoshop course I have completed with Nancy Duarte. Worth every penny and recommend it highly. To get the most out of this course, its best to take the beginner to Advanced course first. The sound and video quality is of a good standard. Thank you Nancy Duarte.",
      hasReply: false,
    },
    {
      id: 4,
      name: "Ronald Richard",
      timeAgo: "6 months ago",
      avatar: "/dashboard/student/profileAvatar.png",
      rating: 4,
      text: "This is the second Photoshop course I have completed with Nancy Duarte. Worth every penny and recommend it highly. To get the most out of this course, its best to take the beginner to Advanced course first. The sound and video quality is of a good standard. Thank you Nancy Duarte.",
      hasReply: false,
    },
    {
      id: 5,
      name: "Sarah Johnson",
      avatar: "/dashboard/student/profileAvatar.png",
      timeAgo: "5 months ago",
      rating: 5,
      text: "Excellent course! The instructor explains everything clearly and the practical exercises are very helpful. I learned a lot about advanced techniques.",
      hasReply: false,
    },
    {
      id: 6,
      name: "Mike Chen",
      avatar: "/dashboard/student/profileAvatar.png",
      timeAgo: "4 months ago",
      rating: 3,
      text: "This is the second Photoshop course I have completed with Nancy Duarte. Worth every penny and recommend it highly. To get the most out of this course, its best to take the beginner to Advanced course first. The sound and video quality is of a good standard. Thank you Nancy Duarte.",
      // text: "Good content overall, but I felt some sections could be more detailed. The course structure is well organized though.",
      hasReply: false,
    },
    {
      id: 7,
      name: "Emma Wilson",
      timeAgo: "3 months ago",
      avatar: "/dashboard/student/profileAvatar.png",
      rating: 4,
      text: "Really enjoyed this course. The step-by-step approach made it easy to follow along. Would recommend to beginners.",
      hasReply: true,
      replyText:
        "Thank you Emma! We're glad you found the course helpful. Keep practicing and you'll see great improvements!",
    },
    {
      id: 8,
      name: "David Brown",
      avatar: "/dashboard/student/profileAvatar.png",
      timeAgo: "2 months ago",
      rating: 5,
      text: "Outstanding course! The quality of instruction and the depth of content exceeded my expectations. Worth every penny.",
      hasReply: false,
    },
    {
      id: 9,
      avatar: "/dashboard/student/profileAvatar.png",
      name: "Lisa Garcia",
      timeAgo: "1 month ago",
      rating: 4,
      text: "Great course with practical examples. The instructor is knowledgeable and presents the material in an engaging way.",
      hasReply: false,
    },
  ];

  // Pagination calculations
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;
  const currentReviews = reviews.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 3;
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        style={{
          color: i < rating ? "var(--amber-500)" : "#e5e7eb",
          fontSize: "18px",
        }}
      >
        ★
      </span>
    ));
  };

  const ReviewItem = ({ review }) => (
    <div className="border border-gray-200 rounded-lg p-6 mb-4">
      <div className="flex items-start gap-4">
        <img src={review.avatar} alt="Avatar" className="w-[76px] h-[76px]" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3
              style={{
                color: "var(--gray-900)",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              {review.name}
            </h3>
            <div className="flex gap-1">{renderStars(review.rating)}</div>
          </div>
          <p
            style={{
              color: "var(--gray-600)",
              fontSize: "13px",
              marginBottom: "12px",
            }}
          >
            {review.timeAgo}
          </p>
        </div>
      </div>
      <div className="mt-3">
        <p
          style={{
            color: "var(--gray-600)",
            fontSize: "15px",
            lineHeight: "1.5",
            marginBottom: "16px",
          }}
        >
          {review.text}
        </p>
        <div className="flex items-center gap-4">
          {/* <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm">
            <Edit size={14} />
            Edit
          </button> */}
          <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm">
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto">
      <h1 className="text-[20px] font-bold mb-8 pb-4 border-b border-[var(--gray-100)] text-[var(--gray-900)]">
        Your Reviews
      </h1>

      {/* Reviews List */}
      <div>
        {currentReviews.map((review) => (
          <ReviewItem key={review.id} review={review} />
        ))}

        {/* Pagination */}
        <div className="flex items-center justify-between mt-8">
          <p style={{ color: "var(--gray-600)", fontSize: "14px" }}>
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`p-2 cursor-pointer ${
                currentPage === 1
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <ChevronLeft size={16} />
            </button>

            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-8 h-8 cursor-pointer rounded-full flex items-center justify-center text-sm font-medium ${
                  currentPage === page
                    ? "text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                style={
                  currentPage === page
                    ? { backgroundColor: "var(--rose-500)" }
                    : {}
                }
              >
                {page}
              </button>
            ))}

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`p-2 cursor-pointer ${
                currentPage === totalPages
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}