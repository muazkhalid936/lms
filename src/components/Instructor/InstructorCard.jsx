"use client";
import React from "react";
import Image from "next/image";
import { Star, Users, BookOpen, Heart } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
} from "react-icons/fa";

const InstructorCard = ({ instructor }) => {
  return (
    <div className="bg-[#F8F8F8] rounded-xl border border-[#e7e7e7] flex-col lg:flex-row p-4 shadow-sm flex items-start gap-6">

      <div className="relative w-[200px] h-full rounded-lg overflow-hidden">
        <Image
          src={instructor.image }
          alt={instructor.name}
          fill
          className="object-contain"
          unoptimized
        />

        <div className="absolute top-2 left-2 bg-white rounded-full p-1 shadow">
          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
        </div>
      </div>


      <div className="flex-1">
        <h2 className="text-lg font-bold text-gray-900">{instructor.name}</h2>
        <div className="flex items-center text-sm text-gray-600 mt-1">
          <span className="mr-2">{instructor.role}</span>
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
          <span className="font-medium">{instructor.rating}</span>
          <span className="ml-1 text-gray-500">
            ({instructor.reviews} Reviews)
          </span>
        </div>

        {/* Bio/Description */}
        <p className="text-gray-600 text-sm mt-2">{instructor.bio}</p>

        <div className="flex justify-between flex-wrap items-center">
          <div className="flex items-center gap-6 text-sm text-gray-700 mt-4 border-t border-gray-200 pt-3">
            <div className="flex items-center">
              {/* <BookOpen className="w-4 h-4 text-rose-500 mr-1" /> */}

              <Image
                src={"/CourseDetails/img.svg"}
                className="mr-1"
                alt="
            "
                width={24}
                height={24}
              />
              <span>{instructor.lessons}+ Lessons</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 text-rose-500 mr-1" />
              <span>{instructor.students} Students</span>
            </div>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4 mt-3 text-gray-600">
            <FaFacebookF className="cursor-pointer hover:text-rose-500" />
            <FaInstagram className="cursor-pointer hover:text-rose-500" />
            <FaYoutube className="cursor-pointer hover:text-rose-500" />
            <FaLinkedinIn className="cursor-pointer hover:text-rose-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorCard;
