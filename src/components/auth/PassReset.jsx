"use client";
import React, { useState } from "react";
import OtpInput from "../ui/OtpInput";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

const ResetPassword = ({ isPassReset }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const userId = searchParams.get("userId");

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);

  const handleOtpChange = (value) => {
    setOtp(value);
  };

  const confirmOtp = async (otp) => {
    setIsLoading(true);
    let apiEndpoint = isPassReset
      ? "/api/auth/forgot-password/verify-otp"
      : "/api/auth/signup/verify-otp";

    try {
      const response = await fetch(`${apiEndpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp, userId }),
      });

      const data = await response.json();

      if (data.success) {
        if (isPassReset) {
          router.push(`/auth/new-password?&userId=${data.userId}`);
        } else {
          toast.success("Signup successful!");
          router.push("/auth/login");
        }
      } else {
        toast.error(data.message || "OTP verification failed.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }
    confirmOtp(otp, email);
  };

  const handleResendOtp = async () => {
    setIsOtpSent(true);
    try {
      const response = await fetch(`/api/auth/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, userId }),
      });

      const data = await response.json();
      //console.log(data);
      if (data.success) {
        toast.success("OTP resent Successfully");
      } else {
        toast.error("Failed to resend OTP. Please try again.");
      }
    } catch (error) {
      toast.error(error.message);
      console.error(error);
    } finally {
      setIsOtpSent(false);
    }
  };

  return (
    <div className="lg:w-[80%] mx-auto py-6 justify-center items-center">
      <h2 className="text-[30px]  font-medium text-[var(--indigo-900)]  text-center">
        {isPassReset ? " Password reset" : "Check your inbox"}{" "}
      </h2>
      <p className="text-[var(--gray-900)] text-[14px]  text-sm mb-6 text-center">
        {isPassReset
          ? `We sent a recovery code to ${decodeURIComponent(email)}`
          : `Secure your account by verifying your email. Enter the 6-digit verification code we sent to ${decodeURIComponent(
              email
            )}`}
      </p>

      <form onSubmit={handleSubmit} className="mt-10">
        <OtpInput length={6} onChange={handleOtpChange} />

        <p className="text-[var(--gray-600)] mt-6 mb-3 text-sm  text-center">
          Didn't get a code?
          <button
            onClick={handleResendOtp}
            className="ml-1 underline cursor-pointer"
            type="button"
          >
            {isOtpSent ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
            ) : (
              "Click to resend"
            )}
          </button>
        </p>

        <div className="mt-10">
          <button
            type="submit"
            className="w-full bg-[var(--indigo-900)] cursor-pointer text-white text-[16px] font-semibold p-3 rounded-full mb-4 flex justify-center items-center"
            disabled={otp.length !== 6 || isLoading}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
            ) : (
              "Verify"
            )}
          </button>

          <button
            type="button"
            onClick={() => router.push("/auth/forget-password")}
            className="w-full bg-[var(--rose-500)] border border-gray-200 cursor-pointer text-white font-semibold p-3 rounded-full mb-4"
          >
            Change email address
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
