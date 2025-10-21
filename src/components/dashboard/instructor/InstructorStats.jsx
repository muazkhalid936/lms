import React from 'react';

const InstructorStats = ({ 
  totalStudents = 0, 
  totalCourses = 0, 
  totalEarnings = 0,
  loading = false,
  error = null
}) => {
  const stats = [
    {
      title: "Total Students",
      value: loading ? "..." : totalStudents,
      icon: "/dashboard/instructor/stu.png",
      bgColor: "bg-[var(--purple-50)]"
    },
    {
      title: "Total Courses",
      value: loading ? "..." : totalCourses,
      icon: "/dashboard/instructor/courses.png",
      bgColor: "bg-[var(--cyan-50)]"
    },
    {
      title: "Total Earnings",
      value: loading ? "..." : `$${totalEarnings.toFixed(2)}`,
      icon: "/dashboard/instructor/earnings.png",
      bgColor: "bg-[var(--purple-50)]"
    }
  ];

  if (error) {
    return (
      <div className="w-full mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="text-red-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-red-800 font-medium">Failed to load statistics</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
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
            className={`bg-white rounded-2xl p-6 md:py-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 ${
              loading ? 'animate-pulse' : ''
            }`}
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
                  {loading ? (
                    <span className="inline-block w-16 h-6 bg-gray-200 rounded animate-pulse"></span>
                  ) : (
                    stat.value
                  )}
                </p>
                {!loading && stat.title === "Total Earnings" && totalEarnings > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    From course enrollments
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* {!loading && !error && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Statistics updated automatically when students enroll in your courses
          </p>
        </div>
      )} */}
    </div>
  );
};

export default InstructorStats;