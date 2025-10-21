"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const CommentForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    comment: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    //console.log("Submitted Data:", formData);
    // you can send this data to backend here
    setFormData({ name: "", email: "", subject: "", comment: "" });
  };

  return (
    <div className="rounded-[10px] flex flex-col gap-3 border border-[#e7e7e7] p-6">
      <h3 className="text-xl font-semibold mb-6">Post A Comment</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Name + Email in grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={"w-full border-[#e7e7e7]"}
              placeholder="Your name"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              className={"w-full border-[#e7e7e7]"}
              onChange={handleChange}
              placeholder="you@example.com"
            />
          </div>
        </div>

        {/* Subject */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            name="subject"
            value={formData.subject}
            className={"w-full border-[#e7e7e7]"}
            onChange={handleChange}
            placeholder="Enter subject"
          />
        </div>

        {/* Comments */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="comment">Comments</Label>
          <Textarea
            id="comment"
            name="comment"
            className={"w-full border-[#e7e7e7]"}
            value={formData.comment}
            onChange={handleChange}
            placeholder="Write your comment..."
            rows={4}
          />
        </div>

        <button
          type="submit"
          className="bg-[#392C7D]  rounded-full px-6 py-2 text-white w-fit"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default CommentForm;
