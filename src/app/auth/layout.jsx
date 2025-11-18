"use client";
import Image from "next/image";
import AuthFooter from "@/components/auth/AuthFooter";
import { usePathname, useRouter } from "next/navigation";
import { MoveLeft } from "lucide-react";
import React, { useState, useEffect } from "react";
import SideComponent from "@/components/auth/SideComponent";

export default function AuthLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const isSignupPage = pathname === "/auth/sign-up";

  return (
    <div className="bg-[#f8f8f8] w-full h-full">
      <div className="mx-auto justify-center items-start  flex gap-2 h-auto min-h-screen">
        <div className="lg:w-1/2 w-full mx-auto min-h-screen flex flex-col  justify-between p-5">
          <div className="flex items-center gap-2 mb-2">
            {isSignupPage ? (
              <button
                onClick={() => router.back()}
                className="flex items-center w-[44px] h-[44px]  justify-center border p-1 border-[#E3E3E3] rounded-full hover:underline text-sm"
              >
                <MoveLeft className="w-[24px] h-[24px] " />
              </button>
            ) : (
              <div
                className="flex justify-center items-center gap-1 cursor-pointer"
                onClick={() => router.push("/")}
              >
                <Image
                  src="/logo/Logo.svg"
                  alt="Logo"
                  width={120}
                  height={1000}
                  className="w-[191px] h-[44px]  object-contain "
                />
              </div>
            )}
          </div>

          <div className="flex flex-1  justify-center items-center">
            {children}
          </div>

          <AuthFooter />
        </div>
        <div className="lg:w-[50%] sticky top-4 h-fit  mr-4 flex justify-center items-center">
          <SideComponent isProfilePage={true} />
        </div>
      </div>
    </div>
  );
}
