"use client";
import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";

const ContactCard = ({ instructor }) => {
  return (
    <div className="rounded-[10px] border border-[#e7e7e7] p-6 ">
      {/* Heading */}
      <h2 className="text-[20px] font-bold mb-4">Contact Details</h2>

      {/* Contact Info */}
      <div className="flex flex-col gap-4 text-gray-700 text-[15px]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-[#392C7D] rounded-full">
            <Mail className="w4 h-4 text-white" />
          </div>
          <div className="flex flex-col justify-between">
            <span>Email</span>
            <span className="text-[#6d6d6d] text-[14px] font-normal">
              {instructor.email}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-[#392C7D] rounded-full">
            <Phone className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col justify-between">
            <span>Phone</span>

            <span className="text-[#6d6d6d] text-[14px] font-normal">
{
              instructor.phoneNumber || "Not Provided"  
}            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-[#392C7D] rounded-full">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col justify-between">
            <span>Address</span>
            <span className="text-[#6d6d6d] text-[14px] font-normal">
              {instructor.address || "Not Provided"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactCard;
