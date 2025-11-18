"use client";

import React, { useState, useEffect } from "react";

const ZoomEmbed = ({
  meetingUrl,
  meetingPassword,
  userName = "User",
  userEmail = "",
  isHost = false,
  autoJoin = false,
  className = "",
  onJoined,
  onLeft,
  onError,
}) => {
  // Enhanced error handling and user feedback
  const [meetingStatus, setMeetingStatus] = useState("initializing"); // initializing, ready, joining, joined, error, waiting
  const [errorMessage, setErrorMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const [isEmbedded, setIsEmbedded] = useState(autoJoin);
  const [showHostInfo, setShowHostInfo] = useState(false);
  console.log(meetingUrl);

  const extractMeetingDetails = (url) => {
    try {
      // Handle different Zoom URL formats
      const patterns = [
        // Standard join URLs
        /zoom\.us\/j\/(\d+)\?pwd=([^&]+)/,
        /zoom\.us\/j\/(\d+)/,
        /zoom\.us\/meeting\/(\d+)\?pwd=([^&]+)/,
        /zoom\.us\/meeting\/(\d+)/,
        // Host start URLs
        /zoom\.us\/s\/(\d+)\?pwd=([^&]+)/,
        /zoom\.us\/s\/(\d+)/,
        // Web client URLs
        /zoom\.us\/wc\/join\/(\d+)\?pwd=([^&]+)/,
        /zoom\.us\/wc\/join\/(\d+)/,
        /zoom\.us\/wc\/start\/(\d+)\?pwd=([^&]+)/,
        /zoom\.us\/wc\/start\/(\d+)/,
        // Generic meeting URLs
        /zoom\.us\/.*\/(\d+)\?pwd=([^&]+)/,
        /zoom\.us\/.*\/(\d+)/,
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          const isHostUrl =
            url.includes("/s/") ||
            url.includes("/start/") ||
            url.includes("zoomStartUrl");
          return {
            meetingId: match[1],
            password: match[2] || null,
            isHostUrl: isHostUrl,
          };
        }
      }

      // If no pattern matches, try to extract just the meeting ID
      const idMatch = url.match(/(\d{9,11})/);
      if (idMatch) {
        return {
          meetingId: idMatch[1],
          password: null,
          isHostUrl: false,
        };
      }

      return null;
    } catch (error) {
      console.error("Error extracting meeting details:", error);
      if (onError) {
        onError("Failed to parse meeting URL");
      }
      return null;
    }
  };

  const meetingDetails = extractMeetingDetails(meetingUrl);

  const buildEmbedUrl = (meetingDetails) => {
    if (!meetingDetails) return null;

    try {
      // For hosts, use the start URL format to automatically start the meeting
      if (isHost && meetingDetails.isHostUrl) {
        let embedUrl = `https://zoom.us/wc/start/${meetingDetails.meetingId}?prefer=0`;
        const password = meetingPassword || meetingDetails.password;
        if (password) {
          embedUrl += `&pwd=${password}`;
        }
        // Add user information for host
        if (userName) {
          embedUrl += `&uname=${encodeURIComponent(userName)}`;
        }
        if (userEmail) {
          embedUrl += `&email=${encodeURIComponent(userEmail)}`;
        }
        // Add embed parameters
        embedUrl += "&embed=true&tk=&zak=&role=1&enforce_login=false";
        // console.log("Built embed URL:", embedUrl, "for role: host");
        return embedUrl;
      }

      // For participants or non-host URLs, use join format
      let embedUrl = `https://zoom.us/wc/${meetingDetails.meetingId}/join?prefer=0`;
      const password = meetingPassword || meetingDetails.password;
      if (password) {
        embedUrl += `&pwd=${password}`;
      }
      if (userName) {
        embedUrl += `&uname=${encodeURIComponent(userName)}`;
      }
      if (userEmail) {
        embedUrl += `&email=${encodeURIComponent(userEmail)}`;
      }
      // Add embed parameters
      embedUrl += "&embed=true&tk=&zak=&role=0";
      // console.log("Built embed URL:", embedUrl, "for role: participant");
      return embedUrl;
    } catch (error) {
      console.error("Error building embed URL:", error);
      if (onError) {
        onError("Failed to build meeting URL");
      }
      return null;
    }
  };

  const handleJoinMeeting = () => {
    try {
      setMeetingStatus("joining");
      setErrorMessage("");

      const meetingDetails = extractMeetingDetails(meetingUrl);
      if (!meetingDetails) {
        console.error("Cannot join: Invalid meeting URL");
        setMeetingStatus("error");
        setErrorMessage("Invalid meeting URL. Please check the meeting link.");
        if (onError) {
          onError("Invalid meeting URL. Please check the meeting link.");
        }
        return;
      }

      // console.log("Joining meeting with details:", meetingDetails);
      // console.log("User role:", isHost ? "Host" : "Participant");

      const embedUrl = buildEmbedUrl(meetingDetails);
      if (!embedUrl) {
        console.error("Failed to build embed URL");
        setMeetingStatus("error");
        setErrorMessage("Failed to generate meeting URL. Please try again.");
        if (onError) {
          onError("Failed to generate meeting URL. Please try again.");
        }
        return;
      }

      // console.log("Setting embed URL:", embedUrl);
      setIsEmbedded(true);
      setMeetingStatus("joined");

      if (onJoined) {
        onJoined({
          meetingId: meetingDetails.meetingId,
          isHost: isHost,
          embedUrl: embedUrl,
          userName,
          userEmail,
        });
      }
    } catch (error) {
      console.error("Error joining meeting:", error);
      setMeetingStatus("error");
      setErrorMessage(
        "Failed to join meeting. Please try again or contact support."
      );
      if (onError) {
        onError("Failed to join meeting. Please try again or contact support.");
      }
    }
  };

  const handleRetryJoin = () => {
    if (retryCount < maxRetries) {
      setRetryCount((prev) => prev + 1);
      setMeetingStatus("initializing");
      setErrorMessage("");
      setTimeout(() => {
        handleJoinMeeting();
      }, 1000);
    } else {
      setErrorMessage(
        "Maximum retry attempts reached. Please refresh the page or contact support."
      );
    }
  };

  const handleCloseEmbed = () => {
    setIsEmbedded(false);
    if (onLeft) {
      onLeft();
    }
  };

  // Auto-join effect for hosts or when autoJoin is enabled
  useEffect(() => {
    if (!meetingUrl) {
      setMeetingStatus("error");
      setErrorMessage("No meeting URL provided");
      return;
    }

    // console.log("ZoomEmbed updated with:", { meetingUrl });

    const meetingDetails = extractMeetingDetails(meetingUrl);

    if (!meetingDetails) {
      setMeetingStatus("error");
      setErrorMessage("Invalid meeting URL format.");
      if (onError) onError("Invalid meeting URL format.");
      return;
    }

    // console.log("Extracted meeting details:", meetingDetails);
    setMeetingStatus("ready");
    setErrorMessage("");

    // Auto join if host or if autoJoin flag is true
    if ((isHost && meetingDetails.isHostUrl) || autoJoin) {
      handleJoinMeeting();
    }
  }, [meetingUrl, isHost, autoJoin]);

  // Enhanced status-based rendering
  const renderMeetingStatus = () => {
    switch (meetingStatus) {
      case "initializing":
        return (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Initializing meeting...</p>
            </div>
          </div>
        );

      case "ready":
        return (
          <div className="p-6 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Ready to Join Meeting
              </h3>
              <p className="text-gray-600 mb-4">
                {isHost
                  ? "You can start the meeting as the host"
                  : "Click to join the meeting"}
              </p>
            </div>
            <button
              onClick={handleJoinMeeting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {isHost ? "Start Meeting" : "Join Meeting"}
            </button>
          </div>
        );

      case "joining":
        return (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">
                {isHost ? "Starting meeting..." : "Joining meeting..."}
              </p>
            </div>
          </div>
        );

      case "waiting":
        return (
          <div className="p-6 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Waiting for Host
              </h3>
              <p className="text-gray-600 mb-4">
                The meeting hasn't started yet. Please wait for the host to
                start the meeting.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRetryJoin}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => setMeetingStatus("ready")}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        );

      case "error":
        return (
          <div className="p-6 text-center">
            <div className="mb-4">
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Meeting Error
              </h3>
              <p className="text-red-600 mb-4">{errorMessage}</p>
            </div>
            {retryCount < maxRetries && (
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleRetryJoin}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Retry ({maxRetries - retryCount} attempts left)
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Refresh Page
                </button>
              </div>
            )}
          </div>
        );

      case "joined":
      case "joined":
        const meetingDetails = extractMeetingDetails(meetingUrl);
        const embedUrl = isHost ? meetingUrl : buildEmbedUrl(meetingDetails);

        return (
          <div className="bg-white rounded-lg shadow-sm border">
            <div
              className="relative"
              style={{ paddingBottom: "56.25%", height: 0 }}
            >
              <iframe
                src={embedUrl}
                className="absolute top-0 left-0 w-full h-full"
                style={{ border: 0, minHeight: "500px" }}
                allow="microphone; camera; fullscreen"
                sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
                title="Zoom Meeting"
                // onLoad={() => console.log("Zoom iframe loaded")}
                // onError={() => {
                //   console.error("Zoom iframe failed to load");
                //   setMeetingStatus("error");
                //   setErrorMessage("Failed to load meeting. Please try again.");
                // }}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <div className="p-4 border-b">
        {/* <h3 className="text-lg font-semibold text-gray-900">
          Zoom Meeting Integration
        </h3> */}
        {meetingDetails && (
          <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-600">
              Meeting ID: {meetingDetails.meetingId}
            </p>
            {/* {meetingDetails.password && (
              <p className="text-sm text-gray-600">
                Password: {meetingDetails.password}
              </p>
            )} */}
            <p className="text-sm text-gray-500">
              Role: {isHost ? "Host" : "Student"}
            </p>
          </div>
        )}
      </div>

      {/* Status-based content */}
      {renderMeetingStatus()}
    </div>
  );
};

export default ZoomEmbed;
