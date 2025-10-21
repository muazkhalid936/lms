import React from 'react';

const UpcomingClassesSkeleton = ({ 
  isTableHeader = true,
  tableHeading = "Upcoming Live Classes",
  itemsPerPage = 5 
}) => {
  return (
    <div className="w-full bg-white border border-[var(--gray-100)] rounded-[10px] px-6 pt-2 shadow-sm">
      {/* Table Container with Horizontal Scroll */}
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full min-w-[640px]">
          {/* Table Header */}
          {isTableHeader && (
            <thead className="bg-white">
              <tr className="border-b border-[var(--gray-100)]">
                <th className="text-left py-3 pr-4 min-w-[200px]">
                  <span className="text-[20px] font-bold text-gray-900">
                    {tableHeading}
                  </span>
                </th>
                <th className="text-right py-3 pl-4 min-w-[160px]">
                  <span className="text-[20px] font-bold text-gray-900">
                    Action
                  </span>
                </th>
              </tr>
            </thead>
          )}

          {/* Table Body Skeleton */}
          <tbody>
            {Array.from({ length: itemsPerPage }).map((_, index) => (
              <tr key={index} className="border-b border-[var(--gray-100)] last:border-b-0">
                <td className="py-4 pr-4">
                  <div className="space-y-2">
                    {/* Title Skeleton */}
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    {/* Description Skeleton */}
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    {/* Date and Time Skeleton */}
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-12"></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 pl-4 text-right">
                  {/* Action Button Skeleton */}
                  <div className="h-9 bg-gray-200 rounded-lg animate-pulse w-24 ml-auto"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Skeleton */}
      <div className="flex justify-center py-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default UpcomingClassesSkeleton;