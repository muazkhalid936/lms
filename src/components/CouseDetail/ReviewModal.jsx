"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Star, X } from "lucide-react";
import toast from "react-hot-toast";

const ReviewModal = ({ isOpen, onClose, courseId, courseName, onReviewSubmitted }) => {
  const [formData, setFormData] = useState({
    rating: 0,
    comment: "",
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRatingClick = (rating) => {
    setFormData({ ...formData, rating });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (formData.comment.trim().length < 10) {
      toast.error("Please write at least 10 characters in your review");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/courses/${courseId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          rating: formData.rating,
          comment: formData.comment
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Review posted successfully!");
        setFormData({ rating: 0, comment: "" });
        onClose();
        if (onReviewSubmitted) {
          onReviewSubmitted(result.data);
        }
      } else {
        toast.error(result.message || "Failed to post review");
      }
    } catch (error) {
      console.error("Error posting review:", error);
      toast.error("An error occurred while posting your review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingText = (rating) => {
    switch (rating) {
      case 1:
        return "Poor";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Very Good";
      case 5:
        return "Excellent";
      default:
        return "Select a rating";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[10px] w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-[10px]">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Review Course</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              disabled={isSubmitting}
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">{courseName}</p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Rating */}
            <div className="flex flex-col gap-3">
              <Label htmlFor="rating">Your Rating</Label>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingClick(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        size={24}
                        className={`${
                          star <= (hoveredRating || formData.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        } transition-colors`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-sm text-gray-600 ml-2">
                  {getRatingText(hoveredRating || formData.rating)}
                </span>
              </div>
            </div>

            {/* Review Comment */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="comment">Your Review</Label>
              <Textarea
                id="comment"
                name="comment"
                className="w-full border-[#e7e7e7] min-h-[120px]"
                value={formData.comment}
                onChange={handleChange}
                placeholder="Share your experience with this course. What did you like? What could be improved?"
                rows={5}
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500">
                {formData.comment.length}/1000 characters (minimum 10)
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 rounded-full px-6 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#392C7D] rounded-full px-6 py-2 text-white hover:bg-[#2d1f5f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting || formData.rating === 0}
              >
                {isSubmitting ? "Posting..." : "Post Review"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;