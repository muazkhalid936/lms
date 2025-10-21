"use client";
import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReviewPill from "./ReviewPill";

const shuffleArray = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const Hero = () => {
  const images = useMemo(
    () => [
      "/Hero/1.jpg",
      "/Hero/2.png",
      "/Hero/3.png",
      "/Hero/4.png",
      "/Hero/5.jpg",
    ],
    []
  );

  const [order, setOrder] = useState(images);
  const [selected, setSelected] = useState("learning");

  const handleShuffle = () => setOrder((prev) => shuffleArray(prev));

  return (
    <div
      className="h-[700px] px-10 sm:px-5 sm:h-screen sm:min-h-[900px] w-full flex flex-col justify-center items-center bg-cover bg-center"
      style={{ backgroundImage: "url('/auth/Right_Image.png')" }}
    >
      <ReviewPill />

      <p className="text-[24px] sm:text-[50px] font-bold text-center mb-4">
        Learn, Tech, and Earn <br /> All in{" "}
        <span className="text-[var(--rose-500)]">One Pace</span>
      </p>

      <p className="text-[#6d6d6d] text-center text-[15px] font-normal max-w-2xl">
        Join thousands of students, instructors, coaches, and institute glowing
        through interactive <br /> courses, live classes, and 1-on-1 sessions.
      </p>

      <div className="hidden sm:flex space-x-4 mt-6 mb-8 bg-white p-2 rounded-full">
        <button
          onClick={() => {
            setSelected("learning");
            handleShuffle();
          }}
          className={`px-6 py-2 rounded-full font-semibold transition-opacity ${
            selected === "learning"
              ? "bg-[var(--rose-500)] text-white shadow"
              : "bg-transparent text-black"
          }`}
        >
          Start Learning
        </button>
        <button
          onClick={() => {
            setSelected("teaching");
            handleShuffle();
          }}
          className={`px-6 py-2 rounded-full font-semibold transition-opacity ${
            selected === "teaching"
              ? "bg-[var(--rose-500)] text-white shadow"
              : "bg-transparent text-black"
          }`}
        >
          Start Teaching
        </button>
        {/* <button
          onClick={() => {
            setSelected("institute");
            handleShuffle();
          }}
          className={`px-6 py-2 rounded-full font-semibold transition-opacity ${
            selected === "institute"
              ? "bg-[var(--rose-500)] text-white shadow"
              : "bg-transparent text-black"
          }`}
        >
          Join as Institute
        </button> */}
      </div>

      <div className="mt-10 relative w-full hidden sm:flex justify-center items-center">
        <div className="relative h-[260px] max-w-[900px] w-[85%] flex justify-center items-center">
 <AnimatePresence>
  {order.map((src, idx) => {
    const center = Math.floor(order.length / 2);
    const offset = idx - center;

    let scale = 1;
    if (Math.abs(offset) === 1) scale = 0.9;
    if (Math.abs(offset) >= 2) scale = 0.8;

    const rotate = offset === 0 ? 0 : offset * 6;
    const translateX = offset * 100;

    // Keep zIndex below or equal to 99
    const baseZ = 90; // base value for the centered image
    const zIndex = Math.max(1, baseZ - Math.abs(offset) * 10);

    return (
      <motion.div
        key={src}
        className="absolute sm:scale-100 scale-50 cursor-pointer"
        style={{
          height: "100%",
          width: "360px",
          borderRadius: "18px",
          overflow: "hidden",
          boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
          zIndex,
        }}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{
          opacity: 1,
          scale,
          x: translateX,
          rotate,
        }}
        exit={{ opacity: 0, scale: 0.7 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        <img
          src={src}
          alt={`hero-${idx + 1}`}
          className="object-cover h-full w-full block"
        />
      </motion.div>
    );
  })}
</AnimatePresence>

        </div>
      </div>
    </div>
  );
};

export default Hero;
