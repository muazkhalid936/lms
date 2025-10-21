"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  PlayCircle,
  HelpCircle,
  Clock,
  Edit,
  Trash2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import TableSkeleton from "@/components/common/TableSkeleton";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

const AllCourses = ({ itemsPerPage = 5 }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const router = useRouter();

  // Fetch courses created by the instructor
  const fetchInstructorCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get instructor ID from localStorage
      const userId =
        localStorage.getItem("userID") || localStorage.getItem("userId");
      if (!userId) {
        setError("Please log in to view your courses. User ID not found.");
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/courses?instructor=${userId}`);

      const result = await response.json();
      console.log("Fetch courses result:", result);

      if (result.success) {
        // Transform the data to match the expected format
        const transformedCourses = result.data.map((course) => ({
          id: course._id,
          name: course.courseTitle,
          lessons: course.totalLessons || 0,
          quizzes:
            course.totalQuizzes ||
            course.chapters?.reduce(
              (total, chapter) => total + (chapter.quizzes?.length || 0),
              0
            ) ||
            0,
          duration: course.courseDuration || "0",
          studentsEnrolled: course.enrolledStudents.length || 0,
          price: course.discountPrice
            ? course.discountPrice
            : course.price || 0,
          ratings: {
            score: course.averageRating || 0,
            count: course.totalRatings || 0,
          },
          status: course.status || "published",
          thumbnail: course.thumbnail?.url || "/dashboard/instructor/w.png",
        }));

        setCourses(transformedCourses);
      } else {
        setError(result.message || "Failed to fetch courses");
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError(error.message || "Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  // Load courses on component mount
  useEffect(() => {
    fetchInstructorCourses();
  }, []);

  // Handle course editing
  const handleEditCourse = (courseId) => {
    router.push(`/dashboard/instructor/add-course?edit=${courseId}`);
  };

  // Handle course deletion
  const handleDeleteCourse = (courseId) => {
    const course = courses.find((c) => c.id === courseId);
    setCourseToDelete(course);
    setShowDeleteModal(true);
  };

  // Confirm course deletion
  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return;

    const toastId = toast.loading("Deleting course...");

    try {
      const response = await fetch(`/api/courses/${courseToDelete.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        // Remove the course from the local state
        setCourses((prevCourses) =>
          prevCourses.filter((course) => course.id !== courseToDelete.id)
        );
        toast.success("Course deleted successfully", { id: toastId });
      } else {
        toast.error(result.message || "Failed to delete course", {
          id: toastId,
        });
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error("Failed to delete course", { id: toastId });
    } finally {
      setShowDeleteModal(false);
      setCourseToDelete(null);
    }
  };

  // Cancel course deletion
  const cancelDeleteCourse = () => {
    setShowDeleteModal(false);
    setCourseToDelete(null);
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCourses = filteredCourses.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      published: {
        bg: "bg-[var(--green-500)]",
        text: "text-white",
        label: "Published",
      },
      draft: { bg: "bg-[var(--cyan-400)]", text: "text-white", label: "Draft" },
      pending: {
        bg: "bg-[var(--indigo-700)]",
        text: "text-white",
        label: "Pending",
      },
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${config.bg} ${config.text}`}
      >
        • {config.label}
      </span>
    );
  };

  const CourseIcon = () => (
    <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
      <span className="text-orange-400 font-bold text-lg">W</span>
    </div>
  );

  return (
    <div className="bg-white">
      {/* Filters */}
      {/* <div className="flex flex-col md:flex-row  items-center gap-4 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border w-full md:w-auto border-gray-200 rounded-lg text-sm text-gray-600 bg-white"
          disabled={loading}
        >
          <option value="">Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
        </select>

        <div className="relative flex-1 w-full md:max-w-md ml-auto">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm"
            disabled={loading}
          />
        </div>
      </div> */}

      {/* Loading State */}
      {loading && <TableSkeleton rows={itemsPerPage} />}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchInstructorCourses}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State - No Courses */}
      {!loading && !error && courses.length === 0 && (
        <div className="text-center py-12">
          <div className="mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PlayCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Courses Yet
            </h3>
            <p className="text-gray-500 mb-6">
              You haven't created any courses yet. Start by creating your first
              course.
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard/instructor/add-course")}
            className="px-6 py-3 bg-[var(--rose-500)] text-white rounded-lg hover:bg-red-500 transition-colors font-medium"
          >
            Create a Course
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && courses.length > 0 && (
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

              {/* Table Body */}
              <tbody className="divide-y divide-gray-100">
                {currentCourses.map((course) => (
                  <tr
                    key={course.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Course Info */}
                    <td className="px-6 py-4 w-80">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            course.thumbnail || "/dashboard/instructor/w.png"
                          }
                          alt="Course thumbnail"
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1 truncate">
                            {course.name}
                          </h3>
                          <div className="flex items-center gap-2 text-[12px] text-[var(--gray-600)]">
                            <div className="flex items-center gap-1">
                              <PlayCircle className="w-4 h-4" />
                              <span>{course.lessons} Lessons</span>
                            </div>

                            <div className="h-5 w-px bg-gray-300" />
                            <div className="flex items-center gap-1">
                              <HelpCircle className="w-4 h-4" />
                              <span>{course.quizzes} Quizzes</span>
                            </div>

                            <div className="h-5 w-px bg-gray-300" />
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{course.duration} Hours</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Students */}
                    <td className="text-center px-4 py-4 text-gray-900 w-24">
                      {course.studentsEnrolled}
                    </td>

                    {/* Price */}
                    <td className="text-center px-4 py-4 text-gray-900 w-20">
                      ${course.price}
                    </td>

                    {/* Ratings */}
                    <td className="text-center px-4 py-4 w-32">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-yellow-400">★</span>
                        <span className="font-medium text-gray-900">
                          {course.ratings.score}
                        </span>
                        <span className="text-gray-500">
                          ({course.ratings.count})
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="text-center px-2 py-4 w-28">
                      {getStatusBadge(course.status)}
                    </td>

                    {/* Actions */}
                    <td className="text-center px-4 py-4 w-24">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditCourse(course.id)}
                          className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Course"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Course"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && courses.length > 0 && totalPages > 0 && (
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>
              Page {currentPage} of {totalPages}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Previous button */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 cursor-pointerr bg-[var(--gray-50)] rounded-full text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page numbers */}
            {generatePageNumbers().map((page, index) =>
              page === "..." ? (
                <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`w-8 h-8 cursor-pointer rounded-full text-sm font-medium transition-colors ${
                    page === currentPage
                      ? "bg-[var(--rose-500)] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {page}
                </button>
              )
            )}

            {/* Next button */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 cursor-pointer bg-[var(--gray-50)] rounded-full text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* No results message */}
      {!loading &&
        !error &&
        courses.length > 0 &&
        filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No courses found matching your criteria.
            </p>
          </div>
        )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDeleteCourse}
        onConfirm={confirmDeleteCourse}
        title="Delete Course"
        message={`Are you sure you want to delete "${courseToDelete?.name}"? This action cannot be undone and will permanently remove all course content, student progress, and associated data.`}
        confirmText="Delete Course"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};
export default AllCourses;
