"use client";
import React, { useState } from 'react';

const GENERAL = [
  { id: 'student_questions', label: 'Student Questions', desc: 'Notify me when a student asks the question in the Q&A section' },
  { id: 'new_reviews', label: 'New Reviews', desc: 'Notify me when a student leaves a review' },
  { id: 'new_messages', label: 'New Messages', desc: 'Notify me when a student sends a message' },
  { id: 'new_course_comments', label: 'Course Comments', desc: 'Notify me when a comment is left on a course' },
];

const EMAIL = [
  { id: 'course_enrolment', label: 'Course Enrolment', desc: 'Send me emails when a new student enrolls the course' },
  { id: 'payment_receipts', label: 'Payment Receipts', desc: 'Send me payment receipts via email' },
  { id: 'newsletter', label: 'Newsletter', desc: 'Send me marketing emails and newsletters' },
  { id: 'product_updates', label: 'Product Updates', desc: 'Send me product updates and announcements' },
  { id: 'security_alerts', label: 'Security Alerts', desc: 'Send me security related alerts for my account' },
];

export default function Notifications() {
  const [general, setGeneral] = useState({
    student_questions: true,
    new_reviews: true,
    new_messages: false,
    new_course_comments: false,
  });

  const [email, setEmail] = useState({
    course_enrolment: true,
    payment_receipts: true,
    newsletter: false,
    product_updates: false,
    security_alerts: false,
  });

  const toggleGeneral = (id) => setGeneral((s) => ({ ...s, [id]: !s[id] }));
  const toggleEmail = (id) => setEmail((s) => ({ ...s, [id]: !s[id] }));

  const toggleAll = (group) => {
    if (group === 'general') {
      const allOn = Object.values(general).every(Boolean);
      const next = {};
      GENERAL.forEach((g) => (next[g.id] = !allOn));
      setGeneral(next);
    } else {
      const allOn = Object.values(email).every(Boolean);
      const next = {};
      EMAIL.forEach((g) => (next[g.id] = !allOn));
      setEmail(next);
    }
  };

  return (
    <div>
      <div className="border border-[var(--gray-100)] rounded-[10px] p-6 bg-white">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">General Notifications</h3>
          <button onClick={() => toggleAll('general')} className="px-3 py-1 bg-black text-white rounded-full text-sm">Toggle all</button>
        </div>

        <div className="mt-4 space-y-4">
          {GENERAL.map((g) => (
            <div key={g.id} className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{g.label}</div>
                <div className="text-sm text-[var(--gray-500)]">{g.desc}</div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={!!general[g.id]} onChange={() => toggleGeneral(g.id)} />
                <div className="w-11 h-6 bg-[var(--gray-200)] peer-focus:outline-none rounded-full peer peer-checked:bg-rose-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5 relative"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 border border-[var(--gray-100)] rounded-[10px] p-6 bg-white">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Email Notifications</h3>
          <button onClick={() => toggleAll('email')} className="px-3 py-1 bg-black text-white rounded-full text-sm">Toggle all</button>
        </div>

        <div className="mt-4 space-y-4">
          {EMAIL.map((g) => (
            <div key={g.id} className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{g.label}</div>
                <div className="text-sm text-[var(--gray-500)]">{g.desc}</div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={!!email[g.id]} onChange={() => toggleEmail(g.id)} />
                <div className="w-11 h-6 bg-[var(--gray-200)] peer-focus:outline-none rounded-full peer peer-checked:bg-rose-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5 relative"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
