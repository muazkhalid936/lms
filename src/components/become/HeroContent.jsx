import Image from "next/image";
import React from "react";

const features = [
  {
    title: "Flexible Work",
    desc: "Teach at your own pace.",
    icon: "/become/img.svg",
  },
  {
    title: "Earning Potential",
    desc: "Monetize your expertise.",
    icon: "/become/img-1.svg",
  },
  {
    title: "Impact",
    desc: "Reach and educate",
    icon: "/become/img-2.svg",
  },
  {
    title: "Support",
    desc: "Access to dedicated support",
    icon: "/become/img-3.svg",
  },
];

export default function HeroContent() {
  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-10 py-16">
      <div className="flex flex-col lg:flex-row items-start gap-12">
        <div className="w-full lg:w-7/12">
          <a
            className="text-[#FF4667] font-medium text-[15px] underline inline-block"
            href="#"
          >
            Share Knowledge
          </a>

          <h1 className="mt-4 text-5xl md:text-[48px] font-extrabold text-[#0f1720] leading-tight">
            Share Your Knowledge. Inspire the Future.
          </h1>

          <p className="mt-4 text-[16px] text-[#6b6b6b] max-w-2xl">
            Share your knowledge, inspire learners worldwide, and earn while
            doing what you love. Join a community of experts transforming
            education through engaging and accessible content.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-4 rounded-2xl border border-slate-200 p-5 bg-white shadow-sm"
              >
                <div className="flex-shrink-0 w-[64px] h-[64px] rounded-full bg-[#FFEDF0] flex items-center justify-center">
                  <Image src={item.icon} width={34} height={34} alt={item.title} />
                </div>
                <div className="flex flex-col">
                  <h4 className="text-[16px] font-semibold text-[#0f1720]">
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <a
              href="#"
              className="inline-flex items-center gap-3 bg-[#FF4667] text-white font-semibold px-6 py-3 rounded-full shadow-md"
            >
              Register Now
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
          </div>
        </div>

        <div className="w-full lg:w-5/12 flex justify-end">
          <div className="relative  m-auto md:w-[420px] lg:w-[500px]">
            <div className="relative mx-auto rounded-[18px] overflow-hidden ">
              <Image
                src={'/become/hero.svg'}
                width={500}
                height={380}
                alt="Instructor hero"
                className="w-full h-auto mx-auto block"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
