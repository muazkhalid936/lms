import React from "react";

const Desc = ({ course }) => {
  return (
    <div
      className="rounded-[10px] flex flex-col gap-3 border border-[#e7e7e7] p-6"
      dangerouslySetInnerHTML={{ __html: course.courseDescription }}
    />
  );
};

export default Desc;
