import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";
import Navbar from "@/components/landing/Navbar";
import ContactSection from "@/components/landing/ContactSection";
import React from "react";

const page = () => {
  return (
    <div>
      <Navbar />
      <Header title="Contact Us" />
      <div className="max-w-[1440px] mx-auto px-4  sm:px-10 w-full">
        <ContactSection />

        <div className="mt-5  w-full h-96">
          <iframe
            title="New York City Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d24156.69093475943!2d-74.0060152!3d40.7127281!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0x80b82c1c0b0b0b0b!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sus!4v1717690000000!5m2!1sen!2sus"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default page;
