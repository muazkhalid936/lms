"use client";
import React from "react";
import { Users, Heart } from "lucide-react";
import { useRouter } from "next/navigation";

const InstructorCard = ({ instr }) => {
  const router = useRouter();
  
  // Handle both API data structure and static data structure
  const instructorData = {
    id: instr._id || instr.id,
    name: instr.firstName ? `${instr.firstName} ${instr.lastName || ''}`.trim() : instr.name,
    role: instr.role || 'Instructor',
    avatar: instr.avatar || instr.image || '/dashboard/avatar.png',
    courses: instr.totalCourses || instr.courses || 0,
    students: instr.totalStudents || instr.students || 0
  };

  return (
    <div
      onClick={() => router.push(`/instructor/${instructorData.id}`)}
      className="bg-white h-[500px] hover:shadow-lg cursor-pointer rounded-[10px] border border-gray-200 overflow-hidden p-0 flex flex-col"
    >
      <div className="relative h-[340px]">
        <img
          src={instructorData.avatar}
          alt={instructorData.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 bg-white rounded-full p-1 shadow">
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 6L9 17l-5-5"
                stroke="#10B981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 text-sm font-medium border">
          {instructorData.courses} Courses
        </div>
        <button className="absolute bottom-3 right-3 bg-white rounded-full p-2 shadow">
          <Heart className="w-4 h-4 text-gray-600" />
        </button>
      </div>
      <div className="p-6 text-center flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{instructorData.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{instructorData.role}</p>
        </div>
        <div className="mt-6 mb-2 flex items-center justify-center text-sm text-gray-600">
          <Users className="w-4 h-4 text-[#FF4667] mr-2" />
          <span>{instructorData.students} Students</span>
        </div>
      </div>
    </div>
  );
};

export default InstructorCard;
