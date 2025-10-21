import React, { useState } from "react";
import {
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
} from "lucide-react";

export default function SocialPlatforms() {
  const [links, setLinks] = useState({
    twitter: "https://www.twitter.com/",
    facebook: "https://www.facebook.com/",
    instagram: "https://www.instagram.com/",
    linkedin: "https://www.linkedin.com/",
    youtube: "https://www.youtube.com/",
  });

  const handleChange = (key, value) => {
    setLinks((s) => ({ ...s, [key]: value }));
  };

  const handleSave = () => {
    alert("Social profiles saved (demo)");
  };

  const inputClass =
    "border border-[var(--gray-100)] rounded-[6px] px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-rose-300";

  const iconBoxClass =
    "w-9 h-9 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center";

  return (
    <div className="border border-[var(--gray-100)] rounded-[10px] p-6 bg-white shadow-sm">
      <div className="grid gap-5">
        {/* Twitter */}
        <div>
          <label className="font-medium">Twitter</label>
          <div className="mt-2 flex items-center gap-3">
            <div className={iconBoxClass}>
              <Twitter size={20} />
            </div>
            <input
              value={links.twitter}
              onChange={(e) => handleChange("twitter", e.target.value)}
              className={inputClass}
              placeholder="Enter Twitter URL"
            />
          </div>
        </div>

        {/* Facebook */}
        <div>
          <label className="font-medium">Facebook</label>
          <div className="mt-2 flex items-center gap-3">
            <div className={iconBoxClass}>
              <Facebook size={20} />
            </div>
            <input
              value={links.facebook}
              onChange={(e) => handleChange("facebook", e.target.value)}
              className={inputClass}
              placeholder="Enter Facebook URL"
            />
          </div>
        </div>

        {/* Instagram */}
        <div>
          <label className="font-medium">Instagram</label>
          <div className="mt-2 flex items-center gap-3">
            <div className={iconBoxClass}>
              <Instagram size={20} />
            </div>
            <input
              value={links.instagram}
              onChange={(e) => handleChange("instagram", e.target.value)}
              className={inputClass}
              placeholder="Enter Instagram URL"
            />
          </div>
        </div>

        {/* LinkedIn */}
        <div>
          <label className="font-medium">LinkedIn</label>
          <div className="mt-2 flex items-center gap-3">
            <div className={iconBoxClass}>
              <Linkedin size={20} />
            </div>
            <input
              value={links.linkedin}
              onChange={(e) => handleChange("linkedin", e.target.value)}
              className={inputClass}
              placeholder="Enter LinkedIn URL"
            />
          </div>
        </div>

        {/* YouTube */}
        <div>
          <label className="font-medium">YouTube</label>
          <div className="mt-2 flex items-center gap-3">
            <div className={iconBoxClass}>
              <Youtube size={20} />
            </div>
            <input
              value={links.youtube}
              onChange={(e) => handleChange("youtube", e.target.value)}
              className={inputClass}
              placeholder="Enter YouTube URL"
            />
          </div>
        </div>

        {/* Save button */}
        <div className="mt-4">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition"
          >
            Save Social Profile
          </button>
        </div>
      </div>
    </div>
  );
}
