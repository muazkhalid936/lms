"use client";
import React, { useState } from "react";
import CustomInput from "../ui/CustomInput";
import { useRouter } from "next/navigation";

const ForgetPassword = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState({});

  const sendResetOtp = async (email) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({email: email}),
      });
  
      const data = await response.json();
      //console.log(data)
      if (data.success) {
        router.push(`/auth/password-reset?userId=${data.userId}&email=${encodeURIComponent(formData.email)}`);
      } else {
        setErrors({ email: data.message || "Failed to send otp" });
      }
    }
    catch(error) {
      setErrors({ email: "Failed to send otp" });
    }
    finally {
      setIsLoading(false);
    }
  }



  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (formData.email == "" || formData.email == null) {
      newErrors.email =
        "Email is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // alert("Password reset link sent!");
      sendResetOtp(formData.email);
    }
  };

  return (
    <div className="lg:w-[80%] mx-auto p-6 justify-center items-center ">
      <h2 className="text-[30px]  text-[var(--indigo-900)] text-center">
        Forgot Password?
      </h2>
      <p className="text-[var(--gray-900)] text-[14px]  mb-6 text-center">
        Just follow the steps to get back into your Koajo account!
      </p>

      <form onSubmit={handleSubmit}>
        <CustomInput
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />

        <button
          type="submit"
           className="w-full bg-[var(--indigo-900)] cursor-pointer text-white text-[16px] font-semibold p-3 rounded-full mb-4 flex justify-center items-center"
          disabled={!formData.email || isLoading}
        >
           {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
          ) : (
            "Reset Password"
          )}
          
        </button>

        <button
          type="button"
          onClick={() => router.push("/auth/login")}
          className="w-full border bg-[var(--rose-500)] border-gray-200 text-[16px] cursor-pointer text-white font-semibold p-3 rounded-full mb-4"
        >
          Back to Login
        </button>
      </form>
    </div>
  );
};

export default ForgetPassword;
