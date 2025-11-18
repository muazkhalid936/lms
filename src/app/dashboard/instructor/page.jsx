"use client";
import EarningsChart from "@/components/dashboard/instructor/EarningsChart";
import InstructorStats from "@/components/dashboard/instructor/InstructorStats";
import InstructorEarnings from "@/components/dashboard/instructor/InstructorEarnings";
import CoursesTable from "@/components/dashboard/instructor/CoursesTable";
import React, { useState, useEffect } from "react";
import AllCourses from "@/components/dashboard/instructor/AllCourses";
import InstructorService from "@/lib/services/instructorService";
import toast from "react-hot-toast";

const page = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalEarnings: 0,
  });
  const [earningsData, setEarningsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInstructorStats();
  }, []);

  const fetchInstructorStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await InstructorService.getInstructorStats();

      if (response.success) {
        // Set stats for InstructorStats component
        setStats({
          totalStudents: response.data.totalStudents,
          totalCourses: response.data.totalCourses,
          totalEarnings: response.data.totalEarnings,
        });

        // Set earnings data for EarningsChart component
        if (response.data.monthlyEarnings) {
          const chartData = response.data.monthlyEarnings.map(item => ({
            month: item.month.split(' ')[0], // Get short month name
            earnings: item.earnings,
            fullMonth: item.month,
            enrollments: item.enrollments
          }));
          setEarningsData(chartData);
        } else {
          setEarningsData([]);
        }
      } else {
        throw new Error(response.message || "Failed to fetch stats");
      }
    } catch (error) {
      console.error("Error fetching instructor stats:", error);
      setError(error.message);
      toast.error("Failed to load instructor statistics");

      // Fallback to default values in case of error
      setStats({
        totalStudents: 0,
        totalCourses: 0,
        totalEarnings: 0,
      });
      setEarningsData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:pt-0">
      <InstructorStats
        totalStudents={stats.totalStudents}
        totalCourses={stats.totalCourses}
        totalEarnings={stats.totalEarnings}
        loading={loading}
        error={error}
      />

      <div className="mt-5">
        <EarningsChart 
          data={earningsData}
          loading={loading}
          error={error}
        />
      </div>

      {/* <div className="mt-5">
        <InstructorEarnings />
      </div> */}
      <div className="mt-5">
        <h2 className="font-bold text-[20px] text-[var(--gray-900)] pb-4">
          Courses
        </h2>
        <AllCourses />
      </div>
    </div>
  );
};

export default page;
