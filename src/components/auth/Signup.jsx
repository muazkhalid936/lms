"use client";
import React, { useState } from "react";
import CustomInput from "../ui/CustomInput";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const Signup = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    userType: "Student",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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
  };

  const handleUserTypeChange = (userType) => {
    setFormData({
      ...formData,
      userType: userType,
    });
  };

  const createAccount = async (formData) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        router.push(
          `/auth/confirm-otp?userId=${data.userId}&email=${encodeURIComponent(
            formData.email
          )}`
        );
      } else {
        setErrors({
          ...errors,
          general: data.message || "Signup failed",
        });
      }
    } catch (error) {
      console.error("Error creating account:", error);
      setErrors({
        general:
          "An error occurred while creating your account. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!formData.username) newErrors.username = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      createAccount(formData);
    }
  };

  return (
    <div className="lg:w-[80%] mx-auto p-6 justify-center items-center">
      <h2 className="text-[30px]  font-medium text-[var(--indigo-900)] text-center">
        Let's Create Your Account
      </h2>
      <p className="text-[var(--gray-900)] text-[14px]  mb-6 text-center">
        Get started with allmyai and start using our AI assistance
      </p>

      {errors.general && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <CustomInput
          label="Full Name"
          type="text"
          placeholder="Enter your full name"
          name="username"
          value={formData.username}
          onChange={handleChange}
          error={errors.username}
        />

        <CustomInput
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />

        {/* User Type Selection */}
        <div className="mb-6">
          <label className="block text-[12px] font-medium  text-black mb-3">
            Continue As <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-8 sm:gap-18 ">
            <div
              className="flex items-center cursor-pointer"
              onClick={() => handleUserTypeChange("Student")}
            >
              <div
                className={`w-[10px] h-[10px]  rounded-full border-2 mr-3 flex items-center justify-center ${
                  formData.userType === "Student"
                    ? "border-red-500 bg-red-500"
                    : "border-gray-300"
                }`}
              ></div>
              <span className="text-black text-[14px]">Student</span>
            </div>

            <div
              className="flex items-center cursor-pointer"
              onClick={() => handleUserTypeChange("Instructor")}
            >
              <div
                className={`w-[10px] h-[10px]   rounded-full border-2 mr-3 flex items-center justify-center ${
                  formData.userType === "Instructor"
                    ? "border-red-500 bg-red-500"
                    : "border-gray-300"
                }`}
              ></div>
              <span className="text-black text-[14px] ">Instructor</span>
            </div>

            {/* <div
              className="flex items-center cursor-pointer"
              onClick={() => handleUserTypeChange("Institute")}
            >
              <div
                className={`w-[10px] h-[10px]  2xl:w-[16px] 2xl:h-[16px]  rounded-full border-2 mr-3 flex items-center justify-center ${
                  formData.userType === "Institute"
                    ? "border-red-500 bg-red-500"
                    : "border-gray-300"
                }`}
              ></div>
              <span className="text-black 2xl:text-[20px]">Institute</span>
            </div> */}
          </div>
        </div>

        <CustomInput
          label="Password"
          type="password"
          placeholder="Enter your password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
        />

        <CustomInput
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />

        <button
          type="submit"
          className="w-full bg-[var(--indigo-900)] cursor-pointer text-white text-[16px] font-semibold p-3 rounded-full mb-4 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin mr-2" />
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </button>

        <p className="text-[var(--gray-600)] mb-6 text-center text-sm">
          By clicking the Create Account button, you acknowledge that you have
          read and agree to our Terms of Use and Privacy Policy.
        </p>

        <p className="text-center text-[14px] text-[var(--gray-600)]">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="hover:underline font-semibold text-[var(--indigo-900)]"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
