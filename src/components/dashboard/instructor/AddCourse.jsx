"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, ArrowLeft, Check } from "lucide-react";
import { CourseProvider, useCourse } from "@/contexts/CourseContext";
import CourseInformationStep from "./CourseInformationStep";
import CourseMediaStep from "./CourseMediaStep";
import CurriculumComponent from "./CurriculumStep";
import AdditionalInfo from "./AdditionalInfo";
import PricingStep from "./PricingStep";

const CourseSetupWizardContent = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [courseId, setCourseId] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchCourse, isLoading, resetCourseState } = useCourse();
  
  useEffect(() => {
    const editCourseId = searchParams.get('edit');
    if (editCourseId && editCourseId !== courseId) {
      setIsEditMode(true);
      setCourseId(editCourseId);
    } else if (!editCourseId && courseId) {
      setIsEditMode(false);
      setCourseId(null);
    }
  }, [searchParams, courseId]);

  // Separate effect for fetching/resetting course data
  useEffect(() => {
    if (isEditMode && courseId) {
      fetchCourse(courseId);
    } else if (!isEditMode) {
      resetCourseState();
    }
  }, [isEditMode, courseId, fetchCourse, resetCourseState]);
  const steps = [
    { id: 1, title: "Course Information", component: CourseInformationStep },
    { id: 2, title: "Course Media", component: CourseMediaStep },
    { id: 3, title: "Curriculum", component: CurriculumComponent },
    {
      id: 4,
      title: "Additional Info",
      component: AdditionalInfo,
    },
    { id: 5, title: "Pricing", component: PricingStep },
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === steps.length) {
      setShowCompletionModal(true);
    }
  };

  const handleBackToDashboard = () => {
    router.push("/dashboard/instructor");
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepId) => {
    setCurrentStep(stepId);
  };

  const getCurrentStepComponent = () => {
    const step = steps.find((s) => s.id === currentStep);
    const Component = step.component;
    return <Component onNext={handleNext} />;
  };

  return (
    <div className="mx-auto p-6 md:pt-0">
      {/* Loading indicator for course data fetch */}
      {isLoading && isEditMode && (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading course data...</div>
        </div>
      )}
      
    {showCompletionModal && (
      <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4 text-center shadow-xl">
          {/* Large Success Check Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
              <Check size={40} className="text-white" />
            </div>
          </div>

          {/* Success Message */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {isEditMode ? "Course Updated Successfully!" : "Congratulations! Course Submitted"}
          </h2>

          <p className="text-gray-600 mb-2">
            {isEditMode 
              ? "Your course has been updated successfully."
              : "You've successfully submitted the Course & its under the review,"
            }
          </p>
          {!isEditMode && (
            <p className="text-gray-600 mb-8">
              Once the course is reviewed by the reviewer it will go live.
            </p>
          )}

          {/* Back to Dashboard Button */}
          <button
            onClick={handleBackToDashboard}
            className="cursor-pointer bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-3 rounded-lg transition-colors flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </div>
      </div>
    )}

    {/* Step Indicator Background - Show completed when modal is open */}
    <div
      className={`bg-white border border-[var(--gray-100)] rounded-[10px] p-8 ${
        showCompletionModal ? "opacity-20" : ""
      }`}
    >
      {/* Step Indicator */}
      <div className="relative flex items-center justify-between mb-8 pb-4">
        {/* baseline connector */}
        <div className="absolute top-6 left-[calc(50%)] right-[calc(50%)] h-[2px] bg-gray-200" />

        {steps.map((step, index) => (
          <div
            key={step.id}
            className="relative z-10 flex flex-col items-center flex-1"
          >
            {/* Step Circle */}
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-full cursor-pointer transition-colors
        ${
          step.id === currentStep
            ? "bg-black text-white"
            : step.id < currentStep
            ? "bg-green-500 text-white"
            : "bg-gray-300 text-gray-600"
        }`}
                onClick={() => handleStepClick(step.id)}
            >
              {step.id < currentStep ? (
                <Check size={20} />
              ) : (
                <span className="text-sm font-medium">
                  {step.id.toString().padStart(2, "0")}
                </span>
              )}
            </div>

            <span
              className={`mt-2 text-sm hidden md:flex text-center ${
                step.id === currentStep
                  ? "text-black font-medium"
                  : "text-gray-500"
              }`}
            >
              {step.title}
            </span>

            {index !== steps.length - 1 && (
              <div className="absolute top-6 left-1/2 w-full h-[2px] bg-gray-200 -z-10" />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="mb-8">{getCurrentStepComponent()}</div>

      {/* Navigation Buttons */}
      {/* <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className={`px-6 py-2 cursor-pointer rounded-lg font-medium transition-colors ${
            currentStep === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Previous
        </button>

        <button
          onClick={handleNext}
          className="px-6 py-2 cursor-pointer rounded-lg font-medium transition-colors flex items-center gap-2 bg-red-500 text-white hover:bg-red-600"
        >
          {currentStep === steps.length ? (isEditMode ? "Update Course" : "Submit Course") : "Next"}
          {currentStep < steps.length && <ChevronRight size={16} />}
        </button>
      </div> */}
    </div>
    </div>
  );
};

const CourseSetupWizard = () => {
  return (
    <CourseProvider>
      <CourseSetupWizardContent />
    </CourseProvider>
  );
};

export default CourseSetupWizard;
