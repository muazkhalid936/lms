import Image from "next/image";
import React, { useState, useEffect } from "react";

const About = ({ course }) => {
  const [instructorStats, setInstructorStats] = useState({
    totalCourses: 0,
    totalLessons: 0,
    totalDuration: "0min",
    totalStudents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstructorStats = async () => {
      if (!course?.instructor?._id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/public/instructor/${course.instructor._id}/stats`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setInstructorStats(data.data);
          }
        }
      } catch (error) {
        console.error("Error fetching instructor stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructorStats();
  }, [course?.instructor?._id]);
  return (
    <div className="rounded-[10px] flex flex-col gap-3 border border-[#e7e7e7] p-6">
      <span className="text-black text-[20px] font-semibold">
        About the Instructor
      </span>

      <div className="flex lg:items-center flex-col lg:flex-row justify-between mt-4 gap-4">
        <div className="flex items-center gap-2 ">
          <Image
            src={course.instructor?.avatar || "/dashboard/avatar.png"}
            width={45}
            height={45}
            className="rounded-full object-cover"
            alt="Instructor Avatar"
            unoptimized
          />
          <div>
            <p className="text-[18px] font-semibold text-[#191919]">
              {course.instructor?.firstName && course.instructor?.lastName
                ? `${course.instructor.firstName} ${course.instructor.lastName}`
                : course.instructor?.userName ||
                  course.instructor?.firstName ||
                  "Instructor"}
            </p>
            <p className="text-[14px] font-normal text-[#6d6d6d]">Instructor</p>
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
      <div className="w-full text-[14px] flex-wrap font-normal text-[#6d6d6d] flex items-center gap-4 border-t border-b border-[#e7e7e7] py-4">
        <div className="flex items-center gap-2">
          <Image
            src="/CourseDetails/video.svg"
            alt="courses"
            width={24}
            height={24}
          />
          <p>
            {loading
              ? "Loading..."
              : `${instructorStats.totalCourses} Course${
                  instructorStats.totalCourses !== 1 ? "s" : ""
                }`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Image
            src="/CourseDetails/img.svg"
            alt="lessons"
            width={24}
            height={24}
          />
          <p>
            {loading
              ? "Loading..."
              : `${instructorStats.totalLessons}+ Lesson${
                  instructorStats.totalLessons !== 1 ? "s" : ""
                }`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Image
            src="/CourseDetails/time.svg"
            alt="duration"
            width={24}
            height={24}
          />
          <p>{loading ? "Loading..." : instructorStats.totalDuration}</p>
        </div>

        <div className="flex items-center gap-2">
          <Image
            src="/CourseDetails/student.svg"
            alt="students"
            width={24}
            height={24}
          />
          <p>
            {loading
              ? "Loading..."
              : `${instructorStats.totalStudents.toLocaleString()} student${
                  instructorStats.totalStudents !== 1 ? "s" : ""
                } enrolled`}
          </p>
        </div>
      </div>

      <p className="text-[14px] font-normal text-[#6d6d6d]">
        {course.instructor?.bio ||
          `${
            course.instructor?.firstName || "Professional"
          } is an experienced instructor dedicated to providing high-quality education. With expertise in ${
            course.courseCategory || "various subjects"
          }, they bring practical knowledge and engaging teaching methods to help students achieve their learning goals.`}
      </p>

      {course.instructor?.experience &&
        course.instructor.experience.length > 0 && (
          <>
            <span className="text-black font-semibold">Experience: </span>
            <div className="text-[#6d6d6d] font-normal">
              {course.instructor.experience.map((exp, index) => (
                <div key={index} className="mb-2">
                  <span className="font-medium">{exp.position}</span>
                  {exp.company && <span> at {exp.company}</span>}
                  {(exp.fromDate || exp.toDate) && (
                    <span className="text-sm text-gray-500 block">
                      {exp.fromDate && new Date(exp.fromDate).getFullYear()}
                      {exp.fromDate && exp.toDate && " - "}
                      {exp.toDate
                        ? new Date(exp.toDate).getFullYear()
                        : exp.fromDate && "Present"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

      {course.instructor?.education &&
        course.instructor.education.length > 0 && (
          <>
            <span className="text-black font-semibold">Education: </span>
            <div className="text-[#6d6d6d] font-normal">
              {course.instructor.education.map((edu, index) => (
                <div key={index} className="mb-2">
                  <span className="font-medium">{edu.degree}</span>
                  {edu.university && <span> from {edu.university}</span>}
                  {(edu.fromDate || edu.toDate) && (
                    <span className="text-sm text-gray-500 block">
                      {edu.fromDate && new Date(edu.fromDate).getFullYear()}
                      {edu.fromDate && edu.toDate && " - "}
                      {edu.toDate
                        ? new Date(edu.toDate).getFullYear()
                        : edu.fromDate && "Present"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

      {course.tags && course.tags.length > 0 && (
        <>
          <span className="text-black font-semibold">Skills: </span>
          <span className="text-[#6d6d6d] font-normal">
            {course.tags.join(", ")}
          </span>
        </>
      )}
    </div>
  );
};

export default About;
