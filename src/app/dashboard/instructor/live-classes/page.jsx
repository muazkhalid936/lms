"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Calendar,
  Clock,
  Users,
  Video,
  Edit,
  Trash2,
  Eye,
  ChevronRight,
  ChevronLeft,
  X,
  CalendarDays,
  Globe,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";
import TableSkeleton from "@/components/common/TableSkeleton";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import Pagination from "@/components/common/Pagination";
import AddLiveClassModal from "@/components/dashboard/instructor/AddLiveClassModal";
import apiCaller from "@/lib/utils/apiCaller";
import Link from "next/link";

const LiveClassesPage = () => {
  const router = useRouter();
  const [liveClasses, setLiveClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const [editingClass, setEditingClass] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [zoomConnectionStatus, setZoomConnectionStatus] = useState(null);
  const [checkingZoom, setCheckingZoom] = useState(true);

  // Form state for create/edit modal
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseId: "",
    scheduledDate: "",
    duration: 60,
    maxParticipants: 100,
    isPublic: false,
    requiresRegistration: true,
    sendReminders: false,
    recordSession: false,
  });

  useEffect(() => {
    fetchLiveClasses();
    checkZoomConnection();
    fetchCourses();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchLiveClasses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      });

      const response = await apiCaller.get(`/api/live-classes?${params}`);

      if (response.success) {
        setLiveClasses(response.data.liveClasses);
        setTotalPages(response.data.pagination.pages);
        setTotalItems(response.data.pagination.total);
      } else {
        toast.error(response.message || "Failed to fetch live classes");
      }
    } catch (error) {
      console.error("Error fetching live classes:", error);
      toast.error(error.message || "Failed to fetch live classes");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    const id = localStorage.getItem("userId");
    try {
      const response = await fetch(`/api/courses?instructor=${id}`);
      const result = await response.json();
      console.log("Fetch courses result:", result);
      if (result.success) {
        setCourses(result.data);
      } else {
        toast.error(result.message || "Failed to fetch courses");
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error(error.message || "Failed to fetch courses");
    }
  };

  const checkZoomConnection = async () => {
    const id = localStorage.getItem("userId");
    try {
      setCheckingZoom(true);
      const response = await fetch(`/api/instructor/zoom-status?instructorId=${id}`);
      const result = await response.json();
      if (result.success) {
        setZoomConnectionStatus(result);
      }
    } catch (error) {
      console.error("Error checking Zoom connection:", error);
    } finally {
      setCheckingZoom(false);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      console.log("Form Data:", formData);
      const dataToSend = {
        ...formData,
        scheduledDate: formData.scheduledDate, // REMOVE toISOString()
      };

      const response = await apiCaller.post("/api/live-classes", dataToSend);

      if (response.success) {
        toast.success("Live class created successfully!");
        setShowCreateModal(false);
        resetForm();
        fetchLiveClasses();
      } else {
        // Check if the error is related to Zoom connection
        if (response.requiresZoomConnection) {
          toast.error(
            <div>
              <div className="font-medium">Zoom Account Required</div>
              <div className="text-sm">{response.error}</div>
              <button 
                onClick={() => router.push('/dashboard/instructor/settings?tab=zoom')}
                className="mt-2 text-blue-600 underline text-sm"
              >
                Connect Zoom Account
              </button>
            </div>,
            { duration: 8000 }
          );
        } else {
          toast.error(response.message || "Failed to create live class");
        }
      }
    } catch (error) {
      console.error("Error creating live class:", error);
      if (error.response?.data?.requiresZoomConnection) {
        toast.error(
          <div>
            <div className="font-medium">Zoom Account Required</div>
            <div className="text-sm">{error.response.data.error}</div>
            <button 
              onClick={() => router.push('/dashboard/instructor/settings?tab=zoom')}
              className="mt-2 text-blue-600 underline text-sm"
            >
              Connect Zoom Account
            </button>
          </div>,
          { duration: 8000 }
        );
      } else {
        toast.error(error.message || "Error creating live class");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateClass = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const dataToSend = {
        ...formData,
        scheduledDate: new Date(formData.scheduledDate).toISOString(),
      };
      const response = await apiCaller.put(
        `/api/live-classes/${editingClass._id}`,
        dataToSend
      );

      if (response.success) {
        toast.success("Live class updated successfully!");
        setShowCreateModal(false);
        setEditingClass(null);
        resetForm();
        fetchLiveClasses();
      } else {
        toast.error(response.message || "Failed to update live class");
      }
    } catch (error) {
      console.error("Error updating live class:", error);
      toast.error(error.message || "Error updating live class");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClass = async () => {
    try {
      const response = await apiCaller.delete(
        `/api/live-classes/${classToDelete._id}`
      );

      if (response.success) {
        toast.success("Live class deleted successfully!");
        setShowDeleteModal(false);
        setClassToDelete(null);
        fetchLiveClasses();
      } else {
        toast.error(response.message || "Failed to delete live class");
      }
    } catch (error) {
      console.error("Error deleting live class:", error);
      toast.error(error.message || "Error deleting live class");
    }
  };

  const handleStartClass = async (classId) => {
    try {
      const response = await apiCaller.post(
        `/api/live-classes/${classId}/start`
      );

      if (response.success) {
        toast.success("Live class started successfully!");
        // Redirect to the Zoom meeting URL
        if (response.data.meetingUrl) {
          window.open(response.data.meetingUrl, "_blank");
        }
        fetchLiveClasses(); // Refresh the list
      } else {
        toast.error(response.message || "Failed to start live class");
      }
    } catch (error) {
      console.error("Error starting live class:", error);
      toast.error(error.message || "Failed to start live class");
    }
  };

  const handleJoinClass = async (classId) => {
    try {
      const response = await apiCaller.post(
        `/api/live-classes/${classId}/join`
      );

      if (response.success) {
        toast.success("Joining live class...");
        // Redirect to the meeting URL
        if (response.data.meetingUrl) {
          window.open(response.data.meetingUrl, "_blank");
        }
        fetchLiveClasses(); // Refresh the list
      } else {
        toast.error(response.message || "Failed to join live class");
      }
    } catch (error) {
      console.error("Error joining live class:", error);
      toast.error(error.message || "Failed to join live class");
    }
  };

  const handleModalSubmit = (e) => {
    if (editingClass) {
      handleUpdateClass(e);
    } else {
      handleCreateClass(e);
    }
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setEditingClass(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      courseId: "",
      scheduledDate: "",
      duration: 60,
      maxParticipants: 100,
      isPublic: false,
      requiresRegistration: true,
      sendReminders: true,
      recordSession: true,
    });
  };

  const openEditModal = (liveClass) => {
    setEditingClass(liveClass);
    setFormData({
      title: liveClass.title,
      description: liveClass.description,
      courseId: liveClass.course._id,
      scheduledDate: new Date(liveClass.scheduledDate)
        .toISOString()
        .slice(0, 16),
      duration: liveClass.duration,
      maxParticipants: liveClass.maxParticipants,
      isPublic: liveClass.isPublic,
      requiresRegistration: liveClass.requiresRegistration,
      sendReminders: liveClass.sendReminders,
      recordSession: liveClass.recordSession,
    });
    setShowCreateModal(true);
  };

  const openDeleteModal = (liveClass) => {
    setClassToDelete(liveClass);
    setShowDeleteModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Scheduled",
      },
      live: { bg: "bg-green-100", text: "text-green-800", label: "Live" },
      completed: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        label: "Completed",
      },
      cancelled: { bg: "bg-red-100", text: "text-red-800", label: "Cancelled" },
    };

    const config = statusConfig[status] || statusConfig.scheduled;
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const canStartClass = (liveClass) => {
    const now = new Date();
    const scheduledTime = new Date(liveClass.scheduledDate);
    const timeDiff = scheduledTime.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);

    // Can start if:
    // 1. Class is scheduled and within 15 minutes before to 5 minutes after scheduled time
    // 2. Class is already live but hasn't been manually started yet (no actualStartTime)
    return (
      (minutesDiff <= 15 &&
        minutesDiff >= -5 &&
        liveClass.status === "scheduled") ||
      (liveClass.status === "live" && !liveClass.actualStartTime)
    );
  };

  const canJoinClass = (liveClass) => {
    const now = new Date();
    const scheduledTime = new Date(liveClass.scheduledDate);
    const timeDiff = scheduledTime.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);

    // Can join if class is live or if it's within 5 minutes of start time
    return (
      liveClass.status === "live" ||
      (minutesDiff <= 5 &&
        minutesDiff >= -30 &&
        liveClass.status === "scheduled")
    );
  };

  const filteredClasses = liveClasses.filter((liveClass) => {
    const matchesSearch =
      liveClass.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      liveClass.course.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || liveClass.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  console.log(filteredClasses);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Classes</h1>
          <p className="text-gray-600 mt-1">
            Manage your live classes and webinars
          </p>
        </div>
        <button
          onClick={() => {
            if (zoomConnectionStatus?.isConnected) {
              setShowCreateModal(true);
            } else {
              toast.error("Please connect your Zoom account first");
              router.push("/dashboard/instructor/settings?tab=zoom");
            }
          }}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            zoomConnectionStatus?.isConnected
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          disabled={!zoomConnectionStatus?.isConnected}
        >
          <Plus size={20} />
          Create Live Class
        </button>
      </div>

      {/* Zoom Connection Status Alert */}
      {!checkingZoom && zoomConnectionStatus && !zoomConnectionStatus.isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                Zoom Account Not Connected
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                You need to connect your Zoom account to create and host live classes. 
                This ensures meetings show your name as the host.
              </p>
              <div className="mt-3">
                <button
                  onClick={() => router.push("/dashboard/instructor/settings?tab=zoom")}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm px-4 py-2 rounded-md transition-colors"
                >
                  Connect Zoom Account
                </button>
              </div>
            </div>
            <button
              onClick={() => setZoomConnectionStatus({ ...zoomConnectionStatus, dismissed: true })}
              className="flex-shrink-0 text-yellow-400 hover:text-yellow-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search live classes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="live">Live</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Live Classes Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <TableSkeleton />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Schedule
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participants
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClasses.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        <Video className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium">
                          No live classes found
                        </p>
                        <p className="text-sm">
                          Create your first live class to get started
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredClasses.map((liveClass) => (
                      <tr key={liveClass._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {liveClass.title}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {liveClass.description?.substring(0, 60)}
                              {liveClass.description?.length > 60 && "..."}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              {liveClass.isPublic ? (
                                <span className="inline-flex items-center gap-1 text-xs text-green-600">
                                  <Globe size={12} />
                                  Public
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                                  <Lock size={12} />
                                  Private
                                </span>
                              )}
                              <span className="text-xs text-gray-500">
                                {liveClass.duration} min
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {liveClass.course.courseTitle}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {formatDateTime(liveClass.scheduledDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {liveClass.registeredStudents?.length || 0} /{" "}
                            {liveClass.maxParticipants}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(liveClass.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {canStartClass(liveClass) && (
                              <button
                                onClick={() => handleStartClass(liveClass._id)}
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs transition-colors"
                              >
                                Start
                              </button>
                            )}
                            {canJoinClass(liveClass) && (
                              <Link
                                // onClick={() => handleJoinClass(liveClass._id)}
                                href={liveClass.zoomStartUrl}
                                target="_blank"
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition-colors"
                              >
                                Join
                              </Link>
                            )}
                            <button
                              onClick={() => openEditModal(liveClass)}
                              className="text-blue-600 hover:text-blue-800 p-1"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => openDeleteModal(liveClass)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalItems > 10 && (
              <div className="px-6 py-3 border-t border-gray-200">
                <Pagination
                  totalItems={totalItems}
                  itemsPerPage={10}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  maxButtons={5}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Live Class Modal */}
      <AddLiveClassModal
        isOpen={showCreateModal}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        formData={formData}
        setFormData={setFormData}
        courses={courses}
        editingClass={editingClass}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setClassToDelete(null);
        }}
        onConfirm={handleDeleteClass}
        title="Delete Live Class"
        message={`Are you sure you want to delete "${classToDelete?.title}"? This action cannot be undone and will permanently remove the class and all associated data.`}
        confirmText="Delete Class"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default LiveClassesPage;
