import React, { useState } from "react";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import { FaLink } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Pagination from "@/components/common/Pagination";
import toast from "react-hot-toast";
import { Video } from "lucide-react";
const UpcomingClasses = ({
  classes,
  isCopyLink = false,
  isDateAndTime,
  isTableHeader,
  isJoin,
  isViewRecording,
  tableHeading = "Upcoming Live Classes",
  heading,
  tableHeaderStyling = "",
  itemsPerPage = 5,
  onJoinClass,
  onRegisterClass,
  registeringClassId,
}) => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedClasses = classes.slice(startIndex, endIndex);

  const link = "https://dream-lms.vercel.app/dashboard/student/live-classes";

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard!");
  };

  const handleJoinClick = (classItem) => {
    if (classItem.isRegistered && classItem.canJoin) {
      onJoinClass(classItem.id);
    } else if (!classItem.isRegistered) {
      // Show register option
      if (onRegisterClass) {
        onRegisterClass(classItem.id);
      }
    } else {
      toast.error("This class is not available for joining at the moment.");
    }
  };

  const handleViewRecording = (classItem) => {
    if (classItem.recordingUrl) {
      window.open(classItem.recordingUrl, "_blank");
    } else {
      toast.error("Recording is not available for this class.");
    }
  };

  return (
    <div>
      {heading && (
        <h2 className="text-[20px] mb-4 font-bold border-[var(--gray-100)] text-gray-900">
          {heading}
        </h2>
      )}
      <div className="w-full bg-white border border-[var(--gray-100)] rounded-[10px] px-6 pt-2 shadow-sm">
        {/* Table Container with Horizontal Scroll */}
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full min-w-[640px]">
            {/* Table Header */}
            {isTableHeader && (
              <thead className={`bg-white ${tableHeaderStyling}`}>
                <tr className="border-b border-[var(--gray-100)]">
                  <th className="text-left py-3 pr-4 min-w-[200px]">
                    <span className="text-[20px] font-bold text-gray-900">
                      {tableHeading}
                    </span>
                  </th>
                  {isDateAndTime && (
                    <>
                      <th className="text-center py-3 px-4 min-w-[140px]">
                        <span className="text-[20px] font-bold text-gray-900">
                          Date
                        </span>
                      </th>
                      <th className="text-center py-3 px-4 min-w-[120px]">
                        <span className="text-[20px] font-bold text-gray-900">
                          Time
                        </span>
                      </th>
                    </>
                  )}
                  <th className="text-right py-3 pl-4 min-w-[160px]">
                    <span className="text-[20px] font-bold text-gray-900">
                      Action
                    </span>
                  </th>
                </tr>
              </thead>
            )}

            {/* Table Body */}
            <tbody>
              {paginatedClasses.map((classItem, index) => {
                const {
                  id,
                  title,
                  description,
                  date,
                  time,
                  isRegistered,
                  canJoin,
                  status,
                } = classItem;

                return (
                  <tr
                    key={id || index}
                    className="border-b border-[var(--gray-100)] group hover:bg-gray-50 transition-colors"
                  >
                    {/* Class Info Column */}
                    <td className="py-6 pr-4 align-middle min-w-[200px]">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-1">
                          {description}
                        </p>
                        {status && (
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded-full ${
                              status === "live"
                                ? "bg-red-100 text-red-800"
                                : status === "scheduled"
                                ? "bg-blue-100 text-blue-800"
                                : status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {status === "live"
                              ? "Live Now"
                              : status === "scheduled"
                              ? "Scheduled"
                              : status === "completed"
                              ? "Completed"
                              : status}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Date Column */}
                    {isDateAndTime && (
                      <td className="py-6 px-4 text-center align-middle min-w-[140px]">
                        <div className="flex items-center justify-center whitespace-nowrap">
                          <Calendar className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{date}</span>
                        </div>
                      </td>
                    )}

                    {/* Time Column */}
                    {isDateAndTime && (
                      <td className="py-6 px-4 text-center align-middle min-w-[120px]">
                        <div className="flex items-center justify-center whitespace-nowrap">
                          <Clock className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{time}</span>
                        </div>
                      </td>
                    )}

                    {/* Action Column */}
                    <td className="py-6 pl-4 text-right align-middle min-w-[160px]">
                      {isCopyLink ? (
                        <button onClick={handleCopy}>
                          <FaLink className="w-5 h-5 text-gray-600 cursor-pointer" />
                        </button>
                      ) : isJoin ? (
                        <div className="flex flex-col gap-2 items-end">
                          {isRegistered ? (
                            <button
                              onClick={() => handleJoinClick(classItem)}
                              disabled={!canJoin}
                              className={`px-[14px] py-[5px] text-white rounded-[100px] text-sm font-medium whitespace-nowrap transition-colors duration-200
    ${
      canJoin
        ? "bg-[var(--rose-500)] hover:bg-red-500 cursor-pointer"
        : "bg-gray-400 cursor-not-allowed"
    }`}
                            >
                              {status === "live" ? "Join Now" : "Join"}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleJoinClick(classItem)}
                              disabled={registeringClassId === classItem.id}
                              className={`px-[14px] py-[5px] text-white rounded-[100px] text-sm font-medium cursor-pointer whitespace-nowrap transition-colors duration-200 ${
                                registeringClassId === classItem.id
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-blue-500 hover:bg-blue-600"
                              }`}
                            >
                              {registeringClassId === classItem.id
                                ? "Registering..."
                                : "Register"}
                            </button>
                          )}
                          {isRegistered && !canJoin && status !== "live" && (
                            <span className="text-xs text-gray-500">
                              Registered
                            </span>
                          )}
                        </div>
                      ) : isViewRecording ? (
                        <button
                          onClick={() => handleViewRecording(classItem)}
                          className="bg-[var(--rose-500)] px-[14px] py-[5px] text-white rounded-[100px] text-sm font-medium cursor-pointer whitespace-nowrap"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src="/dashboard/student/recorder.png"
                              alt="Recording"
                              className="w-3 h-2 flex-shrink-0"
                            />
                            <span>View Recording</span>
                          </div>
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            router.push("/dashboard/student/live-classes")
                          }
                          className="cursor-pointer bg-[var(--gray-600-70)] hover:bg-gray-800 text-white rounded-full p-3 transition-all duration-200 group-hover:scale-105 transform"
                        >
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {paginatedClasses.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <Video className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium">No live classes found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          totalItems={classes.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default UpcomingClasses;
