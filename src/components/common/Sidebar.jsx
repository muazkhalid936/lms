"use client"
import React, { useState } from "react";
import {
  Menu,
  X,
  User,
  BookOpen,
  Award,
  Heart,
  Star,
  HelpCircle,
  ShoppingCart,
  Users,
  MessageSquare,
  // Settings,
  LogOut,
} from "lucide-react";
import Home from "@/components/dashboard/Home";
import AllCourses from "@/components/dashboard/AllCourses";
import LiveClasses from "@/components/dashboard/LiveClasses";
import MCQsQuiz from "@/components/dashboard/MCQsQuiz";
import VideoCoursePlayer from "@/components/dashboard/VideoCoursePlayer";
import Referrals from "@/components/dashboard/Referrals";
import Wishlist from "@/components/dashboard/WishList";
import Certificates from "@/components/dashboard/Certificates";
import { sampleCertificates } from "@/data";
import OrderHistory from "@/components/dashboard/OrderHistory";
import Settings from "@/components/dashboard/profile/Settings";
import Profile from "@/components/dashboard/profile/Profile";
import Reviews from "@/components/dashboard/profile/Reviews";
import Header from "@/components/common/Header";

const Sidebar = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // const handleLogout = async () => {
  //   try {
  //     const res = await fetch("/api/auth/logout", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     });

  //     const data = await res.json();
  //     if (data.success) {
  //       window.location.href = "/auth/login";
  //     } else {
  //       alert("Logout failed: " + data.message);
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     alert("Something went wrong during logout.");
  //   }
  // };

  const mainMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: X, color: "text-gray-500" },
    { id: "profile", label: "My Profile", icon: User, color: "text-gray-600" },
    {
      id: "courses",
      label: "All Courses",
      icon: BookOpen,
      color: "text-gray-600",
    },
    {
      id: "live",
      label: "Live Classes",
      icon: BookOpen,
      color: "text-gray-600",
    },
    {
      id: "certificates",
      label: "My Certificates",
      icon: Award,
      color: "text-gray-600",
    },
    { id: "wishlist", label: "Wishlist", icon: Heart, color: "text-gray-600" },
    { id: "reviews", label: "Reviews", icon: Star, color: "text-gray-600" },
    {
      id: "mcqsQuiz",
      label: "MCQs Quiz",
      icon: ShoppingCart,
      color: "text-gray-600",
    },
    {
      id: "orders",
      label: "Order History",
      icon: ShoppingCart,
      color: "text-gray-600",
    },
    {
      id: "referrals",
      label: "Referrals",
      icon: Users,
      color: "text-gray-600",
    },
  ];

  const accountItems = [
    {
      id: "settings",
      label: "Settings",
      icon: HelpCircle,
      color: "text-gray-600",
    },
    { id: "logout", label: "Logout", icon: LogOut, color: "text-gray-600" },
  ];

  const renderContent = () => {
    if (activeSection === "courses") return <AllCourses />;
    // if (activeSection === "profile") return <CourseDetail />;
    if (activeSection === "profile") return <Profile />;
    if (activeSection === "live") return <LiveClasses />;
    if (activeSection === "certificates")
      return <Certificates certificates={sampleCertificates} />;
    if (activeSection === "wishlist") return <Wishlist />;
    if (activeSection === "reviews") return <Reviews />;
    if (activeSection === "mcqsQuiz") return <MCQsQuiz />;
    // if (activeSection === "quiz") return <VideoCoursePlayer />;
    if (activeSection === "orders") return <OrderHistory />;
    if (activeSection === "referrals") return <Referrals />;
    if (activeSection === "settings") return <Settings />;
    return <Home />;
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen p-0 lg:p-8">
      {/* Sidebar */}
      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-50 
        w-full lg:w-1/5 
        bg-white border border-[var(--gray-100)]
        transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 transition-transform duration-300 ease-in-out
        flex flex-col
        `}
      >
        {/* Sidebar Header */}
        <div className="lg:hidden flex items-center justify-end p-4 border-b border-gray-200">
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md hover:bg-gray-100"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Main Menu Section */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Main Menu
            </h3>
            <nav>
              <ul className="space-y-1">
                {mainMenuItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          setActiveSection(item.id);
                          setSidebarOpen(false);
                        }}
                        className={`
                          w-full flex items-center space-x-3 p-2 text-left cursor-pointer
                          transition-colors duration-200 rounded-md
                          ${
                            activeSection === item.id
                              ? " text-[var(--rose-500)]"
                              : "text-gray-700 hover:bg-gray-50"
                          }
                          `}
                      >
                        <IconComponent
                          size={16}
                          className={
                            activeSection === item.id
                              ? "text-pink-500"
                              : item.color
                          }
                        />
                        <span className="text-sm">{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Account Settings Section */}
          <div className="p-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Account Settings
            </h3>
            <nav>
              <ul className="space-y-1">
                {accountItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          setActiveSection(item.id);
                          setSidebarOpen(false);
                        }}
                        className={` cursor-pointer
                          w-full flex items-center space-x-3 p-2 text-left
                          transition-colors duration-200 rounded-md
                          ${
                            activeSection === item.id
                              ? "text-pink-600"
                              : "text-[var(--gray-600)] hover:bg-gray-50"
                          }
                        `}
                      >
                        <IconComponent
                          size={16}
                          className={
                            activeSection === item.id
                              ? "text-pink-500"
                              : item.color
                          }
                        />
                        <span className="text-sm">{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full lg:w-4/5 flex flex-col">
        {/* Top Navigation Bar (Mobile) */}
        <div className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between border-b border-gray-200">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <Menu size={20} className="text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            {[...mainMenuItems, ...accountItems].find(
              (item) => item.id === activeSection
            )?.label || "Dashboard"}
          </h1>
          <div className="w-8 h-8"></div> {/* Spacer for centering */}
        </div>

        {/* Main Content */}
        {/* overflow-y-auto  */}
        <main className="flex-1 mt-5 lg:mt-0">{renderContent()}</main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
};

export default Sidebar;
