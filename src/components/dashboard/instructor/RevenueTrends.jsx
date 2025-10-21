"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export default function RevenueTrends() {
  // Data shaped to match the visual rhythm in the mock
  const data = [
    { month: "Jan", students: 0, instructors: 0 },
    { month: "Feb", students: 42, instructors: 110 },
    { month: "Mar", students: 28, instructors: 75 },
    { month: "Apr", students: 80, instructors: 42 },
    { month: "May", students: 120, instructors: 30 },
    { month: "Jun", students: 60, instructors: 55 },
    { month: "Jul", students: 65, instructors: 100 },
    { month: "Aug", students: 50, instructors: 70 },
    { month: "Sep", students: 78, instructors: 95 },
    { month: "Oct", students: 135, instructors: 40 },
    { month: "Nov", students: 95, instructors: 58 },
    { month: "Dec", students: 60, instructors: 100 },
  ];

  const pink = "#ff4d73"; // Students
  const indigo = "#1f1b58"; // Instructors (deep indigo)
  const grid = "#eae9ee"; // subtle gridlines

  return (
    <div className="w-full rounded-2xl bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Revenue Trends</h2>
        <div className="flex items-center gap-6 text-base">
          <span className="inline-flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ background: pink }}
              aria-hidden
            />
            <span className="text-neutral-700">Students</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ background: indigo }}
              aria-hidden
            />
            <span className="text-neutral-700">Instructors</span>
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[380px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
            {/* Background grid */}
            <CartesianGrid stroke={grid} vertical={false} />

            {/* X & Y axis (minimal style to match mock) */}
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#6b7280", fontSize: 14 }}
              interval={0}
            />
            <YAxis hide domain={[0, 140]} />

            {/* Gradients for soft fills */}
            <defs>
              <linearGradient id="gradPink" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={pink} stopOpacity={0.35} />
                <stop offset="100%" stopColor={pink} stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="gradIndigo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={indigo} stopOpacity={0.25} />
                <stop offset="100%" stopColor={indigo} stopOpacity={0.06} />
              </linearGradient>
            </defs>

            {/* Instructors area (under) */}
            <Area
              type="monotone"
              dataKey="instructors"
              stroke={indigo}
              strokeWidth={3}
              fill="url(#gradIndigo)"
              dot={{ r: 5, stroke: indigo, strokeWidth: 3, fill: "#ffffff" }}
              activeDot={{ r: 6 }}
              isAnimationActive={true}
            />

            {/* Students area (above) */}
            <Area
              type="monotone"
              dataKey="students"
              stroke={pink}
              strokeWidth={3}
              fill="url(#gradPink)"
              dot={{ r: 5, stroke: pink, strokeWidth: 3, fill: "#ffffff" }}
              activeDot={{ r: 6 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
