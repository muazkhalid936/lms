"use client";
import React, { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const TopCard = ({ icon, title, children }) => {
  return (
    <div className="flex-1 min-w-[200px] bg-white rounded-lg border border-[#eee] p-5 flex items-start gap-4">
      <div className="w-12 h-12 flex items-center justify-center rounded-md bg-[#392C7D]">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-sm mb-1">{title}</h4>
        <p className="text-gray-500 text-sm">{children}</p>
      </div>
    </div>
  );
};

const ContactSection = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // minimal client-side feedback; real submit happens on server or via API
    alert("Enquiry sent. (This is a demo client-side stub)");
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  return (
    <section className="container mx-auto  py-12">
      {/* Top info cards */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <TopCard
          icon={<MapPin className="w-5 h-5 text-white" />}
          title="Address"
        >
          1364 Still Water Dr, AK 99801.
        </TopCard>

        <TopCard icon={<Phone className="w-5 h-5 text-white" />} title="Phone">
          +1 (907) 789-7623
        </TopCard>

        <TopCard
          icon={<Mail className="w-5 h-5 text-white" />}
          title="E-mail Address"
        >
          contact@example.com
        </TopCard>
      </div>

      {/* Main area */}
      <div className="bg-[#F8F8F8] rounded-[10px] border border-[#e7e7e7] p-6 md:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="flex flex-col h-full flex-1 justify-center">
            <span className="inline-block px-3 w-fit py-1 bg-[#FFEDF0] text-[#FF4667] rounded-full text-sm mb-4">
              Contact Us
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              Get in touch with us today
            </h2>
            <p className="text-gray-600 max-w-xl">
              Get in touch with us to explore how our LMS solution can enhance
              your e-learning experience. We're here to help you build a
              seamless and engaging learning platform!
            </p>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold mb-4">Send Us Message</h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">
                      Name <span className="text-pink-600">*</span>
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="mt-2 w-full border border-[#e6e6e6] rounded-md px-3 py-2 text-sm"
                      placeholder="Your name"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Email Address <span className="text-pink-600">*</span>
                    </label>
                    <input
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="mt-2 w-full border border-[#e6e6e6] rounded-md px-3 py-2 text-sm"
                      placeholder="you@example.com"
                      type="email"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Phone Number</label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="mt-2 w-full border border-[#e6e6e6] rounded-md px-3 py-2 text-sm"
                      placeholder="Phone number"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Subject</label>
                    <input
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      className="mt-2 w-full border border-[#e6e6e6] rounded-md px-3 py-2 text-sm"
                      placeholder="Subject"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Your Message</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    className="mt-2 w-full border border-[#e6e6e6] rounded-md px-3 py-2 text-sm h-28"
                    placeholder="Write your message..."
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#FF4667] text-white rounded-full py-3 px-6 text-sm font-medium"
                  >
                    <Send className="w-4 h-4" />
                    Send Enquiry
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
