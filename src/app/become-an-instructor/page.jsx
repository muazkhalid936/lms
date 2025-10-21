import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";
import Navbar from "@/components/landing/Navbar";
import Image from "next/image";
import React from "react";
import HeroContent from "@/components/become/HeroContent";
import HowItWorks from "@/components/become/HowItWorks";
import CoreStats from "@/components/become/CoreStats";
import RegisterSection from "@/components/become/RegisterSection";

const page = () => {
  return (
    <div>
      <Navbar />
      <Header title="Become an Instructor" />

      <HeroContent />

      <HowItWorks />

      <CoreStats />
      <RegisterSection />

      <Footer />
    </div>
  );
};
export default page;
