import React from "react";
import Image from "next/image";
const CourseDetailHeader = ({ course }) => {
  return (
    <div className="  flex flex-col lg:flex-row gap-2 sm:gap-6 p-4 bg-[#F8F8F8] border border-[#E7E7E7] rounded-[10px]">
      <div>
        <img
          src={course.thumbnail.url || "/CourseDetails/cover.jpg"}
          alt="coming soon"
          width={200}
          height={200}
          className=" w-full h-[262px] rounded-[10px] object-contain"
        />
      </div>
      <div className="sm:w-[600px] flex flex-1 flex-col gap-3 justify-center ">
        <p className="text-[28px] font-bold text-[#191919]">
          {course.courseTitle || "Web Development Masterclass - 2023"}
        </p>
        <p className="text-[14px] font-normal text-[#6d6d6d] ">
          {course.shortDescription ||
            "Learn Web Development from scratch with hands-on projects and real-world examples. Master HTML, CSS, JavaScript, React, Node.js, and more to become a full-stack web developer."}
        </p>
        <div className="w-full flex-wrap text-[14px] font-normal text-[#6d6d6d] flex items-center gap-2 justify-between">
          <div className="flex  items-center gap-2">
            <Image
              src="/CourseDetails/img.svg"
              alt="author"
              width={24}
              height={24}
              //   className=" w-[40px] h-[40px] rounded-full object-cover"
            />
            <p>{course.totalLessons || 0} Lesson</p>
          </div>

          <div className="flex items-center gap-2">
            <Image
              src="/CourseDetails/time.svg"
              alt="author"
              width={24}
              height={24}
              //   className=" w-[40px] h-[40px] rounded-full object-cover"
            />
            <p>
              {course.totalDuration.hours} hr {course.totalDuration.minutes} min
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Image
              src="/CourseDetails/student.svg"
              alt="author"
              width={24}
              height={24}
              //   className=" w-[40px] h-[40px] rounded-full object-cover"
            />
            <p>{course.totalStudents} students enrolled</p>
          </div>

          <p className=" font-semibold capitalize text-white bg-[#FFC107] px-3 text-[11px] rounded-full">
            {course.courseCategory}{" "}
          </p>
        </div>

        <div className="flex lg:items-center flex-col lg:flex-row justify-between mt-4 gap-4">
          <div className="flex items-center gap-2 ">
            <Image
              src={course.instructor?.avatar || "/dashboard/avatar.png"}
              width={45}
              height={45}
              className="rounded-full"
              unoptimized
            />
            <div>
              <p className="text-[18px] font-semibold text-[#191919]">
                {course.instructor?.firstName || course.instructor?.userName}
              </p>
              <p className="text-[14px] font-normal text-[#6d6d6d]">
                Instructor
              </p>
            </div>
          </div>

          {/* <div className="flex items-center gap-1">
            <span className={"text-yellow-400"}>★</span>
            <span className={"text-yellow-400"}>★</span>
            <span className={"text-yellow-400"}>★</span>
            <span className={"text-yellow-400"}>★</span>
            <span className={"text-gray-300"}>★</span>
            <span>
              <span className="text-[14px] font-normal text-[#191919]">
                4.0{" "}
                <span className="text-[14px] font-normal text-[#6d6d6d]">
                  (32 )
                </span>
              </span>
            </span>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default CourseDetailHeader;
