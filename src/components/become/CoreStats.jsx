import Image from "next/image";
import React from "react";

const stats = [
  {
    icon: "/CoreFeature/1.svg",
    value: "10K",
    label: "Online Courses",
    accent: "text-[#6B46FF]",
  },
  {
    icon: "/CoreFeature/2.svg",
    value: "200+",
    label: "Expert Tutors",
    accent: "text-[#F6C02B]",
  },
  {
    icon: "/CoreFeature/3.svg",
    value: "6K+",
    label: "Certified Courses",
    accent: "text-[#22C1FF]",
  },
  {
    icon: "/CoreFeature/4.svg",
    value: "60K+",
    label: "Online Students",
    accent: "text-[#1ED6A8]",
  },
];

export default function CoreStats() {
  return (
    <div className=" bg-[#35226B] rounded-tl-lg rounded-tr-lg py-10 px-6">
      <div className="max-w-[1440px] px-4 sm:px-10 mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl p-6 flex items-center gap-4 shadow-md"
          >
            <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-[#F6F7FB]">
              <Image src={s.icon} width={40} height={40} alt={s.label} />
            </div>
            <div className="flex flex-col">
              <span className={`text-2xl font-extrabold ${s.accent}`}>
                {s.value}
              </span>
              <span className="text-sm text-gray-500">{s.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
