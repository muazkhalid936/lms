"use client";
import React, { useState } from "react";
import CustomInput from "../ui/CustomInput";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import useAuthStore from "@/store/authStore";

const Login = () => {
  const router = useRouter();
  const { login, loading: authLoading, error: authError } = useAuthStore();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const loginToAccount = async (formData) => {
    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        console.log("Login successful, redirecting to dashboard...");
        router.push("/dashboard/student");
      } else {
        setErrors({
          ...errors,
          [result.field || 'form']: result.error,
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ form: "An unexpected error occurred. Please try again." });
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setErrors({});

    try {
      const response = await fetch("/api/auth/google");
      const data = await response.json();

      if (data.success) {
        // Redirect to Google OAuth URL
        window.location.href = data.authUrl;
      } else {
        setErrors({
          form: "Failed to initiate Google login. Please try again.",
        });
      }
    } catch (error) {
      console.error("Google login error:", error);
      setErrors({ form: "An unexpected error occurred. Please try again." });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      loginToAccount(formData);
    }
  };

  return (
    <div className="lg:w-[80%] mx-auto p-6 justify-center items-center ">
      <h2 className="text-[30px]  font-medium text-[var(--indigo-900)]  text-center">
        Welcome!
      </h2>
      <p className="text-[var(--gray-900)] text-[14px]  mb-6 text-center">
        Sign in to your allmyai account to access all allmyai products.
      </p>

      {errors.form && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {errors.form}
        </div>
      )}

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
        <CustomInput
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          icon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-600 focus:outline-none"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />
        <div className="flex items-center justify-between mb-6">
          <div>
            <input
              type="checkbox"
              id="remember"
              name="remember"
              className="mr-2  accent-[var(--indigo-900)] "
            />
            <label
              htmlFor="remember"
              className="text-[var(--gray-600)] text-[12px] "
            >
              Remember me
            </label>
          </div>
          <Link
            href="/auth/forget-password"
            className="text-[var(--gray-900)] font-medium text-[12px]  hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          className="w-full bg-[var(--indigo-900)] cursor-pointer text-white text-[16px] font-semibold p-3 rounded-full mb-4 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={authLoading}
        >
          {authLoading ? (
            <>
              <Loader2 size={20} className="animate-spin mr-2" />
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </button>
        <div className="text-center mb-4">or</div>
        <div className="flex justify-between gap-2">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full bg-[var(--rose-500)] cursor-pointer text-white border text-[16px] border-gray-300 p-2 font-semibold rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              <>
                <Loader2 size={20} className="animate-spin mr-2" />
                Connecting...
              </>
            ) : (
              <>
                <img
                  src={"/auth/google.png"}
                  alt="Google"
                  className="w-6 h-6 mr-2 "
                />
                Google
              </>
            )}
          </button>
        </div>
        <p className="text-center text-[14px]  mt-4 text-[var(--gray-600)]">
          Don't have an account?{" "}
          <Link
            href="/auth/signup"
            className="hover:underline font-semibold text-[var(--indigo-900)]"
          >
            Create
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
