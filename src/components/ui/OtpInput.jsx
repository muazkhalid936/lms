"use client";
import React, { useRef } from "react";

const OtpInput = ({ length, onChange, isError,isPassReset }) => {
  const inputs = useRef([]);

  const handleChange = (e, index) => {
    const value = e.target.value;

    if (!/^\d*$/.test(value)) return;

    e.target.value = value.slice(0, 1);

    if (value && index < length - 1) {
      inputs.current[index + 1].focus();
    }

    const otpValue = inputs.current.map(input => input.value).join("");
    onChange(otpValue);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputs.current[index - 1].focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputs.current[index - 1].focus();
    }
    if (e.key === "ArrowRight" && index < length - 1) {
      inputs.current[index + 1].focus();
    }
  };

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          maxLength={1}
          className={`w-[40px] h-[40px] sm:w-[76px] sm:h-[74px] font-medium text-center border rounded-md text-[24px] focus:outline-none focus:ring-2 ${
            isError
              ? "border-red-500 focus:ring-red-400"
              : "border-gray-300 focus:ring-[var(--indigo-900)]"
          }`}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          ref={(el) => (inputs.current[index] = el)}
        />
      ))}
    </div>
  );
};

export default OtpInput;
