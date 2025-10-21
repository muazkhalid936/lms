import React from 'react';

const CourseStats = ({ 
  allCourses = 0, 
  freeCourses = 0, 
  paidCourses = 0,
  loading = false,
  error = null
}) => {
  const stats = [
    {
      title: "All Courses",
      value: allCourses,
      icon: "/dashboard/instructor/stu.png",
      bgColor: "bg-[var(--green-500)]"
    },
    {
      title: "Free Courses",
      value: freeCourses,
      icon: "/dashboard/instructor/courses.png",
      bgColor: "bg-[var(--cyan-400)]"
    },
    {
      title: "Paid Courses",
      value: paidCourses,
      icon: "/dashboard/instructor/earnings.png",
      bgColor: "bg-[var(--purple-500)]"
    }
  ];

  if (error) {
    return (
      <div className="w-full mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600 text-sm">
            Error loading course statistics: {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`${stat.bgColor} rounded-2xl p-6 md:py-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 ${
              loading ? 'animate-pulse' : ''
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Content */}
              <div className="flex-1">
                <h3 className="text-white text-[16px] font-medium mb-1">
                  {stat.title}
                </h3>
                <p className="text-[24px] font-bold text-white">
                  {loading ? '--' : stat.value.toString().padStart(1, '0')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseStats;