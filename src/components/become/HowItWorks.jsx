import Image from "next/image";
import React from "react";

const steps = [
  {
    icon: "/become/how-it-works-1.svg fill.svg",
    title: "Apply & Get Approved",
    desc: "Submit your application and get approved...",
    bg: "bg-[#FFEFF1]",
  },
  {
    icon: "/become/how-it-works-2.svg fill.svg",
    title: "Create & Upload Content",
    desc: "Develop and upload your courses, including...",
    bg: "bg-[#F3EDFF]",
  },
  {
    icon: "/become/img-4.svg",
    title: "Teach & Earn",
    desc: "Reach learners worldwide, teach, and start..",
    bg: "bg-[#FFF6E6]",
  },
];

export default function HowItWorks() {
  return (
    <div className="bg-[#F4F6F9]">
      <section className="max-w-[1440px] mx-auto px-4 sm:px-10 py-16">
        <div className="text-center">
          <a
            className="text-[#FF4667] font-medium text-[15px] underline inline-block"
            href="#"
          >
            Our Workflow
          </a>

          <h2 className="mt-4 text-4xl md:text-[36px] font-extrabold text-[#0f1720] leading-tight">
            How It Works
          </h2>

          <p className="mt-4 text-[15px] text-[#6b6b6b] max-w-2xl mx-auto">
            Turn Your Expertise into Impact in Just 3 Simple Steps!
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 p-8 bg-white shadow-md"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <Image src={item.icon} width={120} height={100} alt={item.title} />

                <h3 className="text-lg md:text-xl font-semibold text-[#0f1720]">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 max-w-xs">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
