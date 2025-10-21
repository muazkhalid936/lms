"use client";
import AllCourses from "@/components/dashboard/instructor/AllCourses";
import React, { useState, useEffect } from "react";
import { Grid, List, RefreshCw } from "lucide-react";
import CourseStats from "@/components/dashboard/instructor/CourseStats";
import InstructorService from "@/lib/services/instructorService";
import toast from "react-hot-toast";

const page = () => {
  const [viewMode, setViewMode] = useState("list");
  const [courseStats, setCourseStats] = useState({
    totalCourses: 0,
    freeCourses: 0,
    paidCourses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourseStats();
  }, []);

  const fetchCourseStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await InstructorService.getInstructorCourseStats();

      if (response.success) {
        const { summary } = response.data;

        setCourseStats({
          totalCourses: summary.totalCourses || 0,
          freeCourses: summary.freeCourses || 0,
          paidCourses: summary.paidCourses || 0,
        });
      } else {
        throw new Error(response.message || "Failed to fetch course stats");
      }
    } catch (error) {
      console.error("Error fetching course stats:", error);
      setError(error.message);
      toast.error("Failed to load course statistics");

      setCourseStats({
        totalCourses: 0,
        freeCourses: 0,
        paidCourses: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:pt-0">
      <CourseStats
        allCourses={courseStats.totalCourses}
        freeCourses={courseStats.freeCourses}
        paidCourses={courseStats.paidCourses}
        loading={loading}
        error={error}
      />
      <div className="mt-5">
        <div className="border-b border-[var(--gray-100)] pb-4 flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-[20px] font-bold text-gray-900">Courses</h1>
            <button
              onClick={fetchCourseStats}
              disabled={loading}
              className={`p-2 rounded-lg transition-colors ${
                loading
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title="Refresh course statistics"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 cursor-pointer rounded-lg ${
                viewMode === "list"
                  ? "bg-[var(--rose-500)] text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <List size={20} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 cursor-pointer rounded-lg ${
                viewMode === "grid"
                  ? "bg-[var(--rose-500)] text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <Grid size={20} />
            </button>
          </div>
        </div>
        <AllCourses viewMode={viewMode} onStatsChange={fetchCourseStats} />
      </div>
    </div>
  );
};

export default page;
