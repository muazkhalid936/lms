"use client";
import EarningsChart from "@/components/dashboard/instructor/EarningsChart";
import InstructorStats from "@/components/dashboard/instructor/InstructorStats";
import React, { useState, useEffect } from "react";
import Pagination from "@/components/common/Pagination";
import toast from "react-hot-toast";
import InstructorService from "@/lib/services/instructorService";
import EarningsService from "@/lib/services/earningsService";

const TableRow = ({ earning }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <tr className="border-b last:border-b-0">
      <td className="py-4 px-4 text-sm text-[var(--gray-700)]">
        #{earning.transactionId?.slice(-8) || earning._id?.slice(-8)}
      </td>
      <td className="py-4 px-4 text-sm text-[var(--gray-600)]">
        {formatDate(earning.createdAt)}
      </td>
      <td className="py-4 px-4 text-sm text-[var(--gray-700)]">
        {earning.course?.courseTitle || 'Course Purchase'}
      </td>
      <td className="py-4 px-4 text-sm text-[var(--gray-700)] text-right">
        {formatCurrency(earning.instructorEarnings)}
      </td>
    </tr>
  );
};

export default function page() {
  const [page, setPage] = useState(1);
  const [earnings, setEarnings] = useState([]);
  const [pagination, setPagination] = useState({});
  const [earningsLoading, setEarningsLoading] = useState(true);
  const [earningsError, setEarningsError] = useState(null);
  const itemsPerPage = 10;

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
    fetchEarnings();
  }, [page]);

  const fetchEarnings = async () => {
    try {
      setEarningsLoading(true);
      setEarningsError(null);

      const response = await EarningsService.getInstructorEarnings({
        page: page,
        limit: itemsPerPage
      });

      if (response.success) {
        setEarnings(response.data.earnings || []);
        setPagination(response.data.pagination || {});
      } else {
        throw new Error(response.message || "Failed to fetch earnings");
      }
    } catch (error) {
      console.error("Error fetching earnings:", error);
      setEarningsError(error.message);
      toast.error("Failed to load earnings data");
      setEarnings([]);
    } finally {
      setEarningsLoading(false);
    }
  };

  const fetchInstructorStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await InstructorService.getInstructorStats();
console.log(response)
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
    <div className="mx-auto px-6 pb-6 bg-white">
      <h1 className="text-[20px] border-b border-[var(--gray-100)] pb-4 font-bold text-[var(--gray-900)] mb-8">
        Earnings
      </h1>

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

      {/* Earnings table */}
      <div className="border border-[var(--gray-100)] rounded-[10px] p-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-semibold text-[var(--gray-900)]">
            Earnings
          </h2>
          <input
            type="text"
            readOnly
            className="border rounded px-3 py-2 text-sm text-[var(--gray-600)]"
            value="09/12/2025 - 09/18/2025"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-[var(--gray-50)]">
                <th className="text-left py-3 px-4 text-sm text-[var(--gray-600)]">
                  OrderID
                </th>
                <th className="text-left py-3 px-4 text-sm text-[var(--gray-600)]">
                  Date
                </th>
                <th className="text-left py-3 px-4 text-sm text-[var(--gray-600)]">
                  Course
                </th>
                <th className="text-right py-3 px-4 text-sm text-[var(--gray-600)]">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white rounded-b overflow-hidden">
              {earningsLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="border-b animate-pulse">
                    <td className="py-4 px-4">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-gray-200 rounded w-48"></div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : earningsError ? (
                <tr>
                  <td colSpan="4" className="py-8 px-4 text-center text-red-600">
                    Error loading earnings: {earningsError}
                  </td>
                </tr>
              ) : earnings.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 px-4 text-center text-gray-500">
                    No earnings data available yet. Start selling courses to see your earnings here!
                  </td>
                </tr>
              ) : (
                earnings.map((earning) => (
                  <TableRow
                    key={earning._id}
                    earning={earning}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <Pagination
            totalItems={pagination.totalItems || 0}
            itemsPerPage={itemsPerPage}
            currentPage={page}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
