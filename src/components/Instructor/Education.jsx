"use client";
import React from "react";
import dayjs from "dayjs";

const Education = ({ instructor }) => {

  const calculateDuration = (fromDate, toDate) => {
    const start = dayjs(fromDate);
    const end = dayjs(toDate);
    const years = end.diff(start, 'year');
    return years;
  };
  return (
    <div className="rounded-[10px] border border-[#e7e7e7] p-6">
      <p className="text-[20px] font-bold mb-6">Education</p>

      <div className="relative flex flex-col gap-8 pl-6">
        {/* Vertical line */}
        <div className="absolute left-[10px] top-0 bottom-0 w-[2px] bg-gray-200"></div>

        {instructor.education.map((edu, index) => (
          <div key={index} className="relative">
            {/* Dot */}
            <div className="absolute -left-[21px] top-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>

            {/* Text */}
            <div className="flex flex-col">
              <p className="font-semibold">{edu.degree}</p>
              <p className="text-gray-600 text-sm">
                {edu.university} - {dayjs(edu.fromDate).format('YYYY')} - {dayjs(edu.toDate).format('YYYY')} ({calculateDuration(edu.fromDate, edu.toDate)} years)
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Education;
