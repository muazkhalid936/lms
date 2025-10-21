"use client";
import React, { useState } from "react";
import { Star, Heart, Eye, Trash } from "lucide-react";
import { useRouter } from "next/navigation";

const CourseCardTwo = ({
  course,
  onViewCourse,
  onToggleFavorite,
  isFavorite,
}) => {
  const {
    courseId,
    courseName,
    thumbnail,
    authorName,
    authorAvatar,
    courseCategory,
    courseRatings,
    courseReviews,
    coursePrice,
    discount,
    progress = 50,
  } = course;

  const handleToggleFavorite = () => {
    if (onToggleFavorite) {
      onToggleFavorite(courseId);
    }
  };

  const handleViewCourse = () => {
    if (onViewCourse) {
      onViewCourse(courseId);
    }
  };

  const discountedPrice = discount
    ? coursePrice - (coursePrice * discount) / 100
    : coursePrice;

  return (
    <div className="pl-6 pt-4 bg-white rounded-2xl overflow-hidden transition-shadow duration-300 w-full">
      <div className="flex flex-col md:flex-row">
        <div className="flex-shrink-0 md:w-64 md:h-40 w-full relative">
          <img
            src={thumbnail}
            alt={courseName}
            className="w-full rounded-[9px] h-full object-cover"
          />
          <button
            onClick={handleToggleFavorite}
            className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
          >
            <Heart
              className={`w-3.5 h-3.5 cursor-pointer transition-all duration-200 ${
                isFavorite
                  ? "text-red-500 fill-red-500 scale-110"
                  : "text-gray-600 hover:text-red-500 hover:scale-105"
              }`}
            />
          </button>
        </div>

        <div className="flex-1 p-4 md:px-6 md:pt-1 md:pb-0 flex justify-between">
          <div className="flex flex-col justify-center">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center">
                <img
                  src={authorAvatar}
                  alt={authorName}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <span className="text-sm text-gray-600">{authorName}</span>
              </div>
            </div>

            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 leading-tight">
              {courseName}
            </h3>

            <div className="flex items-center mb-4">
              <Star size={16} className="text-yellow-400 fill-current mr-1" />
              <span className="text-sm font-bold text-gray-900 mr-1">
                {courseRatings}
              </span>
              <span className="text-sm text-gray-500">
                ({courseReviews} Reviews)
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex items-center justify-center mb-4">
              <div className="text-lg font-bold items-center flex gap-2 text-[#FF4667]">
                ${discountedPrice.toFixed(2)}
                {/* <p className="border border-[#e7e7e7] p-1 rounded-full">
                  <Trash className="text-[9px]" />
                </p> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCardTwo;
