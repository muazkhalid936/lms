"use client";

import CustomInput from "@/components/ui/CustomInput";
import React, { useState, useEffect } from "react";
import useAuthStore from "@/store/authStore";
import { useRouter } from "next/navigation";

const SecuritySection = () => {
  const { user } = useAuthStore();
  const userId = user?._id;

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [generalError, setGeneralError] = useState("");
  const router = useRouter()
  useEffect(() => {
    if (!user) {
      // User will be fetched automatically by the auth store
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    setErrors({
      ...errors,
      [name]: "",
    });
    
    if (successMessage) {
      setSuccessMessage("");
    }
    if (generalError) {
      setGeneralError("");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(formData.newPassword)) {
      newErrors.newPassword = "Password must contain letters and numbers";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = "New password must be different from current password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setGeneralError("");

    if (!validateForm()) {
      return;
    }

    if (!userId) {
      setGeneralError("User session not found. Please log in again.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(data.message || "Password changed successfully!");
        // Clear form
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setGeneralError(data.message || data.error || "Failed to change password");
      }
    } catch (error) {
      setGeneralError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 border border-[var(--gray-100)] rounded-[10px] p-6">
      <div>
        <h2 className="text-[20px] font-bold text-[var(--gray-900)] mb-2">
          Change Password
        </h2>
        <p className="text-[var(--gray-600)] text-[14px] mb-6">
          Can't remember your current password?{" "}
          <button 
            type="button"
            className="text-[var(--gray-900)] hover:text-blue-800 underline font-medium"
            onClick={()=>router.push("/auth/forget-password")}
          >
            Reset your password via email
          </button>
        </p>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-[14px]">{successMessage}</p>
          </div>
        )}

        {generalError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-[14px]">{generalError}</p>
          </div>
        )}

        <div className="space-y-6 max-w-[70%]">
          <div>
            <CustomInput
              label="Current Password"
              type="password"
              placeholder="Enter password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              error={errors.currentPassword}
              disabled={loading}
            />
          </div>

          <div>
            <CustomInput
              label="New Password"
              type="password"
              placeholder="Enter password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              error={errors.newPassword}
              disabled={loading}
            />
            <p className="text-[14px] text-[var(--gray-600)] mt-2">
              Use 8 or more characters with a mix of letters, numbers & symbols.
            </p>
          </div>

          <div>
            <CustomInput
              label="Confirm Password"
              type="password"
              placeholder="Enter password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-[14px] cursor-pointer bg-[var(--rose-500)] text-white font-medium rounded-[800px] hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Changing Password..." : "Change Password"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecuritySection;