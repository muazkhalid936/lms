"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AgoraVideo from "@/components/agora/AgoraVideo";
import { ArrowLeft, Home, Users, Clock, User } from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "@/store/authStore";

const MeetingPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const [meetingData, setMeetingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    // Get user info from store and localStorage
    if (user) {
      setUserName(user.userName || "");
      const storedUserEmail =
        localStorage.getItem("userEmail") || user.email || "";
      setUserEmail(storedUserEmail);
    }

    // Fetch meeting data
    fetchMeetingData();
  }, [id, user]);

  const fetchMeetingData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the dedicated join endpoint to get meeting credentials
      const response = await fetch(`/api/live-classes/${id}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const channelInfo = data.data;

        if (channelInfo) {
          console.log("[MeetingPage] Received channel info:", channelInfo);
          console.log(
            "[MeetingPage] UID from API:",
            channelInfo.channelInfo.uid,
            "Type:",
            typeof channelInfo.channelInfo.uid
          );

          setMeetingData({
            id: id,
            title: channelInfo.className,
            description: "Live class session",
            agoraChannelName: channelInfo.channelInfo.channelName,
            agoraToken: channelInfo.channelInfo.token,
            agoraAppId: channelInfo.channelInfo.appId,
            agoraUid: channelInfo.channelInfo.uid,
            course: { courseTitle: channelInfo.className },
            instructor: channelInfo.instructor,
            scheduledDate: channelInfo.scheduledDate,
            status: "live",
            isRegistered: true,
            canJoin: true,
          });
        } else {
          setError("Meeting data not available.");
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to fetch meeting data");
      }
    } catch (error) {
      console.error("Error fetching meeting data:", error);
      setError("Failed to load meeting. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push("/dashboard/student/live-classes");
  };

  const handleMeetingJoined = (meetingInfo) => {
    toast.success(`Joined meeting: ${meetingData?.title}`);
  };

  const handleMeetingLeft = () => {
    toast.success("Left the meeting");
    // Optionally redirect back to live classes
    setTimeout(() => {
      router.push("/dashboard/student/live-classes");
    }, 2000);
  };

  const handleMeetingError = (error) => {
    toast.error(`Meeting error: ${error}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading meeting...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Meeting Not Available
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={handleGoBack}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={handleGoHome}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Go to Live Classes
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!meetingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Meeting data not available</p>
        </div>
      </div>
    );
  }
  console.log(meetingData);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <AgoraVideo
            channelName={meetingData.agoraChannelName}
            token={meetingData.agoraToken}
            appId={meetingData.agoraAppId}
            uid={meetingData.agoraUid}
            userRole={user?.userType || "student"}
            classTitle={meetingData.title}
            instructorName={meetingData.instructor}
          />
        </div>
      </div>
    </div>
  );
};

export default MeetingPage;
