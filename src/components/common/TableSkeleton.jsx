"use client";
import React from "react";

const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="bg-white border border-[var(--gray-100)] rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          {/* Table Header */}
          <thead>
            <tr className="bg-[var(--gray-50)] border-b border-gray-200">
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 w-80">
                Course Name
              </th>
              <th className="text-center px-4 py-4 text-sm font-medium text-gray-600 w-24">
                Students
              </th>
              <th className="text-center px-4 py-4 text-sm font-medium text-gray-600 w-20">
                Price
              </th>
              <th className="text-center px-4 py-4 text-sm font-medium text-gray-600 w-32">
                Ratings
              </th>
              <th className="text-center px-4 py-4 text-sm font-medium text-gray-600 w-28">
                Status
              </th>
              <th className="text-center px-4 py-4 text-sm font-medium text-gray-600 w-24">
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Body - Skeleton */}
          <tbody className="divide-y divide-gray-100">
            {Array.from({ length: rows }).map((_, index) => (
              <tr key={index} className="animate-pulse">
                {/* Course Info */}
                <td className="px-6 py-4 w-80">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="min-w-0 flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                        <div className="h-3 w-px bg-gray-200"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                        <div className="h-3 w-px bg-gray-200"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Students */}
                <td className="text-center px-4 py-4 w-24">
                  <div className="h-4 bg-gray-200 rounded w-8 mx-auto"></div>
                </td>

                {/* Price */}
                <td className="text-center px-4 py-4 w-20">
                  <div className="h-4 bg-gray-200 rounded w-12 mx-auto"></div>
                </td>

                {/* Ratings */}
                <td className="text-center px-4 py-4 w-32">
                  <div className="flex items-center justify-center gap-1">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                </td>

                {/* Status */}
                <td className="text-center px-2 py-4 w-28">
                  <div className="h-6 bg-gray-200 rounded-full w-20 mx-auto"></div>
                </td>

                {/* Actions */}
                <td className="text-center px-4 py-4 w-24">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                    <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableSkeleton;