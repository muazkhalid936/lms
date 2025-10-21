"use client";

import Image from "next/image";
import React, { useEffect } from "react";
import useAuthStore from "@/store/authStore";

const InfoItem = ({ label, children }) => (
  <div>
    <div className="text-xs text-gray-400">{label}</div>
    <div className="mt-1">{children}</div>
  </div>
);

const TimelineItem = ({ title, subtitle, isLast }) => (
  <div className="flex items-start gap-4">
    <div className="flex flex-col items-center">
      <div className="w-3 h-3 mt-2 bg-green-500 rounded-full" />
      {!isLast && <div className="w-px h-16 bg-dashed border-l border-dashed border-gray-200" />}
    </div>
    <div>
      <div className="font-semibold">{title}</div>
      <div className="text-xs text-gray-400">{subtitle}</div>
    </div>
  </div>
);

const ExperienceItem = ({ icon, title, subtitle }) => (
  <div className="flex items-center gap-4 rounded p-4">
    <div className="p-3 bg-gray-100 rounded">
      {icon ? <Image src={icon} alt="icon" width={18} height={18} /> : null}
    </div>
    <div>
      <div className="font-semibold">{title}</div>
      <div className="text-xs text-gray-400">{subtitle}</div>
    </div>
  </div>
);

export default function InstructorProfilePage() {
  const { user, loading } = useAuthStore();

  useEffect(() => {
    if (!user) {
      // User will be fetched automatically by the auth store
    }
  }, [user]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 pb-6 bg-white">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-6xl px-6 pb-6 bg-white">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-600">No user data found</p>
        </div>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Format date with time
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate age
  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Format education timeline
  const formatEducationTimeline = (edu) => {
    if (!edu.fromDate && !edu.toDate) return "";
    
    const from = edu.fromDate ? new Date(edu.fromDate).getFullYear() : "N/A";
    const to = edu.toDate ? new Date(edu.toDate).getFullYear() : "Present";
    
    return `(${from} - ${to})`;
  };

  // Format experience timeline
  const formatExperienceTimeline = (exp) => {
    if (!exp.fromDate && !exp.toDate) return "";
    
    const from = exp.fromDate ? new Date(exp.fromDate).getFullYear() : "N/A";
    const to = exp.toDate ? new Date(exp.toDate).getFullYear() : "Present";
    
    return `(${from} - ${to})`;
  };

  const cols = [
    [
      { label: "First Name", value: user.firstName || "N/A" },
      { label: "User Name", value: user.userName || "N/A" },
      { label: "Gender", value: user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : "N/A" },
      {
        label: "Bio",
        value: user.bio || "No bio available",
      },
    ],
    [
      { label: "Last Name", value: user.lastName || "N/A" },
      { label: "Phone Number", value: user.phoneNumber || "N/A" },
      { label: "DOB", value: formatDate(user.dob) },
    ],
    [
      { label: "Registration Date", value: formatDateTime(user.createdAt) },
      { label: "Email", value: user.email || "N/A" },
      { label: "Age", value: calculateAge(user.dob) },
    ],
  ];

  // Check if user is instructor
  const isInstructor = user.userType === "Instructor";

  // Format education data
  const education = isInstructor && user.education && user.education.length > 0
    ? user.education.map(edu => ({
        title: edu.degree || "Degree",
        subtitle: `${edu.university || "University"} ${formatEducationTimeline(edu)}`.trim(),
      }))
    : [];

  // Format experience data
  const experience = isInstructor && user.experience && user.experience.length > 0
    ? user.experience.map(exp => ({
        icon: "/dashboard/ins/course.svg",
        title: exp.position || "Position",
        subtitle: `${exp.company || "Company"} ${formatExperienceTimeline(exp)}`.trim(),
      }))
    : [];

  return (
    <div className="mx-auto max-w-6xl px-6 pb-6 bg-white">
      <h1 className="text-[20px] border-b border-[var(--gray-100)] pb-4 font-bold text-[var(--gray-900)] mb-6">
        My Profile
      </h1>

      <section className="border border-[var(--gray-100)] rounded-[10px] mb-6 bg-white">
        <div className="px-6 py-5 border-b border-[var(--gray-100)]">
          <h2 className="font-medium text-sm">Basic Information</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-700">
            {cols.map((col, ci) => (
              <div key={ci}>
                {col.map((it, i) => (
                  <div key={i} className={i === 0 ? "" : "mt-4"}>
                    <InfoItem label={it.label}>{it.value}</InfoItem>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {isInstructor && education.length > 0 && (
        <section className="border border-[var(--gray-100)] rounded-[10px] mb-6 bg-white">
          <div className="px-6 py-5 border-b border-[var(--gray-100)]">
            <h2 className="font-medium text-sm">Education</h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {education.map((e, idx) => (
                <TimelineItem
                  key={idx}
                  title={e.title}
                  subtitle={e.subtitle}
                  isLast={idx === education.length - 1}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {isInstructor && experience.length > 0 && (
        <section className="border border-[var(--gray-100)] rounded-[10px] mb-6 bg-white">
          <div className="px-6 py-5 border-b border-[var(--gray-100)]">
            <h2 className="font-medium text-sm">Experience</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {experience.map((ex, idx) => (
                <ExperienceItem
                  key={idx}
                  icon={ex.icon}
                  title={ex.title}
                  subtitle={ex.subtitle}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {isInstructor && education.length === 0 && experience.length === 0 && (
        <div className="border border-[var(--gray-100)] rounded-[10px] p-6 bg-white text-center">
          <p className="text-gray-500 text-sm">
            No education or experience information added yet.
          </p>
        </div>
      )}
    </div>
  );
}