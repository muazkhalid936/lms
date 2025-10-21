import { Search, ChevronDown, Eye, Download, ExternalLink } from "lucide-react";
import React from "react";
import Image from "next/image";

// Order Component
const Order = ({
  orderId,
  courseName,
  courseImage,
  date,
  amount,
  originalAmount,
  isFreeCourse,
  hasDiscount,
  status,
  paymentMethod,
  progress,
  onView,
  onDownload,
}) => {
  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-[var(--green-500)] text-white";
      case "pending":
        return "bg-[var(--indigo-800)] text-white";
      case "cancelled":
        return "bg-red-500 text-white";
      case "processing":
        return "bg-blue-500 text-white";
      case "failed":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatAmount = (amount) => {
    if (!amount) return "$0";
    return typeof amount === "number" ? `$${amount}` : amount;
  };

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden md:flex items-center py-4 px-6 border-b border-gray-200 hover:bg-gray-50 transition-colors">
        <div className="flex-1 min-w-0">
          <span className="text-[var(--gray-600)] text-[14px] font-medium">
            {orderId}
          </span>
        </div>
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-3">
            {courseImage && (
              <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={courseImage}
                  alt={courseName || "Course"}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[14px] font-medium text-gray-900 truncate">
                {courseName || "Course Name"}
              </p>
              {paymentMethod && (
                <p className="text-xs text-gray-500">via Stripe</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-0 pr-4">
          <span className="text-[var(--gray-600)] text-[14px]">{date}</span>
        </div>
        <div className="flex-1 min-w-0 pr-4">
          <div className="text-[14px]">
            {isFreeCourse ? (
              <span className="text-green-600 font-medium">Free</span>
            ) : (
              <div>
                <span className="text-[var(--gray-600)] font-medium">
                  {formatAmount(amount)}
                </span>
                {hasDiscount && originalAmount && (
                  <span className="text-xs text-gray-400 line-through ml-1">
                    ${originalAmount}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0 pr-4">
          <span
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-[4px] text-[14px] font-medium capitalize ${getStatusStyles(
              status
            )}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
            {status}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onView?.(orderId)}
            className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
            title="View course"
          >
            <ExternalLink size={18} />
          </button>
          <button
            onClick={() => onDownload?.(orderId)}
            className="p-2 text-gray-500 hover:text-green-600 transition-colors"
            title="Download PDF Invoice"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{orderId}</h3>
            <p className="text-sm text-gray-600">{date}</p>
            {paymentMethod && (
              <p className="text-xs text-gray-500">via {paymentMethod}</p>
            )}
          </div>
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-[4px] text-xs font-medium capitalize ${getStatusStyles(
              status
            )}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
            {status}
          </span>
        </div>

        {/* Course Info */}
        <div className="flex items-center gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
          {courseImage && (
            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={courseImage}
                alt={courseName || "Course"}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {courseName || "Course Name"}
            </p>
            {progress !== undefined && (
              <div className="mt-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">{progress}%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div>
            {isFreeCourse ? (
              <div className="text-lg font-bold text-green-600">Free</div>
            ) : (
              <div>
                <div className="text-xl font-bold text-gray-900">
                  {formatAmount(amount)}
                </div>
                {hasDiscount && originalAmount && (
                  <div className="text-sm text-gray-400 line-through">
                    ${originalAmount}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onView?.(orderId)}
              className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ExternalLink size={16} />
              View
            </button>
            <button
              onClick={() => onDownload?.(orderId)}
              className="flex items-center gap-1 px-3 py-1 text-sm text-green-600 hover:text-green-800 transition-colors"
            >
              <Download size={16} />
              Invoice
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Order;
