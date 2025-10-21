"use client";
import React, { useState } from "react";
import { Star, Heart } from "lucide-react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";

const CourseCard = ({ course, onToggleFavorite, isFavorite }) => {
  const routter = useRouter();
  const pathname = usePathname();


  const handleToggleFavorite = (e) => {
    e.stopPropagation(); // Prevent card click when clicking heart
    if (onToggleFavorite) {
      onToggleFavorite(course.id);
    }
  };

  const handleCourseClick = () => {
    // Check if the current URL contains "student" to determine routing
    if (
      pathname &&
      pathname.includes("student") &&
      pathname.includes("courses")
    ) {
      routter.push(`/dashboard/student/explore/${course.id}`);
    } else {
      routter.push(`/courses/${course.id}`);
    }
  };

  return (
    <div
      onClick={handleCourseClick}
      className="bg-white flex flex-col cursor-pointer h-[500px] rounded-[10px] mb-4 overflow-hidden group p-4 border border-gray-200 transition-shadow duration-300 hover:shadow-lg"
    >
      <div className="relative">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-[180px]  md:h-[212px] rounded-[10px] object-cover"
        />

        {course.isFree ? (
          <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            Free
          </div>
        ) : (
          <>
            <div className="absolute bottom-3 bg-white rounded-[9px] px-2 right-3">
              <span className=" text-[#FF4667] px-3 py-1 rounded-full text-lg font-bold">
                ${course.price}
              </span>
              <span className="ml-2 text-[#857DAD] line-through text-[12px]">
                ${course.originalPrice}
              </span>
            </div>
          </>
        )}
      </div>

      <div className=" mt-6 md:mt-10 flex flex-col flex-1 justify-between">
        <div className="flex justify-between mb-3 items-center flex-1">
          <div className="flex items-center ">
            <img
              src={course.avatar || course.instructorAvatar}
              alt={course.instructor}
              className="w-8 h-8 rounded-full mr-2"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {course.instructor || course.instructor.userNname}
              </p>
              <p className="text-xs text-gray-500">{course.instructorRole}</p>
            </div>
          </div>
          <button
            onClick={handleToggleFavorite}
            className=" bg-white rounded-full p-2 hover:bg-gray-50 transition-colors"
          >
            <Heart
              className={`w-4 h-4 cursor-pointer transition-all duration-200 ${
                isFavorite
                  ? "text-red-500 fill-red-500 scale-110"
                  : "text-gray-600 hover:text-red-500 hover:scale-105"
              }`}
            />
          </button>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
            {course.title}
          </h3>

          <div className="flex items-center justify-between mb-4 text-sm text-[#6D6D6D]">
            <div className="flex items-center">
              <Image
                src="/Courses/book.svg"
                width={20}
                height={20}
                className="mr-2"
                alt=""
              />
              <span>{course.lessons}+ Lesson</span>
            </div>
            <div className="flex items-center">
              <Image
                src="/Courses/time.svg"
                width={20}
                height={20}
                className="mr-2"
                alt=""
              />{" "}
              <span>{course.duration}</span>
            </div>
          </div>

          <div className="flex items-center border-t pt-4 justify-between">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(course.rating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {course.rating} ({course.reviews})
              </span>
            </div>
            {course.isBuy ? (
              <span className="text-sm font-medium text-green-600">
                Enrolled
              </span>
            ) : (
              <button className="bg-[#342777] flex text-white px-4 py-2 rounded-full  transition-colors text-sm font-medium">
                <Image
                  src="/Courses/shop.svg"
                  width={20}
                  height={20}
                  className="mr-2"
                  alt=""
                />
                Buy Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
