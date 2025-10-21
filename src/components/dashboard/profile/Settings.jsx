"use client"
import { useState } from "react";
import { Eye, EyeOff, Calendar } from "lucide-react";
import EditProfileSection from "./EditProfileSection";
import SecuritySection from "./SecuritySection";

function Settings() {
  const [activeTab, setActiveTab] = useState("edit-profile");

  return (
    <div className="min-h-screen px-6 pb-6">
      <div className="mx-auto">
        <h1 className="text-[20px] border-b border-[var(--gray-100)] pb-4 font-bold text-gray-900 mb-8">Settings</h1>

        {/* Tabs */}
        <div className="bg-[var(--gray-25)] border border-[var(--gray-100)] rounded-lg mb-8">
          <div className="flex">
            <button
              onClick={() => setActiveTab("edit-profile")}
              className={`flex-1 px-6 py-4 cursor-pointer text-center transition-colors text-[16px] relative ${
                activeTab === "edit-profile"
                  ? "text-[var(--rose-500)]"
                  : "text-[var(--gray-600)] hover:text-gray-700"
              }`}
            >
              Edit Profile
              {activeTab === "edit-profile" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`flex-1 px-6 py-4 cursor-pointer text-center text-[16px] transition-colors relative ${
                activeTab === "security"
                  ? "text-[var(--rose-500)]"
                  : "text-[var(--gray-600)] hover:text-gray-700"
              }`}
            >
              Security
              {activeTab === "security" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"></div>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white">
          {activeTab === "edit-profile" ? (
            <EditProfileSection />
          ) : (
            <SecuritySection />
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
