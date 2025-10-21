"use client";
import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";

const faqs = [
  {
    q: "How do payouts work?",
    a: "Payouts are processed monthly. You can connect your bank or payment provider and withdraw earnings after meeting the minimum threshold.",
  },
  {
    q: "Can I have live classes?",
    a: "Yes — you can schedule live classes and host them through integrated meeting tools or links.",
  },
  {
    q: "Do students get certificates?",
    a: "Yes, after completing a course, students receive a downloadable certificate.",
  },
  {
    q: "What if I just want to do hourly coaching, not courses?",
    a: "You can offer hourly coaching sessions and bill per-session or per-hour using the instructor dashboard.",
  },
];

const Item = ({ faq, isOpen, onToggle, index }) => {
  const contentRef = useRef(null);
  const headerRef = useRef(null);
  const iconRef = useRef(null);
  const textRef = useRef(null);
  const cardRef = useRef(null);
  const currentTl = useRef(null);
  const prevIsOpen = useRef(isOpen);
  const [contentVisible, setContentVisible] = useState(isOpen);

  useEffect(() => {
    const content = contentRef.current;
    const header = headerRef.current;
    const icon = iconRef.current;
    const text = textRef.current;

    // Kill any existing timeline to prevent conflicts
    if (currentTl.current) {
      currentTl.current.kill();
    }

    const wasOpen = prevIsOpen.current;

    if (isOpen) {
      // make content visible for animation
      setContentVisible(true);
      // Opening animation
      currentTl.current = gsap.timeline();

      // Animate header background and text color
      currentTl.current
        .to(header, {
          background: "linear-gradient(90deg, #C2E9FB77 0%, #A1C4FD 100%)",
          // color: "#ffffff",
          duration: 0.5,
          ease: "power2.out",
        })

        // Animate icon
        .to(
          icon,
          {
            rotation: 180,
            backgroundColor: "#ffffff",
            borderColor: "#ffffff",
            color: "#4b6ef6",
            duration: 0.4,
            ease: "power2.out",
          },
          "<"
        )

        // Animate content height and opacityre
        .set(content, { display: "block" })
        .fromTo(
          content,
          {
            height: 0,
            paddingBottom: 0,
            opacity: 0,
          },
          {
            height: "auto",
            paddingBottom: 24,
            opacity: 1,
            duration: 0.4,
            ease: "power2.out",
          },
          "<0.1"
        )

        // Animate text content
        .fromTo(
          text,
          {
            opacity: 0,
            y: -10,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.3,
            ease: "power2.out",
          },
          "<0.2"
        );
    } else if (!isOpen && wasOpen) {
      // Closing animation
      currentTl.current = gsap.timeline();

      // Animate text content first
      currentTl.current
        .to(text, {
          opacity: 0,
          y: -5,
          duration: 0.2,
          ease: "power2.out",
        })

        // Animate content height and opacity
        .to(
          content,
          {
            height: 0,
            paddingBottom: 0,
            opacity: 0,
            duration: 0.4,
            ease: "power2.out",
          },
          "<0.1"
        )

        // Hide content after animation
        .set(content, { display: "none" })

        // Animate header background and text color
        .to(
          header,
          {
            background: "#ffffff",
            color: "#000000",
            duration: 0.5,
            ease: "power2.out",
          },
          "<"
        )

        // Animate icon
        .to(
          icon,
          {
            rotation: 0,
            backgroundColor: "transparent",
            borderColor: "#e5e5e5",
            color: "#666666",
            duration: 0.4,
            ease: "power2.out",
          },
          "<"
        );
      // At end of timeline, flip local visibility
      currentTl.current.call(() => setContentVisible(false));
    }

    // mark prev state and cleanup function
    return () => {
      if (currentTl.current) {
        currentTl.current.kill();
      }
      prevIsOpen.current = isOpen;
    };
  }, [isOpen]);

  // Hover animation
  const handleMouseEnter = () => {
    gsap.to(cardRef.current, {
      scale: 1.01,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, {
      scale: 1,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  return (
    <div className=" mx-auto mb-4">
      <div
        ref={cardRef}
        onClick={onToggle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="cursor-pointer rounded-2xl overflow-hidden border border-[#eee] relative"
      >
        <div
          ref={headerRef}
          className="px-6 py-6 flex items-center justify-between bg-white"
        >
          <div className="text-left">
            <h4 className="text-[20px] font-medium">{faq.q}</h4>
          </div>

          <div className="ml-4 flex-shrink-0">
            <div
              ref={iconRef}
              className="h-8 w-8 rounded-full border border-[#e5e5e5] flex items-center justify-center bg-transparent"
            >
              <span className="text-xl font-bold text-[#666666]">
                {isOpen ? "−" : "+"}
              </span>
            </div>
          </div>
        </div>

        <div
          ref={contentRef}
          className="px-6 bg-white overflow-hidden"
          style={{ display: contentVisible ? "block" : "none" }}
        >
          <p
            ref={textRef}
            className="mt-2 text-[16px] text-gray-600 font-normal"
          >
            {faq.a}
          </p>
        </div>
      </div>
    </div>
  );
};

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(2); // default open 3rd per screenshot
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const faqItemsRef = useRef([]);
  const ctaRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    // Initial page load animations
    const tl = gsap.timeline();

    tl.fromTo(
      titleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
    )
      .fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        "<0.1"
      )
      .fromTo(
        faqItemsRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.1,
        },
        "<0.2"
      )
      .fromTo(
        ctaRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        "<0.4"
      );
  }, []);

  const handleToggle = (index) => {
    if (openIndex === index) {
      // Closing the currently open item
      setOpenIndex(-1);
    } else {
      // Open the clicked item immediately (this will allow simultaneous close/open animations)
      setOpenIndex(index);
    }
  };

  // Button hover animation
  const handleButtonHover = () => {
    gsap.to(buttonRef.current, {
      scale: 1.05,
      boxShadow: "0 10px 25px rgba(255, 113, 137, 0.3)",
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleButtonLeave = () => {
    gsap.to(buttonRef.current, {
      scale: 1,
      boxShadow: "none",
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleButtonClick = () => {
    gsap.to(buttonRef.current, {
      scale: 0.95,
      duration: 0.1,
      ease: "power2.out",
      yoyo: true,
      repeat: 1,
    });
  };

  return (
    <section className="py-20 max-w-[1440px] mx-auto sm:px-10 px-4">
      <div className="max-w-[1440px]  mx-auto text-center mb-8">
        <h2 ref={titleRef} className="text-[32px] font-bold opacity-0">
          Frequently Asked Questions
        </h2>
        <p ref={subtitleRef} className="text-[#6d6d6d] mt-2 opacity-0">
          Here are the most frequently asked questions you may check before
          getting started
        </p>
      </div>

      <div className=" mx-auto">
        {faqs.map((f, i) => (
          <div
            key={i}
            ref={(el) => (faqItemsRef.current[i] = el)}
            className="opacity-0"
          >
            <Item
              faq={f}
              isOpen={openIndex === i}
              onToggle={() => handleToggle(i)}
              index={i}
            />
          </div>
        ))}
      </div>

      <div ref={ctaRef} className=" mx-auto mt-12  opacity-0">
        <div className="rounded-2xl bg-[#fdecec] px-12 py-20 text-center shadow-md">
          <h3 className="text-3xl font-bold mb-4">Still have a question?</h3>
          <p className="text-[#6d6d6d] max-w-2xl mx-auto mb-6">
            We'd be happy to help you with any questions you have! Please let us
            know what you're looking for, and we'll do our best to assist you.
          </p>
          <button
            ref={buttonRef}
            onClick={handleButtonClick}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
            className="px-6 py-3 rounded-full bg-[#ff7189] text-white font-medium"
          >
            Contact Us
          </button>
        </div>
      </div>
    </section>
  );
}
