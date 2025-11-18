"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ZoomEmbed } from "@/components/zoom";
import ZoomAccountStatus from "@/components/meetings/ZoomAccountStatus";
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
  const [isInstructor, setIsInstructor] = useState(false);
  const [meetingUrl, setMeetingUrl] = useState("");

  useEffect(() => {
    // Get user info from store and localStorage
    if (user) {
      // Use instructor's actual name if they are the instructor
      let displayName = user.userName || "";
      if (user.userType === "Instructor" && user.firstName && user.lastName) {
        displayName = `${user.firstName} ${user.lastName}`;
      }
      setUserName(displayName);
      
      const storedUserEmail = localStorage.getItem("userEmail") || user.email || "";
      setUserEmail(storedUserEmail);
    }

    // Fetch meeting data
    fetchMeetingData();
  }, [id, user]);

  const fetchMeetingData = async () => {
    try {
      setLoading(true);
      setError(null);

      // First try to get from student live classes
      const response = await fetch("/api/live-classes/student", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const liveClasses = data.data || [];
        
        // Find the specific class by ID
        const targetClass = liveClasses.find(cls => cls._id === id);
        
        if (targetClass) {
          // Check if current user is the instructor
          const currentUserIsInstructor = user && targetClass.instructor && 
            (targetClass.instructor._id === user._id || targetClass.instructor === user._id);
          
          setIsInstructor(currentUserIsInstructor);
          
          // Set appropriate meeting URL based on user role
          let appropriateMeetingUrl = targetClass.zoomJoinUrl;
          if (currentUserIsInstructor && targetClass.zoomStartUrl) {
            appropriateMeetingUrl = targetClass.zoomStartUrl;
            console.log('Using instructor start URL for meeting');
          } else {
            console.log('Using join URL for student');
          }
          
          setMeetingUrl(appropriateMeetingUrl);
          
          setMeetingData({
            id: targetClass._id,
            title: targetClass.title,
            description: targetClass.description,
            zoomJoinUrl: targetClass.zoomJoinUrl,
            zoomStartUrl: targetClass.zoomStartUrl,
            zoomPassword: targetClass.zoomPassword,
            course: targetClass.course,
            instructor: targetClass.instructor,
            scheduledDate: targetClass.scheduledDate,
            status: targetClass.status,
            isRegistered: targetClass.isRegistered,
            canJoin: targetClass.canJoin,
          });
        } else {
          setError("Meeting not found or you don't have access to this meeting.");
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch meeting data");
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
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Meeting Not Available</h2>
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

  const scheduledDate = new Date(meetingData.scheduledDate);
  const formattedDate = scheduledDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = scheduledDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {/* <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            <div className="flex items-center space-x-4">
              <button
                onClick={handleGoBack}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 truncate max-w-md">
                  {meetingData.title}
                </h1>
                <p className="text-sm text-gray-600 truncate max-w-md">
                  {meetingData.course?.courseTitle || "Live Class"}
                </p>
              </div>
            </div>


            <button
              onClick={handleGoHome}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Live Classes</span>
            </button>
          </div>
        </div>
      </div> */}

      {/* Meeting Info Panel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* <div className="bg-white rounded-lg shadow-sm border mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Scheduled Time</p>
                  <p className="text-sm text-gray-600">{formattedDate}</p>
                  <p className="text-sm text-gray-600">{formattedTime}</p>
                </div>
              </div>
            </div>


            {meetingData.instructor && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Instructor</p>
                    <p className="text-sm text-gray-600">
                      {meetingData.instructor.firstName} {meetingData.instructor.lastName}
                    </p>
                  </div>
                </div>
              </div>
            )}


            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    meetingData.status === 'live' 
                      ? 'bg-green-100 text-green-800'
                      : meetingData.status === 'scheduled'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {meetingData.status === 'live' ? 'Live Now' : 
                     meetingData.status === 'scheduled' ? 'Scheduled' : 
                     meetingData.status}
                  </span>
                </div>
              </div>
            </div>
          </div>


          {meetingData.description && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-600">{meetingData.description}</p>
            </div>
          )}
        </div> */}

        {/* Zoom Account Status */}
        <ZoomAccountStatus meetingData={meetingData} user={user} />

        {/* Zoom Meeting Container */}
        <div className="bg-white rounded-lg shadow-sm border">
          <ZoomEmbed
            meetingUrl={meetingUrl}
            meetingPassword={meetingData.zoomPassword}
            userName={userName}
            userEmail={userEmail}
            isHost={isInstructor}
            className="w-full"
            autoJoin={true}
            showControls={true}
            onJoined={handleMeetingJoined}
            onLeft={handleMeetingLeft}
            onError={handleMeetingError}
          />
        </div>
      </div>
    </div>
  );
};

export default MeetingPage;