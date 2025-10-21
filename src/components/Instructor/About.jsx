"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

const AboutMe = ({ instructor }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-[10px] border border-[#e7e7e7] p-6 ">
      {/* Heading */}
      <h2 className="text-[20px] font-bold mb-3">About Me</h2>

      {/* Text */}
      <p className="text-gray-700 text-[15px] leading-relaxed">
        {instructor.bio.slice(0, 150)}...
        {expanded && <>{instructor.bio.slice(150)}</>}
      </p>

      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-4 text-[#ff4667] underline font-medium"
      >
        {expanded ? "Read Less" : "Read More"}
      </button>
    </div>
  );
};

export default AboutMe;
