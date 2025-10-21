import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { useCourse } from "@/contexts/CourseContext";

export default function CourseInformationStep({ onNext }) {
  const { currentCourse, createCourse, updateCourse, isLoading } = useCourse();
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    courseTitle: "",
    courseCategory: "",
    courseLevel: "",
    language: "",
    maxStudents: "",
    courseType: "",
    shortDescription: "",
    courseDescription: "",
    learningOutcomes: ["Become a UX designer"],
    requirements: [""],
    isFeatured: true,
  });

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);


  useEffect(() => {
    if (currentCourse) {
      setFormData({
        courseTitle: currentCourse.courseTitle || "",
        courseCategory: currentCourse.courseCategory || "",
        courseLevel: currentCourse.courseLevel || "",
        language: currentCourse.language || "",
        maxStudents: currentCourse.maxStudents?.toString() || "",
        courseType: currentCourse.courseType || "",
        shortDescription: currentCourse.shortDescription || "",
        courseDescription: currentCourse.courseDescription || "",
        learningOutcomes: currentCourse.learningOutcomes || [
          "Become a UX designer",
        ],
        requirements: currentCourse.requirements || [""],
        isFeatured: currentCourse.isFeatured || false,
      });
    }
  }, [currentCourse]);

  //console.log(formData.courseDescription);
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addLearningOutcome = () => {
    setFormData((prev) => ({
      ...prev,
      learningOutcomes: [...prev.learningOutcomes, ""],
    }));
  };

  const addRequirement = () => {
    setFormData((prev) => ({
      ...prev,
      requirements: [...prev.requirements, ""],
    }));
  };

  const updateLearningOutcome = (index, value) => {
    const updated = [...formData.learningOutcomes];
    updated[index] = value;
    setFormData((prev) => ({
      ...prev,
      learningOutcomes: updated,
    }));
  };

  const updateRequirement = (index, value) => {
    const updated = [...formData.requirements];
    updated[index] = value;
    setFormData((prev) => ({
      ...prev,
      requirements: updated,
    }));
  };

  const handleSave = async () => {
    if (
      !formData.courseTitle ||
      !formData.courseCategory ||
      !formData.courseLevel ||
      !formData.language ||
      !formData.courseType ||
      !formData.shortDescription ||
      !formData.courseDescription
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const courseData = {
      ...formData,
      instructor: userId,
      maxStudents: formData.maxStudents
        ? parseInt(formData.maxStudents)
        : undefined,
    };

    try {
      let result;
      if (currentCourse) {
        result = await updateCourse(currentCourse._id, courseData);
      } else {
        result = await createCourse(courseData);
      }

      if (result) {
        onNext();
      }
    } catch (error) {
      console.error("Error saving course:", error);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto bg-white">
      <h2 className="text-2xl font-semibold mb-8 text-gray-900">
        Basic Information
      </h2>

      <div className="space-y-6">
        {/* Course Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Title <span className="text-[var(--rose-500)]">*</span>
          </label>
          <input
            type="text"
            value={formData.courseTitle}
            onChange={(e) => handleInputChange("courseTitle", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2  focus:ring-[var(--indigo-900)] outline-none"
            placeholder="Enter course title"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Category <span className="text-[var(--rose-500)]">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.courseCategory}
                onChange={(e) =>
                  handleInputChange("courseCategory", e.target.value)
                }
                className="w-full text-[14px] text-[var(--gray-900)] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2  focus:ring-[var(--indigo-900)] outline-none appearance-none bg-white"
              >
                <option value="">Select</option>
                <option value="design">Design</option>
                <option value="development">Development</option>
                <option value="business">Business</option>
                <option value="marketing">Marketing</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Level <span className="text-[var(--rose-500)]">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.courseLevel}
                onChange={(e) =>
                  handleInputChange("courseLevel", e.target.value)
                }
                className="w-full text-[14px] text-[var(--gray-900)] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2  focus:ring-[var(--indigo-900)] outline-none appearance-none bg-white"
              >
                <option value="">Select</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language <span className="text-[var(--rose-500)]">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.language}
                onChange={(e) => handleInputChange("language", e.target.value)}
                className="w-full text-[14px] text-[var(--gray-900)] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2  focus:ring-[var(--indigo-900)] outline-none appearance-none bg-white"
              >
                <option value="">Select</option>
                <option value="hindi">Hindi</option>
                <option value="urdu">Urdu</option>
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
                <option value="german">German</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Row 2: Max Students, Course Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Number of Students{" "}
              <span className="text-[var(--rose-500)]">*</span>
            </label>
            <input
              type="number"
              value={formData.maxStudents}
              onChange={(e) => handleInputChange("maxStudents", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2  focus:ring-[var(--indigo-900)] outline-none"
              placeholder="Enter max students"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Public / Private Course{" "}
              <span className="text-[var(--rose-500)]">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.courseType}
                onChange={(e) =>
                  handleInputChange("courseType", e.target.value)
                }
                className="w-full text-[14px] text-[var(--gray-900)] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2  focus:ring-[var(--indigo-900)] outline-none appearance-none bg-white"
              >
                <option value="">Select</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Short Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Short Description <span className="text-[var(--rose-500)]">*</span>
          </label>
          <textarea
            value={formData.shortDescription}
            onChange={(e) =>
              handleInputChange("shortDescription", e.target.value)
            }
            rows={1}
            className="w-full px-3 py-2 border h-28 border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--indigo-900)]  outline-none resize-none"
            placeholder="Enter a brief description"
          />
        </div>

        {/* Course Description with Rich Text Editor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Description <span className="text-[var(--rose-500)]">*</span>
          </label>
          <RichTextEditor
            initialContent={formData.courseDescription}
            onChange={(content) =>
              handleInputChange("courseDescription", content.html)
            }
          />{" "}
        </div>
        {/* 
              onChange={(e) => handleInputChange('courseDescription', e.target.value)} */}
        {/* Learning Outcomes and Requirements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* What will students learn */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              What will students learn in your course?
            </h3>
            <div className="space-y-3">
              {formData.learningOutcomes.map((outcome, index) => (
                <input
                  key={index}
                  type="text"
                  value={outcome}
                  onChange={(e) => updateLearningOutcome(index, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2  focus:ring-[var(--indigo-900)] outline-none"
                  placeholder="Enter learning outcome"
                />
              ))}
              <button
                type="button"
                onClick={addLearningOutcome}
                className="cursor-pointer text-[var(--rose-500)] hover:text-pink-600 text-sm font-medium flex items-center gap-1"
              >
                + Add New Item
              </button>
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Requirements
            </h3>
            <div className="space-y-3">
              {formData.requirements.map((requirement, index) => (
                <input
                  key={index}
                  type="text"
                  value={requirement}
                  onChange={(e) => updateRequirement(index, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2  focus:ring-[var(--indigo-900)] outline-none"
                  placeholder="Enter requirement"
                />
              ))}
              <button
                type="button"
                onClick={addRequirement}
                className="text-[var(--rose-500)] cursor-pointer hover:text-pink-600 text-sm font-medium flex items-center gap-1"
              >
                + Add New Item
              </button>
            </div>
          </div>
        </div>

        {/* Featured Course Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              handleInputChange("isFeatured", !formData.isFeatured)
            }
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
              formData.isFeatured ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                formData.isFeatured ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
          <span className="text-[16px] text-gray-900">
            Check this for featured course
          </span>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-6">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isLoading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-red-500 text-white hover:bg-red-600 cursor-pointer"
            }`}
          >
            {isLoading
              ? "Saving..."
              : currentCourse
              ? "Update & Continue"
              : "Save & Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
