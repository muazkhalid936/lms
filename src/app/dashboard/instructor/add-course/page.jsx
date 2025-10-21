"use client";
import CourseSetupWizard from "@/components/dashboard/instructor/AddCourse";
import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";

const AddCourseContent = () => {
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('edit');
  
  return (
    <div>
      <div className="m-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Course' : 'Add New Course'}
        </h1>
        {isEditMode && (
          <p className="text-gray-600 mt-2">
            Make changes to your course and save them.
          </p>
        )}
      </div>
      <CourseSetupWizard />
    </div>
  );
};

const page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddCourseContent />
    </Suspense>
  );
};

export default page;
