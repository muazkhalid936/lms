"use client";
import React from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

const LoginModal = ({ isOpen, onClose }) => {
  const router = useRouter();

  if (!isOpen) return null;

  const handleContinueWithEmail = () => {
    router.push("/auth/login");
  };

  const handleContinueWithGoogle = () => {
    //console.log("Continue with Google");
  };

  const handleContinueWithApple = () => {
    //console.log("Continue with Apple");
  };

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-5 rounded-2xl relative max-w-[956px] w-[90%] max-h-[642px] h-full  flex">
        <div className="flex-1  flex flex-col items-center justify-center">
          <button
            onClick={onClose}
            className="absolute lg:top-0 w-[40px] h-10 rounded-[8px] right-0 -top-12  bg-white lg:-right-12 text-gray-500 hover:text-gray-700"
          >
            <X size={24} className="m-auto" />
          </button>

          <h1 className="text-[24px] lg:text-[34px] text-center font-semibold  mb-2">
            Get started with AllmyAI
          </h1>

          <p className="text-[#3D4050] text-[14px] lg:text-[16px] font-medium mb-8">
            Take your Designs to the next level.
          </p>

          <div className="space-y-4 w-full flex flex-col justify-center items-center">
            <button
              onClick={handleContinueWithEmail}
              className="w-full bg-[#BDFF00] max-w-[437px] hover:bg-[#a8e600] text-black font-medium h-[52px] px-6 rounded-full transition-colors"
            >
              Continue with email
            </button>

            <div className="text-center text-[#6C7278] text-[14px] font-medium">or</div>

            <button
              onClick={handleContinueWithGoogle}
              className="w-full bg-[#EBEBEB] hover:bg-gray-200 max-w-[437px] text-[#161618] font-semibold text-[16px] h-[52px] px-6 rounded-full transition-colors flex items-center justify-center gap-3"
            >
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                width={20}
                height={20}
              />
              Continue with Google
            </button>

            <button
              onClick={handleContinueWithApple}
              className="w-full bg-[#EBEBEB] hover:bg-gray-200 max-w-[437px] text-[#161618] font-semibold text-[16px] h-[52px] px-6 rounded-full transition-colors flex items-center justify-center gap-3"
            >
              <img
                src="https://www.apple.com/favicon.ico"
                alt="Apple"
                width={20}
                height={20}
              />
              Continue with Apple
            </button>
          </div>

          <p className="text-[14px] max-w-[437px] text-[#6C7278]  mt-6 text-center">
            By clicking the Create Account button, you acknowledge that you have
            read and agree to our{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Terms of Use
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>


        <div className="hidden lg:flex w-[428px]">
          <Image
            src={"/auth/right.png"}
            alt="Login Preview"
            width={428}
            height={642}
            className="w-full rounded-[20px] h-full object-cover"
          
          />
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
