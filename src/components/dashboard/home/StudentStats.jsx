"use client";
import React from "react";
import { BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
const StudentStats = ({
  totalCourses = 12,
  activeCourses = 3,
  certificates = 10,
}) => {
  const stats = [
    {
      title: "All Courses",
      value: totalCourses,
      icon: "/dashboard/student/allCourses.png",
      bgColor: "bg-[var(--indigo-50)]",
    },
    {
      title: "Active Courses",
      value: activeCourses,
      icon: "/dashboard/student/activeCourses.png",
      bgColor: "bg-[var(--rose-50)]",
    },
    {
      title: "Certificates Earned",
      value: certificates,
      icon: "/dashboard/student/cert.png",
      bgColor: "bg-[var(--mint-100)]",
    },
  ];
  const router = useRouter();

  return (
    <div className="w-full mx-auto py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 md:py-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center gap-4">
              {/* Icon Container */}
              <div className={`${stat.bgColor} rounded-2xl p-4 flex-shrink-0`}>
                <img
                  src={stat.icon}
                  alt={stat.title}
                  className="w-8 h-8 object-contain"
                />
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-gray-600 text-[15px] font-medium mb-1">
                  {stat.title}
                </h3>
                <p className="text-[24px] font-bold text-gray-900">
                  {stat.value.toString().padStart(1, "0")}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalCourses === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No enrolled courses
          </h3>
          <p className="text-gray-600 mb-6">
            Start learning by exploring our course catalog
          </p>

          <button
            onClick={() => router.push("/dashboard/student/explore")}
            className="bg-[#342777] text-white px-6 py-3 rounded-lg hover:bg-[#2a1f5f] transition-colors"
          >
            Explore Courses
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentStats;
