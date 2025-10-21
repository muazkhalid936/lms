import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";
import Navbar from "@/components/landing/Navbar";
import React from "react";

const AboutUsPage = () => {
  return (
    <div>
      <Navbar />
      <Header title="About Us" />
      <div className="max-w-[1440px] mx-auto px-4 sm:px-10 w-full py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Empowering Learning Through Innovation
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We are dedicated to transforming education by providing accessible, 
            high-quality learning experiences that empower individuals to achieve 
            their goals and unlock their potential.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
            <p className="text-gray-600 leading-relaxed">
              To democratize education by making world-class learning accessible to everyone, 
              everywhere. We believe that quality education should not be limited by 
              geographical boundaries, financial constraints, or traditional barriers.
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
            <p className="text-gray-600 leading-relaxed">
              To create a global learning community where knowledge flows freely, 
              skills are developed continuously, and every learner has the opportunity 
              to reach their full potential through innovative educational technology.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#FF4667] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Excellence</h4>
              <p className="text-gray-600">
                We strive for excellence in everything we do, from course content 
                to user experience and customer support.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#342777] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Community</h4>
              <p className="text-gray-600">
                We foster a supportive learning community where students and 
                instructors collaborate and grow together.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#10B981] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Innovation</h4>
              <p className="text-gray-600">
                We continuously innovate to improve learning outcomes and 
                create engaging educational experiences.
              </p>
            </div>
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-gray-50 rounded-lg p-8 mb-16">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-8">Our Story</h3>
          <div className="max-w-4xl mx-auto">
            <p className="text-gray-600 leading-relaxed mb-6">
              Founded with a simple yet powerful vision, our learning management system 
              was born from the belief that education should be accessible, engaging, 
              and effective for everyone. What started as a small team of passionate 
              educators and technologists has grown into a comprehensive platform 
              serving thousands of learners worldwide.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              We recognized the challenges faced by both learners and educators in 
              traditional learning environments - from geographical limitations to 
              outdated teaching methods. Our platform bridges these gaps by providing 
              cutting-edge tools, interactive content, and personalized learning paths.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Today, we continue to evolve and adapt, always keeping our learners' 
              success at the heart of everything we do. Join us on this journey of 
              continuous learning and growth.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-[#FF4667] mb-2">10K+</div>
            <div className="text-gray-600">Active Students</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#342777] mb-2">500+</div>
            <div className="text-gray-600">Expert Instructors</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#10B981] mb-2">1000+</div>
            <div className="text-gray-600">Courses Available</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#F59E0B] mb-2">95%</div>
            <div className="text-gray-600">Satisfaction Rate</div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AboutUsPage;