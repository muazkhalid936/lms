"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    const token = searchParams.get("token");

    if (success === "true") {
      setStatus("success");
      // Redirect to profile after successful authentication
      setTimeout(() => {
        router.push("/dashboard/student");
      }, 2000);
    } else if (error) {
      setStatus("error");
      // Redirect back to login after showing error
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } else if (token) {
      // If there's a token in URL (old flow), treat as success
      setStatus("success");
      setTimeout(() => {
        router.push("/dashboard/student");
      }, 2000);
    } else {
      // If no parameters, wait briefly then redirect to login
      setTimeout(() => {
        //console.log("No valid parameters, redirecting to login");
        router.push("/auth/login");
      }, 3000);
    }
  }, [searchParams, router]);

  const getErrorMessage = () => {
    const error = searchParams.get("error");
    switch (error) {
      case "code_missing":
        return "Authorization code is missing. Please try again.";
      case "oauth_failed":
        return "Google authentication failed. Please try again.";
      default:
        return "An unexpected error occurred during authentication.";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          {status === "loading" && (
            <>
              <Loader2 size={48} className="animate-spin mx-auto mb-4 text-[var(--indigo-900)]" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Completing Sign In...
              </h2>
              <p className="text-gray-600">
                Please wait while we finish setting up your account.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Successfully Signed In!
              </h2>
              <p className="text-gray-600">
                Redirecting you to your dashboard...
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Sign In Failed
              </h2>
              <p className="text-gray-600 mb-4">{getErrorMessage()}</p>
              <p className="text-sm text-gray-500">
                Redirecting you back to login...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}