import Core from "@/components/landing/Core";
import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import HowItWork from "@/components/landing/HowItWork";
import Testimonial from "@/components/landing/Testimonial";
import Navbar from "@/components/landing/Navbar";
import WhoWeServe from "@/components/landing/WhoWeServe";
import Faq from "@/components/landing/Faq";

import Image from "next/image";
import CourseCarousel from "@/components/landing/Courses";

export default function Home() {
  return (
    <>
      <Navbar />

      <Hero />
      <WhoWeServe />
      <Core />
      <HowItWork />
      <Testimonial />
      <div className=" overflow-hidden relative">
        <Image
          src="/Courses/redbg.png"
          width={1440}
          height={400}
          className="object-contain absolute top-10 left-[-30%] z-[-1] w-full h-full "
          alt=""
        />
        <Image
          src="/Courses/blue-bg.png"
          width={1440}
          height={400}
          className="object-contain absolute top-50 right-[-20%] z-[-1] w-full h-full "
          alt=""
        />
        <CourseCarousel />
      </div>
      <Faq />

      <Footer />
    </>
  );
}
