"use client";

import Image from "next/image";

const steps = [
  {
    img: "/HowItWork/1.svg",
    title: "Sign up as a student, or instructor",
  },
  {
    img: "/HowItWork/2.svg",
    title: "Upload a course, book a class, or enroll in one",
  },
  {
    img: "/HowItWork/3.svg",
    title: "Learn, teach, and grow with instant results.",
  },
];

export default function HowItWork() {
  return (
    <section className="py-5 sm:py-20 max-w-[1440px] mx-auto w-full sm:px-10  px-4">
      <div className="max-w-[1190px] mx-auto px-4 text-center">
        {/* Heading */}
        <h2 className="text-[36px] font-bold">How It Works</h2>
        <p className="text-[#6D6D6D] text-lg mt-2">
          A simple process to start learning right away
        </p>

        {/* Steps */}
        <div className="relative  mt-16 flex flex-col gap-5 items-center md:flex-row md:justify-between">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`flex ${
                i === 1 ? "md:translate-y-40" : ""
              } transform flex-col items-center`}
            >
              <div className="relative w-[168px] h-[168px] rounded-full bg-white shadow-[0_0_30px_rgba(0,0,0,0.15)] flex items-center justify-center">
                <Image
                  src={step.img}
                  alt={step.title}
                  width={100}
                  height={100}
                  className="object-contain"
                />
              </div>
              <p className="mt-4 text-[18px] w-1/2 font-medium text-[#191919]">
                {step.title}
              </p>
            </div>
          ))}

          <Image
            src={"/HowItWork/arrow.svg"}
            alt="Arrow"
            width={215}
            height={64}
            className="hidden md:block absolute top-16 left-[25%] "
          />
          <Image
            src={"/HowItWork/arrow.svg"}
            alt="Arrow"
            width={215}
            height={64}
            className="hidden md:block absolute top-66 scale-y-[-1] right-[20%] "
          />
        </div>
      </div>

      <div className="mt-10 sm:mt-60 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12 items-stretch">
        <div className="relative h-[400px] sm:h-[255px] rounded-2xl p-8 flex sm:items-center gap-6 bg-[#fdecec] shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          <div className="flex-1 text-left">
            <h3 className="text-3xl font-bold">Log In As Student</h3>
            <p className="text-muted-foreground mt-4 max-w-[420px]">
              Top instructors from around the world teach millions of students
              on Mentoring.
            </p>
            <button className="mt-6 px-6 py-3 rounded-full bg-[#e85b6a] text-white font-medium">
              Log In
            </button>
          </div>

          <Image
            src={"/HowItWork/1.png"}
            alt={"Student"}
            width={220}
            height={220}
            className="object-contain h-[230px] absolute bottom-0 right-10 rounded-md"
          />
        </div>

        <div className="relative rounded-2xl p-8 flex sm:items-center h-[400px] sm:h-[255px] gap-6 bg-[#eaf4ff] shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          <div className="flex-1 w-[60%] text-left">
            <h3 className="text-3xl font-bold">Log In As Instructor</h3>
            <p className="text-muted-foreground mt-4 max-w-[420px]">
              Create an account to receive our newsletter course promotions.
            </p>
            <button className="mt-6 px-6 py-3 rounded-full bg-[#34267a] text-white font-medium">
              Log In
            </button>
          </div>

          <Image
            src={"/HowItWork/2.png"}
            alt={"Instructor"}
            width={220}
            height={220}
            className="object-contain h-[230px] absolute -bottom-4 right-10 rounded-md"
          />
        </div>
      </div>
      <div className="mt-12">
        <div
          className="relative justify-between overflow-hidden rounded-[40px] p-4 sm:p-12 flex h-[448px] flex-col items-center text-center"
          style={{
            background:
              "linear-gradient(90deg, rgba(233,245,255,1) 0%, rgba(255,238,240,1) 100%)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none rounded-[40px]"
            style={{
              background:
                "linear-gradient(90deg, rgba(230,242,255,0.6), rgba(255,240,243,0.6))",
            }}
          />

          <div className="relative z-10 flex justify-between flex-1 flex-col max-w-[980px]">
            <span className="inline-block w-fit mx-auto bg-white px-4 py-2 rounded-full text-sm font-medium ">
              AI Advantage
            </span>

            <h3 className="text-[44px] md:text-[56px] font-bold leading-tight">
              AI That Works <span className="text-[#ff5777]">For You</span>
            </h3>

            <p className="text-[#6D6D6D] text-lg max-w-[860px] mx-auto">
              Save hours of effort. Our AI analyzes your lecture, generates
              summaries and creates MCQs in seconds. Your students can test
              themselves right after completing a lecture.
            </p>

            <div className=" flex gap-6 justify-center">
              <button className="px-8 py-3 whitespace-nowrap rounded-full bg-[#ff5777] text-white font-medium shadow-md">
                Get Started
              </button>
              <button className="px-8 py-3 whitespace-nowrap rounded-full bg-[#34267a] text-white font-medium shadow-md">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
