import Image from "next/image";
import React from "react";

export default function RegisterSection() {
  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-10 py-16">
      <div className="flex flex-col lg:flex-row items-stretch gap-10">
        <div className="w-full lg:w-1/2 lg:max-h-[620px]">
          <div className="rounded-[20px] mx-auto overflow-hidden w-[90%]  h-full">
            <Image
              src={'/become/become.jpg'}
              width={900}
              height={600}
              alt="Become instructor image"
              className="w-full h-full object-cover block"
            />
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex lg:max-h-[620px]">
          <div className="w-full bg-[#F4F6F9] rounded-2xl p-8 shadow-md border border-slate-200 h-full flex flex-col overflow-auto">
            <h3 className="text-2xl font-extrabold text-[#0f1720]">Register</h3>
            <p className="mt-2 text-sm text-gray-500">Your email address will not be published.</p>

            <form className="mt-6 space-y-4" action="#" method="POST">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name <span className="text-[#FF4667]">*</span>
                </label>
                <input
                  name="name"
                  required
                  className=" w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFDEE4]"
                  placeholder=""
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email <span className="text-[#FF4667]">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className=" w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFDEE4]"
                  placeholder=""
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number <span className="text-[#FF4667]">*</span>
                </label>
                <input
                  name="phone"
                  required
                  className=" w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFDEE4]"
                  placeholder=""
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password <span className="text-[#FF4667]">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  className=" w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFDEE4]"
                  placeholder=""
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirm Password <span className="text-[#FF4667]">*</span>
                </label>
                <input
                  type="password"
                  name="confirm_password"
                  required
                  className=" w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFDEE4]"
                  placeholder=""
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center bg-[#FF4667] text-white font-semibold px-6 py-3 rounded-full shadow-md hover:opacity-95"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
