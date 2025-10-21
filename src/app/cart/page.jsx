"";
import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";
import Navbar from "@/components/landing/Navbar";
import CourseCardTwo from "@/components/course/CourseCardTwo";
import React from "react";
import { MdClear } from "react-icons/md";

const sampleItems = [
  {
    courseId: 1,
    courseName: "Information About UI/UX Design Degree",
    thumbnail: "/CourseDetails/cover.jpg",
    authorName: "Brenda Slaton",
    authorAvatar: "/CourseDetails/user.jpg",
    courseCategory: "Intermediate",
    courseRatings: 4.9,
    courseReviews: 200,
    coursePrice: 120,
  },
  {
    courseId: 2,
    courseName: "Information About UI/UX Design Degree",
    thumbnail: "/CourseDetails/cover.jpg",
    authorName: "Brenda Slaton",
    authorAvatar: "/CourseDetails/user.jpg",
    courseCategory: "Intermediate",
    courseRatings: 4.9,
    courseReviews: 200,
    coursePrice: 120,
  },
  {
    courseId: 3,
    courseName: "Information About UI/UX Design Degree",
    thumbnail: "/CourseDetails/cover.jpg",
    authorName: "Brenda Slaton",
    authorAvatar: "/CourseDetails/user.jpg",
    courseCategory: "Intermediate",
    courseRatings: 4.9,
    courseReviews: 200,
    coursePrice: 210,
  },
];

const page = () => {
  const subtotal = sampleItems.reduce((s, it) => s + (it.coursePrice || 0), 0);

  return (
    <div>
      <Navbar />
      <Header title="Cart" />

      <main className="max-w-[1440px] sm:px-10 mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{sampleItems.length} Courses</h2>
            <button className="text-[#E70D0D] border border-[#FF4667] px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
              <p className="border border-[#E70D0D] rounded-full">
                <MdClear />
              </p>
              Clear cart
            </button>
          </div>

          <div className="space-y-6">
            {sampleItems.map((it) => (
              <div
                key={it.courseId}
                className="rounded-xl border border-gray-100 p-4"
              >
                <CourseCardTwo course={it} />
              </div>
            ))}
          </div>

          <hr className="my-6 border-t border-gray-200" />

          <div className="flex flex-col  items-center justify-between gap-4">
            <div className="w-full bg-[#F8F8F8] border border-[#e7e7e7] p-4 rounded-lg  flex  justify-between items-center ">
              <div className="">
                <div className="font-semibold">Subtotal</div>
                <div className="text-sm text-gray-600">
                  All Course have a 30-day money-back guarantee
                </div>
              </div>

              <div className="text-xl font-bold">${subtotal}</div>
            </div>

            <div className="w-fit ml-auto flex items-center justify-end gap-4">
              <button className="bg-rose-500 text-white px-6 py-2 rounded-full font-medium">
                Continue Shopping
              </button>
              <button className="bg-[#2f1d5b] text-white px-6 py-2 rounded-full font-medium">
                Checkout
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default page;
