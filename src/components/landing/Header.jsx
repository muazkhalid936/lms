import React from "react";

const Header = ({ title }) => {
  return (
    <div className="bg-gradient-to-r  pt-[50px] from-[#FEE0DE] via-[#E4F5FD] h-[200px] flex justify-center items-center flex-col to-[#DDEDFF] ">
      <p className="text-[36px] font-bold text-[#191919]">{title}</p>
      <div className="flex gap-2 justify-center items-center">
        <p className="text-[14px] text-[#191919] font-normal ">Home</p>
        <div className="w-[15px] rounded-full h-[5px] bg-[#FF4667] "></div>
        <p className="text-[14px] text-[#191919] font-normal">{title}</p>
      </div>
    </div>
  );
};

export default Header;
