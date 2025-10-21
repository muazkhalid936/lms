"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";

const dynamicSlides = [
  {
    title: "Empower Minds ; Build the Future with DreamLMS",
    desc: "Create, teach, and inspire through interactive courses. DreamLMS helps instructors share knowledge globally while earning from their expertise.",
  },
  {
    title: "AI-Powered Learning ; Smarter Quizzes & Insights",
    desc: "Generate intelligent quizzes automatically using AI. DreamLMS personalizes learning paths for every student, making education more engaging and effective.",
  },
  {
    title: "Teach with Ease ; Upload, Manage & Grow",
    desc: "Upload your own videos, add YouTube lessons, or create interactive quizzes effortlessly. DreamLMS provides everything you need to run your online academy.",
  },
  {
    title: "Learn Anywhere ; Anytime, On Any Device",
    desc: "Access courses on the go with a seamless experience across devices. Track your progress and continue learning without limits.",
  },
  {
    title: "Earn What You Deserve ; Instructor-Friendly Revenue System",
    desc: "Monetize your skills easily — DreamLMS ensures secure payments and transparent earnings for every instructor.",
  },
];

const SideComponent = ({ isProfilePage, title, desc, sideData }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);

  // Progress increment logic
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 5, 100));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Slide change trigger
  useEffect(() => {
    if (progress >= 100) {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % dynamicSlides.length);
      setProgress(0);
    }
  }, [progress, dynamicSlides.length]);

  return (
    <div
      className={`flex ${
        isProfilePage != true ? "items-start " : "items-end  "
      } justify-center rounded-3xl p-5 overflow-hidden  mr-2 h-[95vh] mt-[20px] w-full px-[40px]  hidden lg:flex bg-cover bg-center `}
      style={{
        backgroundImage: sideData?.backgroundImage
          ? `url('${getStrapiImageUrl(sideData.backgroundImage)}')`
          : "url('/auth/Right_Image.png')",
      }}
    >
      {isProfilePage === true ? (
        <div className="flex justify-center items-center flex-col gap-4">
          <div className="flex gap-1 w-[80%] justify-center items-center flex-col">
            <div className="relative w-[300px]  h-[300px]">
              <Image
                src="/auth/right2.png"
                alt="Additional Image"
                fill
                className="object-contain"
              />
            </div>

            <div className="relative w-[191px] h-[44px]  mb-5">
              <Image
                src={"/logo/Logo.svg"}
                alt="Logo"
                fill
                className="object-contain mt-10"
              />
            </div>
          </div>

          <div className="w-[80%] mt-4 flex flex-col items-center justify-center">
            <p className="font-bold text-[40px]   text-center">
              <span className="text-[var(--indigo-900)]">
                {dynamicSlides[currentSlide].title.split(";")[0]}
              </span>
              <span className="text-[var(--rose-500)]">
                {dynamicSlides[currentSlide].title.split(";")[1]}
              </span>
            </p>

            <p className="text-[var(--gray-900)] opacity-70 text-center text-[18px]  mt-4">
              {dynamicSlides[currentSlide].description ||
                dynamicSlides[currentSlide].desc}
            </p>
          </div>

          {/* Progress Tabs */}
          <div className="flex gap-2 mt-10 w-full px-10">
            {dynamicSlides.map((_, idx) => (
              <div
                key={idx}
                className="flex-1 h-2 bg-[var(--rose-500-20)] rounded overflow-hidden"
              >
                <div
                  className="h-full bg-[var(--rose-500)] transition-all duration-[100ms]"
                  style={{
                    width:
                      idx < currentSlide
                        ? "100%"
                        : idx === currentSlide
                        ? `${progress}%`
                        : "0%",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="mx-10">
            <p className="text-[40px] text-[#BDFF00] font-semibold text-start">
              {title}{" "}
            </p>
            <p className="text-[20px]  text-white text-start opacity-70 mt-4">
              Before we begin, we'll align with your goals, vision, and creative
              preferences. This isn't a form. It's a mirror.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default SideComponent;
