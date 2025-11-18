"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import UpcomingClasses from "./home/UpcomingClasses";
import toast from "react-hot-toast";
import useAuthStore from "@/store/authStore";

const LiveClasses = () => {
  const { user } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [liveClasses, setLiveClasses] = useState([]);
  const [browseClasses, setBrowseClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [error, setError] = useState(null);
  const [browseError, setBrowseError] = useState(null);

  // Fetch live classes from API
  const fetchLiveClasses = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/live-classes/student", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setLiveClasses(data.data || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch live classes");
      }
    } catch (error) {
      console.error("Error fetching live classes:", error);
      setError("Failed to fetch live classes");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all available live classes for browsing
  const fetchBrowseClasses = async () => {
    try {
      setBrowseLoading(true);
      setBrowseError(null);

      const response = await fetch("/api/live-classes/browse", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBrowseClasses(data.liveClasses || []);
      } else {
        const errorData = await response.json();
        setBrowseError(errorData.error || "Failed to fetch available classes");
      }
    } catch (error) {
      console.error("Error fetching browse classes:", error);
      setBrowseError("Failed to fetch available classes");
    } finally {
      setBrowseLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveClasses();
    if (activeTab === "browse") {
      fetchBrowseClasses();
    }
  }, [activeTab, user]);

  // Separate classes into upcoming and past
  const upcomingClasses = liveClasses.filter((liveClass) => {
    const now = new Date();
    const scheduledDate = new Date(liveClass.scheduledDate);
    return scheduledDate > now || liveClass.status === "live";
  });

  const pastClasses = liveClasses.filter((liveClass) => {
    return liveClass.status === "completed";
  });

  // Transform live class data to match the expected format for UpcomingClasses component
  const transformLiveClassData = (classes) => {
    return classes.map((liveClass) => {
      const scheduledDate = new Date(liveClass.scheduledDate);

      return {
        id: liveClass._id,
        title: liveClass.title,
        description: liveClass.description,
        date: scheduledDate.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        time: scheduledDate.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        course: liveClass.course?.courseTitle || "Unknown Course",
        instructor: liveClass.instructor
          ? `${liveClass.instructor.firstName} ${liveClass.instructor.lastName}`
          : "Unknown Instructor",
        isRegistered: liveClass.isRegistered,
        canJoin: liveClass.canJoin,
        isLive: liveClass.status === "live",
        zoomJoinUrl: liveClass.zoomJoinUrl,
        zoomPassword: liveClass.zoomPassword,
        status: liveClass.status,
        recordingUrl: liveClass.recordingUrl,
      };
    });
  };

  const handleJoinClass = async (classId) => {
    try {
      const classToJoin = [...upcomingClasses, ...pastClasses].find(
        (cls) => cls._id === classId
      );
      
      if (classToJoin && classToJoin.zoomJoinUrl) {
        // Navigate to the dedicated meeting page
        router.push(`/meeting/${classId}`);
      } else {
        toast.error("Join link is not available for this class.");
      }
    } catch (error) {
      console.error("Error joining class:", error);
      toast.error("Failed to join class. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="px-6">
        <h2 className="text-[20px] mb-4 font-bold pb-4 border-b border-[var(--gray-100)] text-gray-900">
          Live Classes
        </h2>
        <div className="max-w-[1440px] flex flex-col gap-4 mx-auto px-4 py-16 sm:px-10 w-full">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#392C7D]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6">
        <h2 className="text-[20px] mb-4 font-bold pb-4 border-b border-[var(--gray-100)] text-gray-900">
          Live Classes
        </h2>
        <div className="text-center py-8 text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="px-6">
      <h2 className="text-[20px] mb-4 font-bold pb-4 border-b border-[var(--gray-100)] text-gray-900">
        Live Classes
      </h2>
      {/* Tab Navigation */}
      <div className="flex border border-[var(--gray-100)] bg-[var(--gray-25)] text-[16px] rounded-[4px] mb-4">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`px-6 py-4 w-1/2 cursor-pointer font-semibold text-sm border-b-[3px] transition-colors ${
            activeTab === "upcoming"
              ? "text-[var(--rose-500)] border-[var(--rose-500)]"
              : "text-[var(--gray-600)] border-transparent hover:text-gray-700"
          }`}
        >
          My Classes
        </button>

        <button
          onClick={() => setActiveTab("past")}
          className={`px-6 py-3 w-1/2 font-semibold cursor-pointer text-sm border-b-[3px] transition-colors ${
            activeTab === "past"
              ? "text-[var(--rose-500)] border-[var(--rose-500)]"
              : "text-[var(--gray-600)] border-transparent hover:text-gray-700"
          }`}
        >
          Past Classes
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-0">
        {activeTab === "upcoming" && (
          <UpcomingClasses
            classes={transformLiveClassData(upcomingClasses)}
            isTableHeader={true}
            isDateAndTime={true}
            isJoin={true}
            tableHeading="My Upcoming Classes"
            onJoinClass={handleJoinClass}
          />
        )}

        {activeTab === "past" && (
          <UpcomingClasses
            classes={transformLiveClassData(pastClasses)}
            isTableHeader={true}
            isDateAndTime={true}
            isViewRecording={true}
            tableHeading="Past Live Classes"
          />
        )}
      </div>
    </div>
  );
};

export default LiveClasses;
