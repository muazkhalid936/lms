import React from "react";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import { FaLink } from "react-icons/fa";

const LiveClassItem = ({ liveClass, onJoinClass, isCopyLink, isDateAndTime = false }) => {
  const { id, title, description, date, time } = liveClass;

  return (
    <div className="bg-white border-b border-[var(--gray-100)] py-6 flex items-center justify-between group">
      {/* Left side - Class info */}
      <div className="flex-1">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-3">{description}</p>
      </div>

      {/* Center - Date and Time columns */}
      {isDateAndTime && (
        <div className="flex items-center gap-10 text-sm text-gray-600 mr-20">
          <div className="flex items-center justify-center min-w-[80px]">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{date}</span>
          </div>
          <div className="flex items-center justify-center min-w-[80px]">
            <Clock className="w-4 h-4 mr-2" />
            <span>{time}</span>
          </div>
        </div>
      )}

      {/* Right side - Action button */}
      <div className="flex-shrink-0">
        {!isCopyLink ? (
          <button
            onClick={() => onJoinClass(id)}
            className="bg-gray-900 hover:bg-gray-800 text-white rounded-full p-3 transition-colors duration-200 group-hover:scale-105 transform"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <FaLink />
        )}
      </div>
    </div>
  );
};

export default LiveClassItem;