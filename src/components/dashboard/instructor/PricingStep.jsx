import React, { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { useCourse } from "@/contexts/CourseContext";
import toast from "react-hot-toast";
import { set } from "mongoose";

export default function PricingStep({ onNext }) {
  const { currentCourse, updatePricing, saveDraft, isLoading } = useCourse();

  const [isFreeCourse, setIsFreeCourse] = useState(true);
  const [coursePrice, setCoursePrice] = useState("");
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountPrice, setDiscountPrice] = useState("");
  const [expiryPeriod, setExpiryPeriod] = useState("limited");
  const [numberOfMonths, setNumberOfMonths] = useState("");
  const [draftSaved, setDraftSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentCourse) {
      setIsFreeCourse(
        currentCourse.isFreeCourse !== undefined
          ? currentCourse.isFreeCourse
          : true
      );
      setCoursePrice(currentCourse.coursePrice?.toString() || "");
      setHasDiscount(currentCourse.hasDiscount || false);
      setDiscountPrice(currentCourse.discountPrice?.toString() || "");
      setExpiryPeriod(currentCourse.expiryPeriod || "limited");
      setNumberOfMonths(currentCourse.numberOfMonths?.toString() || "");
    }
  }, [currentCourse]);

  const calculateDiscountPercentage = () => {
    if (coursePrice && discountPrice) {
      const original = parseFloat(coursePrice);
      const discount = parseFloat(discountPrice);
      if (original > 0 && discount >= 0) {
        const percentage = ((original - discount) / original) * 100;
        return Math.round(percentage);
      }
    }
    return 0;
  };

  const calculateInstructorEarnings = (price) => {
    if (!price || parseFloat(price) <= 0)
      return { platformFee: 0, instructorAmount: 0 };

    const amount = parseFloat(price);
    const platformFee = amount * 0.2;
    const instructorAmount = amount * 0.8;

    return {
      platformFee: platformFee.toFixed(2),
      instructorAmount: instructorAmount.toFixed(2),
    };
  };

  const handleSaveDraft = async () => {
    setDraftSaved(true);
    if (!currentCourse?._id) {
      toast.error("Course not found. Please start from the beginning.");
      return;
    }

    try {
      const pricingData = {
        isFreeCourse,
        coursePrice: isFreeCourse ? 0 : parseFloat(coursePrice) || 0,
        hasDiscount: isFreeCourse ? false : hasDiscount,
        discountPrice:
          isFreeCourse || !hasDiscount ? 0 : parseFloat(discountPrice) || 0,
        expiryPeriod: isFreeCourse ? "unlimited" : expiryPeriod,
        numberOfMonths:
          isFreeCourse || expiryPeriod === "unlimited"
            ? null
            : parseInt(numberOfMonths) || null,
      };

      const draftResult = await saveDraft(currentCourse._id, pricingData);
      if (draftResult) {
        toast.success("Course saved as draft successfully!");
      }
    } catch (error) {
      toast.error("Failed to save course as draft");
    } finally {
      setDraftSaved(false);
    }
  };

  const handleSaveAndPublish = async () => {
    setSaving(true);
    if (!currentCourse?._id) {
      toast.error("Course not found. Please start from the beginning.");
      return;
    }

    // Validation
    if (!isFreeCourse) {
      if (!coursePrice || parseFloat(coursePrice) <= 0) {
        toast.error("Please enter a valid course price");
        return;
      }

      if (hasDiscount) {
        if (!discountPrice || parseFloat(discountPrice) <= 0) {
          toast.error("Please enter a valid discount price");
          return;
        }

        if (parseFloat(discountPrice) >= parseFloat(coursePrice)) {
          toast.error("Discount price must be less than the original price");
          return;
        }
      }

      if (
        expiryPeriod === "limited" &&
        (!numberOfMonths || parseInt(numberOfMonths) <= 0)
      ) {
        toast.error("Please enter a valid number of months");
        return;
      }
    }

    try {
      const pricingData = {
        isFreeCourse,
        coursePrice: isFreeCourse ? 0 : parseFloat(coursePrice),
        hasDiscount: isFreeCourse ? false : hasDiscount,
        discountPrice:
          isFreeCourse || !hasDiscount ? 0 : parseFloat(discountPrice),
        expiryPeriod: isFreeCourse ? "unlimited" : expiryPeriod,
        numberOfMonths:
          isFreeCourse || expiryPeriod === "unlimited"
            ? null
            : parseInt(numberOfMonths),
      };

      const pricingResult = await updatePricing(currentCourse._id, pricingData);
      if (pricingResult) {
        toast.success("Course pricing updated and published successfully!");
        if (onNext) onNext();
      }
    } catch (error) {
      toast.error("Failed to save pricing and publish course");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto scroll-to-top bg-white">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFreeCourse(!isFreeCourse)}
            className="flex-shrink-0"
          >
            <div
              className={`w-[18px] h-[18px]  cursor-pointer rounded flex items-center justify-center transition-colors ${
                isFreeCourse
                  ? "bg-red-500"
                  : "bg-white border-2 border-gray-300"
              }`}
            >
              {isFreeCourse && (
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </button>
          <span className="text-[14px] text-gray-900">
            Check if this is a free course
          </span>
        </div>

        <div>
          <label className="block text-[14px] font-medium text-gray-900 mb-2">
            Course Price ($)
          </label>
          <input
            type="number"
            value={coursePrice}
            onChange={(e) => setCoursePrice(e.target.value)}
            disabled={isFreeCourse}
            className="w-full px-4 py-3 text-[14px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--indigo-900)] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="0"
          />

          {!isFreeCourse &&
            !hasDiscount &&
            coursePrice &&
            parseFloat(coursePrice) > 0 && (
              <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-[13px] text-green-800 space-y-1">
                  <div className="flex justify-between">
                    <span>You will receive (80%):</span>
                    <span className="font-semibold">
                      $
                      {
                        calculateInstructorEarnings(coursePrice)
                          .instructorAmount
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform fee (20%):</span>
                    <span>
                      ${calculateInstructorEarnings(coursePrice).platformFee}
                    </span>
                  </div>
                </div>
              </div>
            )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setHasDiscount(!hasDiscount)}
            className="flex-shrink-0"
          >
            <div
              className={`w-[18px] h-[18px] cursor-pointer rounded flex items-center justify-center transition-colors ${
                hasDiscount ? "bg-red-500" : "bg-white border-2 border-gray-300"
              }`}
            >
              {hasDiscount && (
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </button>
          <span className="text-[14px] text-gray-900">
            Check if this course has discount
          </span>
        </div>

        <div>
          <label className="block text-[14px] font-medium text-gray-900 mb-2">
            Discount Price ($)
          </label>
          <input
            type="number"
            value={discountPrice}
            onChange={(e) => setDiscountPrice(e.target.value)}
            disabled={!hasDiscount || isFreeCourse}
            className="w-full px-4 py-3 text-[14px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--indigo-900)] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="0"
          />

          {!isFreeCourse &&
            hasDiscount &&
            discountPrice &&
            parseFloat(discountPrice) > 0 && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-[13px] text-blue-800 space-y-1">
                  <div className="flex justify-between">
                    <span>You will receive (80%):</span>
                    <span className="font-semibold">
                      $
                      {
                        calculateInstructorEarnings(discountPrice)
                          .instructorAmount
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform fee (20%):</span>
                    <span>
                      ${calculateInstructorEarnings(discountPrice).platformFee}
                    </span>
                  </div>
                </div>
              </div>
            )}
        </div>

        <div className="text-[14px] text-gray-900">
          This course has {calculateDiscountPercentage()}% Discount
        </div>

        <div>
          <label className="block text-[14px] font-medium text-gray-900 mb-3">
            Expiry Period
          </label>
          <div className="flex items-center gap-8">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="radio"
                  name="expiryPeriod"
                  value="lifetime"
                  checked={expiryPeriod === "lifetime"}
                  onChange={(e) => setExpiryPeriod(e.target.value)}
                  className="sr-only"
                />
                <div
                  className={`w-[18px] h-[18px] rounded-full flex items-center justify-center ${
                    expiryPeriod === "lifetime"
                      ? "border-red-500 border-4"
                      : "border-gray-300 border-2"
                  }`}
                ></div>
              </div>
              <span className="text-[14px] text-gray-700">Lifetime</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="radio"
                  name="expiryPeriod"
                  value="limited"
                  checked={expiryPeriod === "limited"}
                  onChange={(e) => setExpiryPeriod(e.target.value)}
                  className="sr-only"
                />
                <div
                  className={`w-[18px] h-[18px] rounded-full flex items-center justify-center ${
                    expiryPeriod === "limited"
                      ? "border-red-500 border-4"
                      : "border-gray-300 border-2"
                  }`}
                ></div>
              </div>
              <span className="text-[14px] text-gray-700">Limited Time</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-[14px] font-medium text-gray-900 mb-2">
            Number of month
          </label>
          <input
            type="number"
            value={numberOfMonths}
            onChange={(e) => setNumberOfMonths(e.target.value)}
            disabled={expiryPeriod === "lifetime"}
            className="w-full px-4 py-3 text-[14px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--indigo-900)] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="0"
          />
        </div>

        <p className="text-gray-600 text-[14px]">
          After purchase, students can access the course until your selected
          time.
        </p>

        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handleSaveDraft}
            disabled={draftSaved }
            className="bg-gray-600 cursor-pointer hover:bg-gray-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
          >
            {draftSaved ? "Saving..." : "Save as Draft"}
          </button>

          <button
            onClick={handleSaveAndPublish}
            disabled={saving }
            className="bg-[var(--indigo-900)] cursor-pointer hover:bg-indigo-800 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg transition-colors flex items-center gap-2"
          >
            {saving ? "Publishing..." : "Save Pricing & Publish Course"}
          </button>
        </div>
      </div>
    </div>
  );
}
