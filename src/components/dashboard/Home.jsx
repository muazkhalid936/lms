"use client";

import React, { useState, useEffect } from "react";

import StudentStats from "./home/StudentStats";
import UpcomingClasses from "./home/UpcomingClasses";
import StudentStatsSkeleton from "./home/StudentStatsSkeleton";
import UpcomingClassesSkeleton from "./home/UpcomingClassesSkeleton";

const Home = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/dashboard");

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await response.json();
        console.log("Fetched dashboard data:", data);
        setDashboardData(data.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message);
        // Set fallback data in case of error
        setDashboardData({
          stats: {
            totalCourses: 0,
            activeCourses: 0,
            certificates: 0,
          },
          upcomingClasses: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (error && !dashboardData) {
    return (
      <div className="p-4 pt-0 mx-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-600">Error loading dashboard data: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  console.log(dashboardData?.stats?.totalCourses);
  return (
    <div className="p-4 pt-0 mx-4">
      {/* Student Stats Section */}
      {loading ? (
        <StudentStatsSkeleton />
      ) : (
        <StudentStats
          totalCourses={dashboardData?.stats?.totalCourses || 0}
          activeCourses={dashboardData?.stats?.activeCourses || 0}
          certificates={dashboardData?.stats?.certificates || 0}
        />
      )}

      {/* Upcoming Classes Section */}
      {loading ? (
        <UpcomingClassesSkeleton
          isTableHeader={true}
          tableHeading="Upcoming Live Classes"
        />
      ) : (
        dashboardData?.upcomingClasses.length > 0 && (
          <UpcomingClasses
            classes={dashboardData?.upcomingClasses || []}
            isDateAndTime={false}
            isTableHeader={true}
          />
        )
      )}
    </div>
  );
};

export default Home;
