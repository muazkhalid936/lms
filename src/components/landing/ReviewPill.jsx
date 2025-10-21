import React from "react";
import { FaStar } from "react-icons/fa6";

const EmptyCircle = () => (
  <div className="h-8 w-8 rounded-full border border-gray-300 bg-white" />
);

const ReviewPill = () => {
  return (
    <div className="inline-flex items-center space-x-2 bg-[#FFDAE0] rounded-full px-2 py-1">
      <div className="flex -space-x-3">
        <EmptyCircle />
        <EmptyCircle />
        <EmptyCircle />
        <EmptyCircle />
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex text-[#FFB54A] text-[14px] items-center space-x-1">
          <FaStar />
          <FaStar />
          <FaStar />
          <FaStar />
          <FaStar />
        </div>

        <span className=" text-sm font-normal text-gray-900">15k+ reviews</span>
      </div>
    </div>
  );
};

export default ReviewPill;
