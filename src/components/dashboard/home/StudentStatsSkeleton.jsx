import React from 'react';

const StudentStatsSkeleton = () => {
  return (
    <div className="w-full mx-auto py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 md:py-3 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-4">
              {/* Icon Container Skeleton */}
              <div className="bg-gray-200 rounded-2xl p-4 flex-shrink-0 animate-pulse">
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
              </div>
              
              {/* Content Skeleton */}
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2 w-24 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-12 animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentStatsSkeleton;