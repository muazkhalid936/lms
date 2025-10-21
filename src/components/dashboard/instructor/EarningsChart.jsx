"use client";
import React, { useState, useEffect } from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import InstructorService from "@/lib/services/instructorService";
import toast from "react-hot-toast";

const EarningsChart = () => {
  const [hoveredBar, setHoveredBar] = useState(null);
  const [selectedRange, setSelectedRange] = useState("Last 12 Months");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const dateRangeOptions = [
    "Today",
    "Yesterday",
    "Last 7 Days",
    "Last 30 Days",
    "Last 12 Months",
    "This Month",
    "Last Month",
    "Custom Range",
  ];

  useEffect(() => {
    fetchEarningsData();
  }, []);

  const fetchEarningsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await InstructorService.getInstructorStats();
      
      if (response.success && response.data.monthlyEarnings) {
        // Transform the data for chart display
        const chartData = response.data.monthlyEarnings.map(item => ({
          month: item.month.split(' ')[0], // Get short month name
          earnings: item.earnings,
          fullMonth: item.month,
          enrollments: item.enrollments
        }));
        
        setData(chartData);
      } else {
        throw new Error('Failed to fetch earnings data');
      }
    } catch (error) {
      console.error('Error fetching earnings data:', error);
      setError(error.message);
      toast.error('Failed to load earnings chart');
      
      // Fallback to empty data
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // If no data or all earnings are 0, show a different maxEarnings
  const maxEarnings = data.length > 0 ? Math.max(...data.map((d) => d.earnings), 100) : 100;
  const chartHeight = 300;
  const barWidth = 60;
  const chartWidth = Math.max(data.length * (barWidth + 20) - 20, 800);

  const handleRangeSelect = (range) => {
    setSelectedRange(range);
    setShowDropdown(false);

    if (range === "Custom Range") {
      setShowCalendar(true);
    } else {
      setShowCalendar(false);
    }
  };

  // Generate grid values based on maxEarnings
  const getGridValues = () => {
    const max = Math.ceil(maxEarnings);
    const step = Math.ceil(max / 6);
    return Array.from({ length: 7 }, (_, i) => i * step);
  };

  const gridValues = getGridValues();

  if (loading) {
    return (
      <div className="w-full max-w-[1440px] mx-auto p-6 bg-white rounded-lg border border-[var(--gray-100)]">
        <div className="flex justify-between items-center mb-8 border-b border-[var(--gray-100)] pb-4">
          <h1 className="text-[20px] font-bold text-gray-800">
            Earnings by Month
          </h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading earnings data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-[1440px] mx-auto p-6 bg-white rounded-lg border border-[var(--gray-100)]">
        <div className="flex justify-between items-center mb-8 border-b border-[var(--gray-100)] pb-4">
          <h1 className="text-[20px] font-bold text-gray-800">
            Earnings by Month
          </h1>
        </div>
        <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg">
          <div className="text-center">
            <div className="text-red-600 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-800 font-medium">Failed to load earnings chart</p>
            <p className="text-red-600 text-sm">{error}</p>
            <button 
              onClick={fetchEarningsData}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full max-w-[1440px] mx-auto p-6 bg-white rounded-lg border border-[var(--gray-100)]">
        <div className="flex justify-between items-center mb-8 border-b border-[var(--gray-100)] pb-4">
          <h1 className="text-[20px] font-bold text-gray-800">
            Earnings by Month
          </h1>
        </div>
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">No earnings data available</p>
            <p className="text-gray-500 text-sm">Start creating courses to see your earnings here</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto p-6 bg-white rounded-lg border border-[var(--gray-100)]">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-[var(--gray-100)] pb-4">
        <h1 className="text-[20px] font-bold text-gray-800">
          Earnings by Month
        </h1>
        <div className="text-sm text-gray-600">
          Total: ${data.reduce((sum, item) => sum + item.earnings, 0).toFixed(2)}
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative overflow-x-auto">
        <div
          className="relative"
          style={{ width: chartWidth + 100, height: chartHeight + 80 }}
        >
          {/* Grid Lines */}
          {gridValues.map((value) => (
            <div
              key={value}
              className="absolute flex items-center w-full"
              style={{
                top: chartHeight - (value / maxEarnings) * chartHeight + 20,
              }}
            >
              {/* Number label on the left */}
              <span className="text-xs text-gray-700 font-medium w-12 text-right mr-2">
                ${value}
              </span>

              {/* Line starts after the label */}
              <div className="flex-1 border-t border-gray-200 border-dashed"></div>
            </div>
          ))}

          {/* Bars */}
          {data.map((item, index) => {
            const barHeight = maxEarnings > 0 
              ? (item.earnings / maxEarnings) * (chartHeight - 40)
              : 0;
            const isHovered = hoveredBar === index;

            return (
              <div
                key={item.month}
                className="absolute cursor-pointer transition-all duration-200 ease-out"
                style={{
                  left: index * (barWidth + 20) + 50,
                  bottom: 46,
                  width: barWidth,
                  height: Math.max(barHeight + 20, 20),
                }}
                onMouseEnter={() => setHoveredBar(index)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg z-10 whitespace-nowrap">
                    <div className="text-center">
                      <div className="font-semibold">{item.fullMonth}</div>
                      <div className="text-blue-300">${item.earnings.toFixed(2)}</div>
                      <div className="text-gray-300 text-xs">{item.enrollments} enrollments</div>
                    </div>
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                )}

                {/* Bar */}
                <div
                  className={`w-full rounded-t-lg transition-all duration-300 ease-out ${
                    isHovered
                      ? "bg-blue-600 shadow-lg transform scale-105"
                      : "bg-blue-500 hover:bg-blue-600"
                  } ${barHeight < 10 ? "bg-gray-300" : ""}`}
                  style={{ height: Math.max(barHeight + 15, 15) }}
                />

                {/* Month Label */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-600">
                  {item.month}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EarningsChart;
