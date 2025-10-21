"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

const contentData = {
  students: {
    title:
      "Learn from expert instructors or book 1-on-1 coaching sessions, Access pre- recorded courses. Join live classes, and test your knowledge with AI- Powered quizes",
    description:
      "Access pre-recorded courses. Join live classes, and test your knowledge with AI-Powered quizzes",
    features: [
      "Access pre-recorded courses anytime,",
      "Join live webinars with your favourite instructors.",
      "Book private sessions with industry expert",
      "Test your knowledge with AI-powered quizzes",
      "Earn certificates after courses completion",
    ],
    buttonText: "Find a Course",
    image: "/WhoWeServe/1.png",
    imageAlt: "Student with books",
  },
  instructors: {
    title: "Create and monetize your expertise with powerful teaching tools,",
    description:
      "Build courses, host live sessions, and connect with students worldwide through our platform",
    features: [
      "Create and sell online courses",
      "Host live webinars and workshops",
      "Track student progress and engagement",
      "Earn revenue from your expertise",
      "Access teaching analytics and insights",
    ],
    buttonText: "Start Teaching",
    image: "/WhoWeServe/2.png",
    imageAlt: "Professional instructor",
  },
  institutes: {
    title: "Scale your educational programs with enterprise-grade solutions,",
    description:
      "Manage multiple instructors, track institutional progress, and provide comprehensive learning experiences",
    features: [
      "Manage multiple instructor accounts",
      "Institutional dashboard and analytics",
      "Bulk student enrollment and management",
      "Custom branding and white-label options",
      "Enterprise-level support and training",
    ],
    buttonText: "Get Started",
    image: "/WhoWeServe/1.png",
    imageAlt: "Educational institution",
  },
};

export default function WhoWeServe() {
  const [activeType, setActiveType] = useState("students");
  const currentContent = contentData[activeType];

  return (
    <section className="py-16 px-4 sm:px-10 max-w-[1440px] w-full mx-auto">
      <div className=" mb-12">
        <h2 className="text-[36px] font-bold text-[#191919] ">Who We Serve</h2>
        <p className="text-lg text-[#6D6D6D] font-medium ">
          Serving students, instructors and institutes with smarter learning.
        </p>
      </div>

      <div className="flex flex-wrap justify-start gap-4 mb-12">
        <Button
          variant={activeType === "students" ? "default" : "outline"}
          onClick={() => setActiveType("students")}
          className={cn(
            "px-6 py-3 rounded-full transition-all duration-300",
            activeType === "students"
              ? "bg-[#FF4667] hover:bg-red-500 text-white"
              : "bg-[#FFDEDA] hover:bg-red-200 border-red-200  text-[#191919]"
          )}
        >
          For Students
        </Button>
        <Button
          variant={activeType === "instructors" ? "default" : "outline"}
          onClick={() => setActiveType("instructors")}
          className={cn(
            "px-6 py-3 rounded-full transition-all duration-300",
            activeType === "instructors"
              ? "bg-[#FF4667] hover:bg-red-500 text-white"
              : "bg-[#FFDEDA] hover:bg-red-200 border-red-200  text-[#191919]"
          )}
        >
          For Instructors & Coaches
        </Button>
        {/* <Button
          variant={activeType === "institutes" ? "default" : "outline"}
          onClick={() => setActiveType("institutes")}
          className={cn(
            "px-6 py-3 rounded-full transition-all duration-300",
            activeType === "institutes"
              ? "bg-[#FF4667] hover:bg-red-500 text-white"
              : "bg-[#FFDEDA] hover:bg-red-200 border-red-200  text-[#191919]"
          )}
        >
          For Institutes
        </Button> */}
      </div>

      <div className="relative">
        <Card
          style={{ backgroundImage: "url('/auth/Right_Image.png')",backgroundSize: 'cover', backgroundPosition: 'center' }}
          className=" border-0 p-8  rounded-[30px] lg:p-12 "
        >
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-[#191919] mb-4 leading-relaxed">
                  {currentContent.title}
                </h3>
              </div>

              <ul className="space-y-4">
                {currentContent.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="bg-[#342777] rounded-full p-1 mt-1 flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-[15px] text-[#191919] font-normal ">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button className="bg-[#342777] text-white px-8 py-3 rounded-full text-[16px] font-medium">
                {currentContent.buttonText}
              </Button>
            </div>

            <Image
              width={400}
              height={400}
              src={currentContent.image || "/placeholder.svg"}
              alt={currentContent.imageAlt}
              className="w-[450px] object-contain hidden sm:absolute sm:flex bottom-0 right-10  transition-all duration-500 ease-in-out"
              key={activeType}
            />
          </div>
        </Card>
      </div>
    </section>
  );
}
