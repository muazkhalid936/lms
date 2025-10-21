import Header from "@/components/landing/Header";
import Navbar from "@/components/landing/Navbar";

import React from "react";

import Education from "@/components/Instructor/Education";
import AboutMe from "@/components/Instructor/About";
import CourseCard from "@/components/landing/CourseCard";
import ContactCard from "@/components/Instructor/ContactCard";
import InstructorCard from "@/components/Instructor/InstructorCard";
import Image from "next/image";
import Footer from "@/components/landing/Footer";
import InstructorPublicService from "@/lib/services/instructorPublicService";

const page = async ({ params }) => {
  const { id } = await params;

  // Fetch instructor data using the service
  const instructorResult = await InstructorPublicService.getInstructorById(id);
  const coursesResult = await InstructorPublicService.getInstructorCourses(id, {
    limit: 20,
  });
  console.log(instructorResult);
  console.log(coursesResult);
  if (!instructorResult.success) {
    return (
      <div>
        <Navbar />
        <Header title="Instructor Details" />
        <div className="max-w-[1440px] mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Instructor Not Found
          </h2>
          <p className="text-gray-600">{instructorResult.message}</p>
        </div>
        <Footer />
      </div>
    );
  }

  const instructor = instructorResult.data;
  const courses = coursesResult.success ? coursesResult.data : [];

  return (
    <div>
      <Navbar />
      <Header title="Instructor Details" />

      <div className="max-w-[1440px] flex flex-col gap-4 mx-auto px-4 py-16 sm:px-10 w-full">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex flex-1 flex-col gap-4">
            <InstructorCard
              instructor={{
                image: instructor.avatar,
                name: instructor.name,
                role: instructor.role,
                rating: instructor.rating.toString(),
                reviews: instructor.reviews.toString(),
                bio: instructor.bio,
                lessons: instructor.lessons,
                students: instructor.students,
              }}
            />
            <AboutMe instructor={instructor} />
            <Education instructor={instructor} />

            <div>
              <p className="text-[20px] font-bold ">Courses</p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-6">
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-600">
                      No courses available from this instructor yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[366px] flex flex-col gap-6 ">
            {/* <div className="rounded-[10px] border border-[#e7e7e7] p-6 ">
              <p className="text-[20px] font-bold">Certificate</p>
              <div className="flex gap-4 flex-wrap    ">
                {[1, 2, 3].map((item) => (
                  <Image
                    key={item}
                    src="/CourseDetails/as.svg"
                    alt="Certificate"
                    width={48}
                    height={48}
                    className="mt-4 rounded-lg"
                  />
                ))}
              </div>
            </div> */}
            <ContactCard instructor={instructor} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default page;
