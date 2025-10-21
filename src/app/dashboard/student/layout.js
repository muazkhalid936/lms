"use client";
import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Video,
  Award,
  Star,
  ShoppingBag,
  Users,
    X,
  Menu,
  Search,
  Settings,
  LogOut,
} from "lucide-react";
import { GoBook } from "react-icons/go";


import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import useAuthStore from "@/store/authStore";

export default function DashboardLayout({ children }) {
  const { loading, error, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const mainMenuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      color: "text-gray-500",
      href: "/dashboard/student",
    },
    {
      id: "explore",
      label: "Explore",
      icon: Search,
      color: "text-gray-600",
      href: "/dashboard/student/explore",
    },
    {
      id: "course",
      label: "Courses",
      icon: GoBook,
      color: "text-gray-600",
      href: "/dashboard/student/courses",
    },
    {
      id: "live",
      label: "Live Classes",
      icon: Video,
      color: "text-gray-600",
      href: "/dashboard/student/live-classes",
    },
    {
      id: "certificates",
      label: "Certificates",
      icon: Award,
      color: "text-gray-600",
      href: "/dashboard/student/certificates",
    },
    // {
    //   id: "reviews",
    //   label: "Reviews",
    //   icon: Star,
    //   color: "text-gray-600",
    //   href: "/dashboard/student/reviews",
    // },
    {
      id: "orders",
      label: "Order History",
      icon: ShoppingBag,
      color: "text-gray-600",
      href: "/dashboard/student/orders",
    },
    {
      id: "referrals",
      label: "Referrals",
      icon: Users,
      color: "text-gray-600",
      href: "/dashboard/student/referrals",
    },
  ];

  const accountItems = [
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      color: "text-gray-600",
      href: "/dashboard/student/settings",
    },
    {
      id: "logout",
      label: "Logout",
      icon: LogOut,
      color: "text-gray-600",
      href: null,
    },
  ];

  const getCurrentPageTitle = () => {
    const currentItem = [...mainMenuItems, ...accountItems].find(
      (item) => item.href === pathname
    );
    return currentItem?.label || "Dashboard";
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="pt-16 flex flex-col min-h-screen">
      <Navbar />
      <div className="flex p-0 max-w-[1440px] px-5 sm:px-10 mx-auto w-full lg:p-8">
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
                            w-full flex items-center space-x-3 p-2 text-left
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
                          <span className="text-sm">
                            {item.label}
                            {item.label === "Referrals" && (
                              <span className="ml-2 italic">
                                Coming soon...
                              </span>
                            )}
                          </span>
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
                    const isLogout = item.id === "logout";

                    if (isLogout) {
                      return (
                        <li key={item.id}>
                          <button
                            onClick={handleLogout}
                            disabled={loading}
                            className={`cursor-pointer
                              w-full flex items-center space-x-3 p-2 text-left
                              transition-colors duration-200 rounded-md
                              text-[var(--gray-600)] hover:bg-gray-50
                              disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                          >
                            <IconComponent size={16} className={item.color} />
                            <span className="text-sm">
                              {loading ? "Logging out..." : item.label}
                            </span>
                          </button>
                        </li>
                      );
                    }

                    return (
                      <li key={item.id}>
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
