import React from "react";

const Header = ({ title, pageName }) => (
  <div className="relative py-16 px-6 bg-[url('/header_bg.png')] bg-no-repeat bg-cover">
    <div className="mx-auto text-center">
      <h1 className="text-[36px] capitalize font-bold text-[var(--gray-900)] mb-4">
        {title}
      </h1>
      <div className="flex items-center justify-center space-x-2 text-sm">
        <span className="text-[var(--gray-900)]">Home</span>
        <div className="w-[15px] h-[5px] bg-[var(--rose-500)] rounded-[5px]"></div>
        <span className="text-[var(--gray-700)] font-medium capitalize">{pageName}</span>
      </div>
    </div>
  </div>
);

export default Header;
