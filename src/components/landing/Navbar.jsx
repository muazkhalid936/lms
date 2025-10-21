"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import useAuthStore from "@/store/authStore";
import {
  User,
  Lightbulb,
  ShoppingBag,
  MessageCircle,
  Settings,
  LogIn,
  LogOut,
  X,
  Menu,
  LayoutDashboard,
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
  Search,
} from "lucide-react";
import { GoBook } from "react-icons/go";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Become an Instructor", href: "/become-an-instructor" },
  { label: "Courses", href: "/courses" },
  { label: "Instructors", href: "/instructor" },
  { label: "Contact", href: "/contact-us" },
];

const instructorMenuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard/instructor",
  },
  {
    id: "courses",
    label: "Courses",
    icon: BookOpen,
    href: "/dashboard/instructor/courses",
  },
  {
    id: "add-course",
    label: "Add New Course",
    icon: PlusSquare,
    href: "/dashboard/instructor/add-course",
  },
  {
    id: "live",
    label: "Live Classes",
    icon: Video,
    href: "/dashboard/instructor/live-classes",
  },

  {
    id: "earnings",
    label: "Earnings",
    icon: Wallet,
    href: "/dashboard/instructor/earnings",
  },
  {
    id: "payouts",
    label: "Payouts",
    icon: CreditCard,
    href: "/dashboard/instructor/payouts",
  },

  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    href: "/dashboard/instructor/settings",
  },
];

const studentMenuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard/student",
  },
  {
    id: "explore",
    label: "Explore",
    icon: Search,
    href: "/dashboard/student/explore",
  },
  {
    id: "course",
    label: "Courses",
    icon: GoBook,
    href: "/dashboard/student/courses",
  },
  {
    id: "live",
    label: "Live Classes",
    icon: Video,
    href: "/dashboard/student/live-classes",
  },
  {
    id: "certificates",
    label: "Certificates",
    icon: Award,
    href: "/dashboard/student/certificates",
  },
  {
    id: "orders",
    label: "Order History",
    icon: ShoppingBag,
    href: "/dashboard/student/orders",
  },
  {
    id: "referrals",
    label: "Referrals",
    icon: Users,
    href: "/dashboard/student/referrals",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    href: "/dashboard/student/settings",
  },
];

