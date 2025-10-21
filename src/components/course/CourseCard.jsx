import React, { useState } from "react";
import { Star, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

const CourseCard = ({ course, isWished, onViewCourse, onToggleFavorite }) => {
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
  } = course;
  const [filledHeart, setFilledHeart] = useState(isWished)
  const router = useRouter();
  return (
    <div className="bg-white px-4 pt-4 rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex-shrink-0 w-full">
      {/* Thumbnail Section */}
      <div className="relative h-[152px]">
        {/* Try to load the actual image over the background */}
        {thumbnail && (
          <img
            src={thumbnail}
            alt={courseName}
            className="absolute inset-0 w-full h-full object-cover rounded-t-2xl"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        )}

        {/* Discount Badge */}
        {discount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            {discount}% off
          </div>
        )}

        {/* Favorite Button - positioned based on isWished */}
        <button
          onClick={() => setFilledHeart(!filledHeart)}
          className={`absolute top-2 ${isWished ? 'left-2' : 'right-2'} bg-white rounded-full p-1.5 shadow-md hover:shadow-lg transition-all duration-200 active:scale-95`}
        >
          <Heart 
            className={`w-3.5 h-3.5 cursor-pointer transition-all duration-200 ${
              filledHeart 
                ? 'text-red-500 fill-red-500 scale-110' 
                : 'text-gray-600 hover:text-red-500 hover:scale-105'
            }`} 
          />
        </button>
      </div>

      {/* Content Section */}
      <div className="py-4">
        {/* Author and Category */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <img
              src={authorAvatar}
              alt={authorName}
              className="w-6 h-6 rounded-full object-cover"
              onError={(e) => {
                // Fallback to initials if avatar fails to load
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
            <span className="text-[var(--gray-600)] text-xs font-medium truncate">
              {authorName}
            </span>
          </div>
          <span className="bg-[var(--gray-50)] text-[var(--gray-900)] px-2 py-0.5 rounded-full text-xs font-medium">
            {courseCategory}
          </span>
        </div>

        {/* Course Title */}
        <h3 className="text-[16px] font-bold text-[var(--gray-900)] mb-2 leading-tight line-clamp-2 h-10">
          {courseName}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-[var(--amber-500)] text-[var(--amber-500)]" />
            <span className=" text-[var(--gray-600)] text-xs">
              {courseRatings}
            </span>
          </div>
          <span className="text-[var(--gray-600)] text-xs">
            ({courseReviews} Reviews)
          </span>
        </div>

        {/* Price and Action */}
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-[var(--rose-500)]">
            ${coursePrice}
          </div>
          <button
            onClick={() => onViewCourse(courseId)}
            className="bg-gray-900 text-white px-3 py-1.5 rounded-full font-medium hover:bg-gray-800 transition-colors duration-200 text-xs"
          >
            <div className="cursor-pointer text-sm flex items-center gap-1" onClick={()=>router.push("/dashboard/student/courses/1")}>
              View Course
              <ChevronRight className="w-4 h-4"/>
            </div>
          </button>
        </div>
      </div>

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

export default CourseCard;