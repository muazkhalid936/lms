import React from 'react';

const CoursesTable = ({ courses, maxHeight = "400px" }) => {
  return (
    <div className="rounded-lg border border-[var(--gray-100)] overflow-hidden">
        {/* Header - Fixed */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-[var(--gray-50)] border-b border-[var(--gray-100)] sticky top-0 z-10">
          <div className="font-semibold text-[14px] text-black">Courses</div>
          <div className="font-semibold text-[14px] text-black text-center">Enrolled</div>
          <div className="font-semibold  text-[14px] text-black text-center">Status</div>
        </div>
        
        {/* Scrollable Course Rows */}
        <div 
          className="overflow-y-auto"
          style={{ maxHeight }}
        >
          {courses.map((course, index) => (
            <div 
              key={index} 
              className="grid grid-cols-3 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              {/* Course Info */}
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <img 
                    src={course.img} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-[14px] text-[var(--gray-900)] leading-tight">
                    {course.title}
                  </h3>
                </div>
              </div>
              
              {/* Enrolled Count */}
              <div className="flex items-center justify-center">
                <span className="text-[14px] text-[var(--gray-600)]">{course.enrolled}</span>
              </div>
              
              {/* Status */}
              <div className="flex items-center justify-center">
                <span className="text-[14px] text-[var(--gray-600)]">{course.status}</span>
              </div>
            </div>
          ))}
        </div>
    </div>
  );
};

export default CoursesTable;