const Navbar = () => {
  const { user, loading, fetchUser, logout } = useAuthStore();
  const isAuthenticated = !!user;
  const [open, setOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isDashboard = pathname.includes("dashboard");
  const isInstructorDashboard = pathname.startsWith("/dashboard/instructor");
  const isStudentDashboard = pathname.startsWith("/dashboard/student");

  useEffect(() => {
    fetchUser();
    const handleScroll = () => {
      if (window.scrollY > window.innerHeight * 0.01) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchUser]);

  const handleLogout = async () => {
    await logout();
    setProfileDropdownOpen(false);
    setOpen(false);
  };

  // Get dashboard link based on user type
  const getDashboardLink = () => {
    if (!user) return "/dashboard";
    return user.userType === "Instructor"
      ? "/dashboard/instructor"
      : "/dashboard/student";
  };

  // Get profile settings link based on user type
  const getProfileLink = () => {
    if (!user) return "/dashboard/student/profile";
    return user.userType === "Instructor"
      ? "/dashboard/instructor/profile"
      : "/dashboard/student/profile";
  };

  const getSettingsLink = () => {
    if (!user) return "/dashboard/student/settings";
    return user.userType === "Instructor"
      ? "/dashboard/instructor/settings"
      : "/dashboard/student/settings";
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${
        scrolled ? "bg-white shadow-md backdrop-blur-0" : "bg-transparent "
      }`}
    >
      <div className="max-w-[1440px] mx-auto flex items-center justify-between px-4 py-4 relative">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo/Logo.svg"
              alt="Dreams Logo"
              width={156}
              height={36}
              className="h-8 w-auto"
            />
          </Link>
        </div>

        {/* Desktop Nav */}
        {!isDashboard && (
          <nav className="hidden md:flex space-x-6 absolute left-1/2 transform -translate-x-1/2">
            {navLinks.map(({ label, href }) => {
              if (
                user?.userType === "Instructor" &&
                label === "Become an Instructor"
              ) {
                return null;
              }

              return (
                <Link
                  key={label}
                  href={href}
                  className={`text-sm font-medium transition-all duration-300 ${
                    scrolled
                      ? "text-gray-900 hover:text-rose-500"
                      : " hover:text-rose-300"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right side buttons */}
        <div className="ml-auto flex items-center space-x-3">
          {isAuthenticated ? (
            <div className="hidden md:flex gap-6">
              {/* Cart - Only show for students */}

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  className="flex items-center space-x-2"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                >
                  <Image
                    src={user?.avatar || "/dashboard/student/profileAvatar.png"}
                    alt="User Profile"
                    width={40}
                    height={40}
                    className="h-[36px] w-[36px] rounded-full cursor-pointer object-cover"
                    unoptimized
                  />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                    {/* User Info Header */}
                    <div className="p-4">
                      <div className="flex items-center space-x-3">
                        <Image
                          src={
                            user?.avatar ||
                            "/dashboard/student/profileAvatar.png"
                          }
                          alt="User Profile"
                          width={60}
                          height={60}
                          className="h-15 w-15 rounded-full object-cover"
                          unoptimized
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {user?.firstName && user?.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user?.userName || "User"}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {user?.email || "user@example.com"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2 border-y border-[var(--gray-100)]">
                      <Link
                        href={getProfileLink()}
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <User className="w-5 h-5 mr-3 text-gray-400" />
                        My Profile
                      </Link>

                      {user?.userType === "Student" && (
                        <>
                          {/* <Link
                            href="/dashboard/student/mcqs-quiz"
                            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setProfileDropdownOpen(false)}
                          >
                            <Lightbulb className="w-5 h-5 mr-3 text-gray-400" />
                            Quiz Attempts
                          </Link> */}

                          <Link
                            href="/dashboard/student/orders"
                            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setProfileDropdownOpen(false)}
                          >
                            <ShoppingBag className="w-5 h-5 mr-3 text-gray-400" />
                            Order History
                          </Link>
                        </>
                      )}

                      {user?.userType === "Instructor" && (
                        <Link
                          href="/dashboard/instructor/courses"
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <Lightbulb className="w-5 h-5 mr-3 text-gray-400" />
                          My Courses
                        </Link>
                      )}

                      {/* <Link
                        href="/dashboard/instructor/mcqs-quiz"
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors relative"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <MessageCircle className="w-5 h-5 mr-3 text-gray-400" />
                        Messages
                        <span className="ml-auto bg-[var(--indigo-900)] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          0
                        </span>
                      </Link> */}

                      <Link
                        href={getSettingsLink()}
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <Settings className="w-5 h-5 mr-3 text-gray-400" />
                        Settings
                      </Link>
                    </div>

                    {/* Switch Role & Logout */}
                    <div className="border-t border-gray-100 py-2">
                      {user?.userType === "Student" && (
                        <Link
                          href="/become-an-instructor"
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <LogIn className="w-5 h-5 mr-3 text-gray-400" />
                          Become an Instructor
                        </Link>
                      )}

                      <div className="px-4 pb-4">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center justify-center px-4 py-3 text-white bg-red-500 hover:bg-red-600 transition-colors rounded-full"
                        >
                          <LogOut className="w-5 h-5 mr-3" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="hidden md:inline-block px-4 py-2 rounded-full text-sm font-medium bg-[#342777] text-white"
              >
                Sign In
              </Link>

              <Link
                href="/auth/signup"
                className="hidden md:inline-block px-4 py-2 rounded-full text-sm font-medium bg-[#FF4667] text-white"
              >
                Register
              </Link>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 right-0 h-screen w-[300px] bg-white z-[9998] transform transition-transform duration-500 ease-in-out md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-6 space-y-6">
          <button
            onClick={() => setOpen(false)}
            className="self-end p-2 rounded-md hover:bg-gray-100"
          >
            <X className="h-6 w-6 text-gray-700" />
          </button>

          {/* User Info in Mobile */}
          {isAuthenticated && user && (
            <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
              <Image
                src={user?.avatar || "/dashboard/student/profileAvatar.png"}
                alt="User Profile"
                width={50}
                height={50}
                className="rounded-full object-cover"
                unoptimized
              />
              <div>
                <h3 className="font-semibold text-gray-900">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.name || "User"}
                </h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col space-y-4">
            {!isDashboard &&
              navLinks.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium text-gray-900 hover:text-rose-500 transition-colors"
                >
                  {label}
                </Link>
              ))}

            {isDashboard &&
              isInstructorDashboard &&
              instructorMenuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center space-x-3 text-lg font-medium transition-colors ${
                      isActive
                        ? "text-rose-500"
                        : "text-gray-900 hover:text-rose-500"
                    }`}
                  >
                    <IconComponent size={20} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

            {isDashboard &&
              isStudentDashboard &&
              studentMenuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center space-x-3 text-lg font-medium transition-colors ${
                      isActive
                        ? "text-rose-500"
                        : "text-gray-900 hover:text-rose-500"
                    }`}
                  >
                    <IconComponent size={20} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

            {isAuthenticated && (
              <>
                <Link
                  href={getProfileLink()}
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium text-gray-900 hover:text-rose-500 transition-colors"
                >
                  My Profile
                </Link>

                {user?.userType === "Student" && (
                  <>
                    <Link
                      href="/dashboard/student/mcqs-quiz"
                      onClick={() => setOpen(false)}
                      className="text-lg font-medium text-gray-900 hover:text-rose-500 transition-colors"
                    >
                      Quiz Attempts
                    </Link>
                    <Link
                      href="/dashboard/student/orders"
                      onClick={() => setOpen(false)}
                      className="text-lg font-medium text-gray-900 hover:text-rose-500 transition-colors"
                    >
                      Order History
                    </Link>
                  </>
                )}

                {user?.userType === "Instructor" && (
                  <Link
                    href="/dashboard/instructor/courses"
                    onClick={() => setOpen(false)}
                    className="text-lg font-medium text-gray-900 hover:text-rose-500 transition-colors"
                  >
                    My Courses
                  </Link>
                )}

                <Link
                  href="/dashboard/instructor"
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium text-gray-900 hover:text-rose-500 transition-colors"
                >
                  Messages
                </Link>

                <Link
                  href={getSettingsLink()}
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium text-gray-900 hover:text-rose-500 transition-colors"
                >
                  Settings
                </Link>
              </>
            )}
          </div>

          <div className="mt-auto flex flex-col space-y-3">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="w-full text-center px-4 py-3 bg-[#342777] text-white rounded-full"
                  onClick={() => setOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="w-full text-center px-4 py-3 bg-[#FF4667] text-white rounded-full"
                  onClick={() => setOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
