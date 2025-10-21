"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");

  function handleSubscribe(e) {
    e.preventDefault();
    // small placeholder handler — project can wire this to real API later
    if (!email) return; // noop for empty
    //console.log("Subscribe request", email);
    setEmail("");
  }

  return (
    <div className="w-full  bg-[#342777] relative mt-[200px] sm:rounded-t-[50%_20%]">
      <div className="w-[90%] px-4  sm:w-[724px] h-[242px] absolute top-20 translate-x-[-50%] left-1/2 rounded-[20px] mt-[-200px] bg-gradient-to-r from-[#FFE9E7] to-[#E5F1FF] mx-auto  flex flex-col items-center justify-center">
        <Image
          src="/Footer/brain.svg"
          alt="decor"
          width={44}
          height={44}
          className="absolute left-6 top-0 sm:top-6 "
        />
        <Image
          src="/Footer/book.svg"
          alt="decor"
          width={44}
          height={44}
          className="absolute left-6 bottom-0 sm:bottom-6 "
        />
        <Image
          src="/Footer/bulb.svg"
          alt="decor"
          width={44}
          height={44}
          className="absolute right-6 top-0 sm:top-6 "
        />
        <Image
          src="/Footer/globe.svg"
          alt="decor"
          width={44}
          height={44}
          className="absolute right-6 bottom-0 sm:bottom-6 "
        />

        <h3 className="text-center text-2xl md:text-[28px] font-semibold text-[#0B0B0B] leading-[1.05] px-6">
          Subscribe to our Newsletter for
          <span className="block">Newest Course Updates</span>
        </h3>

        <form
          onSubmit={handleSubscribe}
          className="mt-6 w-[86%] flex items-center justify-center"
          aria-label="Subscribe to newsletter"
        >
          <div className="w-[80%] bg-white rounded-full flex items-center shadow-md overflow-hidden">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 text-gray-600 placeholder-gray-400 outline-none rounded-l-full"
              aria-label="Email address"
            />

            <button
              type="submit"
              className="bg-[#342777] text-white font-semibold px-8 py-3 rounded-full mr-1 ml-2 whitespace-nowrap"
            >
              Subscribe!
            </button>
          </div>
        </form>
      </div>

      <div className="w-full flex flex-col pt-40 items-center justify-center text-white px-6  pb-12">
        <Image
          width={156}
          height={36}
          src="/logo/white-logo.svg"
          alt="DreamsLMS"
          className=" mb-6"
        />

        <p className="text-center max-w-3xl text-[16px] font-normal leading-7 mb-8">
          Platform designed to help organizations, educators, and learners
          manage, deliver, and track learning and training activities.
        </p>

        <nav className="flex flex-wrap gap-10 mb-6 text-[14px] font-normal">
          <Link href="about-us" className="hover:underline">
            About
          </Link>
          <Link href="terms" className="hover:underline">
            Terms
          </Link>
          <Link href="privacy" className="hover:underline">
            Privacy
          </Link>
          {/* <Link href="#" className="hover:underline">
            Career
          </Link> */}
          <Link href="contact-us" className="hover:underline">
            Contact Us
          </Link>
        </nav>

        <div className="flex items-center gap-4 mb-6">
          {["fb", "insta", "be", "in", "x"].map((icon) => (
            <a
              key={icon}
              href="#"
              className=" w-[26px] h-[26px] flex items-center justify-center  transition"
            >
              <Image
                src={`/links/${icon}.svg`}
                alt={`${icon} icon`}
                width={26}
                height={26}
              />
            </a>
          ))}
        </div>

        <div className="text-sm text-white/90">
          Copyright 2025 © <span className="text-[#FF7575]">DreamsLMS</span>.
          All right reserved.
        </div>
      </div>
    </div>
  );
}
