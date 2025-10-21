"use client";
import React, { useState, useEffect } from "react";
import CourseCard from "./CourseCard";
import FeaturedInstructors from "./FeaturedInstructors";
import CourseService from "@/lib/services/courseService";
import InstructorPublicService from "@/lib/services/instructorPublicService";

const CourseCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [itemsPerSlide, setItemsPerSlide] = useState(3);
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // derive total slides from current itemsPerSlide
  const totalSlides = Math.ceil(courses.length / itemsPerSlide);

  // Fetch courses and instructors data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch courses with published status
        const coursesResponse = await CourseService.getCourses({
          status: "published",
          limit: 12,
        });

        // Fetch instructors
        const instructorsResponse =
          await InstructorPublicService.getAllInstructors({
            limit: 10,
          });

        if (coursesResponse.success && coursesResponse.data) {
          console.log(coursesResponse.data);
          const transformedCourses = coursesResponse.data.map((course) => {
            const instructor = course.instructor || {};

            const instructorName =
              instructor.firstName?.trim() || instructor.lastName?.trim()
                ? `${instructor.firstName || ""} ${
                    instructor.lastName || ""
                  }`.trim()
                : instructor.userName || "John Doe";

            return {
              id: course._id,
              title: course.courseTitle,
              instructor: instructorName,
              instructorRole: "Instructor",
              avatar: instructor.avatar || "/dashboard/avatar.png",
              price: course.discountPrice || course.coursePrice || 0,
              originalPrice: course.coursePrice || 0,
              rating: course.rating?.average || 0,
              reviews: course.rating?.count || 0,
              lessons: course.totalLessons || 0,
              duration: course.totalDuration
                ? `${course.totalDuration.hours || 0}hr ${
                    course.totalDuration.minutes || 0
                  }min`
                : "0hr 0min",
              image: course.thumbnail?.url || "/course/thumb1.png",
              category: course.courseCategory || "General",
            };
          });

          setCourses(transformedCourses);
        }

        if (instructorsResponse.success && instructorsResponse.data) {
          setInstructors(instructorsResponse.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load courses and instructors");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // update itemsPerSlide responsively on window resize so mobile shows 1 card
  useEffect(() => {
    const calculateItems = () => {
      if (typeof window === "undefined") return;
      const w = window.innerWidth;
      // Tailwind-like breakpoints: <768 -> 1, >=768 && <1024 -> 2, >=1024 -> 3
      if (w >= 1024) setItemsPerSlide(3);
      else if (w >= 768) setItemsPerSlide(2);
      else setItemsPerSlide(1);
    };

    calculateItems();
    window.addEventListener("resize", calculateItems);
    return () => window.removeEventListener("resize", calculateItems);
  }, []);

  // Ensure currentSlide is valid if itemsPerSlide / totalSlides changes
  useEffect(() => {
    if (currentSlide > 0 && currentSlide >= totalSlides) {
      setCurrentSlide(totalSlides - 1);
    }
  }, [itemsPerSlide, totalSlides, currentSlide]);

  const goToSlide = (slideIndex) => {
    setCurrentSlide(slideIndex);
  };

  return (
    <div className="max-w-[1440px] z-20 w-full mx-auto sm:px-10 px-4 py-12">
      <div className="flex justify-between flex-col sm:flex-row items-center mb-8">
        <div>
          <p className="text-[#FF4667] font-bold text-center sm:text-start text-lg ">
            What's New
          </p>
          <h2 className="text-[36px] font-bold text-[#191919]">
            Trending Courses
          </h2>
        </div>
        <button className="bg-[#FF4667] whitespace-nowrap text-white px-6 py-3 rounded-full hover:bg-red-600 font-normal  transition-colors">
          View all Courses
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4667]"></div>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-[#FF4667] text-white px-6 py-2 rounded-full hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && courses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No courses available at the moment.
          </p>
        </div>
      )}

      {!loading && !error && courses.length > 0 && (
        <>
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{
                transform: `translateX(-${
                  currentSlide * (100 / totalSlides)
                }%)`,
                width: `${totalSlides * 100}%`,
              }}
            >
              {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                <div key={slideIndex} className="flex w-full">
                  {courses
                    .slice(
                      slideIndex * itemsPerSlide,
                      (slideIndex + 1) * itemsPerSlide
                    )
                    .map((course) => (
                      <div
                        key={course.id}
                        className="w-full md:w-1/2 lg:w-1/3 px-3 flex-shrink-0"
                      >
                        <CourseCard course={course} />
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-red-500 w-8"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </>
      )}

      <FeaturedInstructors instructors={instructors} />
    </div>
  );
};

export default CourseCarousel;
