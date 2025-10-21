"use client";
import React, { useState, useEffect } from "react";
import InstructorCard from "./InstructorCard";

const FeaturedInstructors = ({ instructors = [] }) => {
  const [slide, setSlide] = useState(0);
  const [itemsPerSlide, setItemsPerSlide] = useState(4);

  // derive total slides from itemsPerSlide
  const total = Math.ceil(instructors.length / itemsPerSlide);

  // responsive itemsPerSlide: <768 ->1, >=768 && <1024 ->2, >=1024 ->4
  useEffect(() => {
    const calculate = () => {
      if (typeof window === "undefined") return;
      const w = window.innerWidth;
      if (w >= 1024) setItemsPerSlide(4);
      else if (w >= 768) setItemsPerSlide(2);
      else setItemsPerSlide(1);
    };

    calculate();
    window.addEventListener("resize", calculate);
    return () => window.removeEventListener("resize", calculate);
  }, []);

  // clamp slide if total changes
  useEffect(() => {
    if (slide > 0 && slide >= total) {
      setSlide(total - 1);
    }
  }, [itemsPerSlide, total, slide]);

  const go = (i) => setSlide(i);

  return (
    <div className="max-w-[1440px] w-full mx-auto px-4 mt-10 py-12">
      <div className="flex justify-between items-center mb-8">
        <div className="flex justify-center w-full items-center flex-col">
          <h2 className="text-[36px] text-center font-bold text-[#191919]">Featured Instructor</h2>
          <p className="text-gray-500 mt-2">Our team combines cutting-edge design with robust development</p>
        </div>
      </div>

      {instructors.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No instructors available at the moment.</p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{
                transform: `translateX(-${slide * (100 / total)}%)`,
                width: `${total * 100}%`,
              }}
            >
              {Array.from({ length: total }).map((_, slideIndex) => (
                <div key={slideIndex} className="flex w-full">
                  {instructors
                    .slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide)
                    .map((instr) => (
                      <div key={instr._id || instr.id} className="sm:w-1/4 px-3 flex-shrink-0">
                        <InstructorCard instr={instr} />
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: total }).map((_, index) => (
              <button
                key={index}
                onClick={() => go(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${index === slide ? "bg-red-500 w-8" : "bg-gray-300 hover:bg-gray-400"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default FeaturedInstructors;
