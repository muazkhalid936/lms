"use client";
import React from "react";
import { Check, AlertCircle, User } from "lucide-react";

const ZoomAccountStatus = ({ meetingData, user }) => {
  // Don't show for students
  if (!user || user.userType !== "Instructor") {
    return null;
  }

  // Check if current user is the instructor for this meeting
  const isCurrentUserInstructor = meetingData?.instructor && 
    (meetingData.instructor._id === user._id || meetingData.instructor === user._id);

  if (!isCurrentUserInstructor) {
    return null;
  }

  // Check if instructor has Zoom integration
  const hasZoomIntegration = user.zoomIntegration && 
    user.zoomIntegration.accessToken && 
    new Date(user.zoomIntegration.expiresAt) > new Date();

  return (
    <div className="mb-4 p-3 rounded-lg border">
      <div className="flex items-center space-x-2">
        <User className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-gray-900">Meeting Host Status</span>
      </div>
      
      <div className="mt-2">
        {hasZoomIntegration ? (
          <div className="flex items-center space-x-2 text-green-700 bg-green-50 p-2 rounded">
            <Check className="w-4 h-4" />
            <span className="text-sm">
              Hosting with your Zoom account ({user.zoomIntegration.zoomDisplayName})
            </span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-amber-700 bg-amber-50 p-2 rounded">
            <AlertCircle className="w-4 h-4" />
            <div className="text-sm">
              <p>Using system Zoom account</p>
              <p className="text-xs mt-1">
                <a 
                  href="/dashboard/instructor/settings?tab=zoom" 
                  className="text-blue-600 hover:underline"
                >
                  Connect your Zoom account
                </a> to appear as the meeting host
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZoomAccountStatus;