"use client";
import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  User,
  BookOpen,
  PlusSquare,
  Video,
  GraduationCap,
  ClipboardList,
  BarChart3,
  Award,
  Users,
  Wallet,
  CreditCard,
  Receipt,
  Download,
  Settings,
  LogOut,
} from "lucide-react";
import useAuthStore from "@/store/authStore";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();

  
  const mainMenuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      color: "text-gray-500",
      href: "/dashboard/instructor",
    },
    // {
    //   id: "profile",
    //   label: "My Profile",
    //   icon: User,
    //   color: "text-gray-600",
    //   href: "/dashboard/instructor/profile",
    // },
    {
      id: "courses",
      label: "Courses",
      icon: BookOpen,
      color: "text-gray-600",
      href: "/dashboard/instructor/courses",
    },
    {
      id: "add-course",
      label: "Add New Course",
      icon: PlusSquare,
      color: "text-gray-600",
      href: "/dashboard/instructor/add-course",
    },
    {
      id: "live",
      label: "Live Classes",
      icon: Video,
      color: "text-gray-600",
      href: "/dashboard/instructor/live-classes",
    },
    // {
    //   id: "students",
    //   label: "Students",
    //   icon: GraduationCap,
    //   color: "text-gray-600",
    //   href: "/dashboard/instructor/students",
    // },
    // {
    //   id: "mcqsQuiz",
    //   label: "MCQs Quiz",
    //   icon: ClipboardList,
    //   color: "text-gray-600",
    //   href: "/dashboard/instructor/mcqs-quiz",
    // },
    // {
    //   id: "quiz-results",
    //   label: "Quiz Results",
    //   icon: BarChart3,
    //   color: "text-gray-600",
    //   href: "/dashboard/instructor/quiz-results",
    // },
    // {
    //   id: "certificates",
    //   label: "My Certificates",
    //   icon: Award,
    //   color: "text-gray-600",
    //   href: "/dashboard/instructor/certificates",
    // },
    // {
    //   id: "referrals",
    //   label: "Referrals",
    //   icon: Users,
    //   color: "text-gray-600",
    //   href: "/dashboard/instructor/referrals",
    // },
    {
      id: "earnings",
      label: "Earnings",
      icon: Wallet,
      color: "text-gray-600",
      href: "/dashboard/instructor/earnings",
    },
    {
      id: "payouts",
      label: "Payouts",
      icon: CreditCard,
      color: "text-gray-600",
      href: "/dashboard/instructor/payouts",
    },
    // {
    //   id: "statements",
    //   label: "Statements",
    //   icon: Receipt,
    //   color: "text-gray-600",
    //   href: "/dashboard/instructor/statements",
    // },

  ];

  const accountItems = [
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      color: "text-gray-600",
      href: "/dashboard/instructor/settings",
    },
    {
      id: "logout",
      label: "Logout",
      icon: LogOut,
      color: "text-gray-600",
      href: null,
    },
  ];
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Get current page title based on pathname
  const getCurrentPageTitle = () => {
    const currentItem = [...mainMenuItems, ...accountItems].find(
      (item) => item.href === pathname
    );
    return currentItem?.label || "Dashboard";
  };

  return (
    <div className="pt-16 flex flex-col min-h-screen">
      <Navbar isAuthenticated={true} />
      {/* <Header title={getCurrentPageTitle()} pageName={getCurrentPageTitle()} /> */}
      <div className="flex max-w-[1440px] mx-auto w-full min-h-screen mt-10 ">
        {/* Sidebar */}
        <div
          className="hidden lg:flex lg:static inset-y-0 left-0 z-50 w-1/5 bg-white border border-[var(--gray-100)] flex-col"
        >
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
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.id}>
                        <Link
                          href={item.label === "Referrals" ? "#" : item.href}
                          className={`
                          w-full flex items-center space-x-3 p-2 text-left cursor-pointer
                          transition-colors duration-200 rounded-md
                          ${
                            isActive
                              ? "text-[var(--rose-500)]"
                              : "text-gray-700 hover:bg-gray-50"
                          }
                          ${
                            item.label === "Referrals"
                              ? "cursor-not-allowed opacity-60"
                              : "cursor-pointer"
                          }
                          `}
                        >
                          <IconComponent
                            size={16}
                            className={isActive ? "text-pink-500" : item.color}
                          />
                          <span className="text-sm">{item.label}</span>
                          {item.label === "Referrals" && (
                            <span className="ml-2 text-sm italic">Coming soon...</span>
                          )}
                        </Link>
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
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.id}>
                        {item.id === "logout" ? (
                          <button
                            onClick={handleLogout}
                            className={`cursor-pointer
                            w-full flex items-center space-x-3 p-2 text-left
                            transition-colors duration-200 rounded-md
                            text-[var(--gray-600)] hover:bg-gray-50
                          `}
                          >
                            <IconComponent
                              size={16}
                              className={item.color}
                            />
                            <span className="text-sm">{item.label}</span>
                          </button>
                        ) : (
                          <Link
                            href={item.href}
                            className={`cursor-pointer
                            w-full flex items-center space-x-3 p-2 text-left
                            transition-colors duration-200 rounded-md
                            ${
                              isActive
                                ? "text-pink-600"
                                : "text-[var(--gray-600)] hover:bg-gray-50"
                            }
                          `}
                          >
                            <IconComponent
                              size={16}
                              className={isActive ? "text-pink-500" : item.color}
                            />
                            <span className="text-sm">{item.label}</span>
                          </Link>
                        )}
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
          {/* Main Content */}
          <main className="flex-1 mt-5 lg:mt-0">{children}</main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
