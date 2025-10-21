"use client";
import React from "react";
import Marquee from "react-fast-marquee";
import { FaQuoteRight } from "react-icons/fa";

const avatars = [
  { src: "/Hero/1.jpg", left: "8%", top: "18%", ring: "bg-yellow-300" },
  { src: "/Hero/2.png", left: "22%", top: "10%", ring: "bg-rose-300" },
  { src: "/Hero/3.png", left: "34%", top: "22%", ring: "bg-green-200" },
  { src: "/Hero/4.png", left: "50%", top: "8%", ring: "bg-blue-300" },
  { src: "/Hero/5.jpg", left: "65%", top: "18%", ring: "bg-purple-300" },
  { src: "/Hero/1.jpg", left: "78%", top: "12%", ring: "bg-indigo-200" },
  { src: "/Hero/2.png", left: "90%", top: "20%", ring: "bg-amber-200" },
];

const mobileAvatars = [
  { src: "/Hero/1.jpg", left: "20%", top: "30%", ring: "bg-yellow-300" },
  { src: "/Hero/2.png", left: "50%", top: "25%", ring: "bg-rose-300" },
  { src: "/Hero/3.png", left: "80%", top: "45%", ring: "bg-green-200" },
];

const circles = [
  { left: "15%", top: "20%", color: "bg-pink-400" },
  { left: "28%", top: "10%", color: "bg-yellow-400" },
  { left: "42%", top: "30%", color: "bg-purple-600" },
  { left: "60%", top: "15%", color: "bg-red-400" },
  { left: "75%", top: "35%", color: "bg-blue-500" },
  { left: "85%", top: "15%", color: "bg-orange-400" },
];

const testimonials = [
  {
    quote:
      "I love the AI quiz feature. After every lecture I can quickly test my understanding, and it really helps me focus on the weak areas.",
    name: "Ali Akbar",
    role: "Student",
  },
  {
    quote:
      "Finally, a platform that lets me sell courses, host webinars, and coach 1-on-1 without juggling multiple tools — it saves me so much time.",
    name: "Amna Tahir",
    role: "Instructor",
  },
  {
    quote:
      "Our institute moved online within weeks, and the revenue dashboard makes everything clear, from enrollments to income tracking.",
    name: "Sadia Ahmed",
    role: "Admin",
  },
  {
    quote:
      "The support team helped us onboard hundreds of learners smoothly with live classes and certificates — their guidance was excellent.",
    name: "Kamran Rizvi",
    role: "Coordinator",
  },
  {
    quote:
      "Beautiful, simple UI and powerful analytics — teachers find it intuitive, and it gives us real insights into student performance.",
    name: "Nadia Khan",
    role: "Faculty",
  },
  {
    quote:
      "Seamless payments and smooth UX mean students sign up faster than ever, and it’s made a real difference in our growth.",
    name: "Hassan Ali",
    role: "Business Lead",
  },
];

const TestimonialCard = ({ quote, name, role }) => (
  <article className="bg-white rounded-[20px] h-[240px] m-1 p-6 shadow-md border border-transparent mx-3 min-w-[280px] max-w-[320px] flex-shrink-0">
    <div className="flex flex-col items-start space-x-3">
      <div className="text-[40px] mb-3 leading-none text-[#342777]">
        <FaQuoteRight />
      </div>
      <p className="text-sm font-normal text-[#191919]">{quote}</p>
    </div>

    <div className="mt-6 flex items-center justify-between">
      <div>
        <div className="text-[15px] font-semibold">{name}</div>
        <div className="text-[14px] font-normal text-[#6d6d6d]">{role}</div>
      </div>
    </div>
  </article>
);

const Testimonial = () => {
  return (
    <section className="w-full py-16  bg-gradient-to-r from-[rgba(255,238,238,0.6)] to-[rgba(229,241,255,0.6)]">
      <div className="max-w-[1440px] px-4 sm:px-10 mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-2">
          Voices Of Our Learners
        </h2>
        <p className="text-center text-[#6b6b6b] max-w-2xl mx-auto mb-8">
          Here’s what our users have to say about their journey.
        </p>

        <div className="relative w-full rounded-lg overflow-hidden mb-12">
          <img
            src="/map.png"
            alt="world map"
            className="w-full h-full object-contain filter grayscale opacity-90"
          />

          {/* Colored Circles */}
          {circles.map((c, idx) => (
            <div
              key={`circle-${idx}`}
              className={`absolute w-6 hidden md:block h-6 rounded-full ${c.color} opacity-90`}
              style={{ left: c.left, top: c.top }}
            />
          ))}

          {/* Avatars */}
          {avatars.map((a, idx) => (
            <div
              key={`avatar-${idx}`}
              className="absolute hidden md:block transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: a.left, top: a.top }}
            >
              <div className="w-16 h-16 rounded-full relative overflow-hidden bg-white" style={{ animation: `bounce 1s ease-in-out ${idx * 0.1}s infinite` }}>
                <img
                  src={a.src}
                  alt={`avatar-${idx + 1}`}
                  className="w-full h-full object-cover rounded-full"
                />
                <span
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${a.ring} ring-2 ring-white`}
                />
              </div>
            </div>
          ))}

          {/* Mobile Avatars */}
          {mobileAvatars.map((a, idx) => (
            <div
              key={`mobile-avatar-${idx}`}
              className="absolute md:hidden transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: a.left, top: a.top }}
            >
              <div className="w-16 h-16 rounded-full relative overflow-hidden bg-white" style={{ animation: `bounce 1s ease-in-out ${idx * 0.1}s infinite` }}>
                <img
                  src={a.src}
                  alt={`mobile-avatar-${idx + 1}`}
                  className="w-full h-full object-cover rounded-full"
                />
                <span
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${a.ring} ring-2 ring-white`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scrolling testimonials */}
      <div className="sm:mt-[-300px]">
        <Marquee
          pauseOnHover
          gradient={false}
          speed={40}
          className="mb-6"
          direction="left"
        >
          {testimonials.map((t, idx) => (
            <TestimonialCard key={`row1-${idx}`} {...t} />
          ))}
        </Marquee>

        <Marquee pauseOnHover gradient={false} speed={40} direction="right">
          {testimonials.map((t, idx) => (
            <TestimonialCard key={`row2-${idx}`} {...t} />
          ))}
        </Marquee>
      </div>
    </section>
  );
};

export default Testimonial;
