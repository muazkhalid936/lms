"use client";
import React, { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import SocialPlatforms from "@/components/dashboard/profile/SocialPlatforms";

import Notifications from "@/components/dashboard/profile/Notifications";

import SecuritySection from "@/components/dashboard/profile/SecuritySection";
import EditProfileSection from "@/components/dashboard/profile/EditProfileSection";

const TABS = [
  { id: "profile", label: "Profile" },
  { id: "security", label: "Security" },

  { id: "social", label: "Social Platforms" },

  { id: "notifications", label: "Notifications" },
];

function Tabs({ active, onChange }) {
  return (
    <div className="mb-6 border border-[var(--gray-100)] rounded-[10px] bg-[#F4F6F9] px-4">
      <div className="flex gap-4 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`py-3 px-3 text-sm ${
              active === t.id
                ? "text-[#FF4667] border-b-3 border-[#FF4667]"
                : "text-[var(--gray-600)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get("tab") || "profile";

  useEffect(() => {
    if (!searchParams.get("tab")) {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.set("tab", "profile");
      router.replace(`${window.location.pathname}?${params.toString()}`);
    }
  }, [searchParams, router]);

  const handleChange = (id) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("tab", id);
    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  return (
    <>
      <Tabs active={tab} onChange={handleChange} />

      <div>
        {tab === "profile" && <EditProfileSection />}
        {tab === "security" && <SecuritySection />}

        {tab === "notifications" && <Notifications />}

        {tab === "social" && <SocialPlatforms />}
      </div>
    </>
  );
}

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-6 bg-white">
      <h1 className="text-[20px] border-b border-[var(--gray-100)] pb-4 font-bold text-[var(--gray-900)] mb-6">
        Settings
      </h1>

      <Suspense fallback={<div>Loading settings...</div>}>
        <SettingsContent />
      </Suspense>
    </div>
  );
}
