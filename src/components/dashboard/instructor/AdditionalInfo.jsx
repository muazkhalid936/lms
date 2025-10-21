import React, { useState, useEffect } from "react";
import { ChevronDown, Plus, X } from "lucide-react";
import { useCourse } from "@/contexts/CourseContext";
import toast from "react-hot-toast";

export default function AdditionalInfo({ onNext }) {
  const { currentCourse, faqs, isLoading, createFAQ, updateFAQ, deleteFAQ, fetchFAQs, updateCourse } = useCourse();
  
  // Remove hardcoded FAQs and use context FAQs instead
  const [tags, setTags] = useState([]);
  const [message, setMessage] = useState("");
  const [isChecked, setIsChecked] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [newFaqTitle, setNewFaqTitle] = useState("");
  const [newFaqAnswer, setNewFaqAnswer] = useState("");

  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [expandedFaqs, setExpandedFaqs] = useState({});

  // Load course data when component mounts
  useEffect(() => {
    if (currentCourse) {
      setTags(currentCourse.tags || []);
      setMessage(currentCourse.instructorMessage || "");
      
      // Fetch FAQs
      fetchFAQs(currentCourse._id);
    }
  }, [currentCourse?._id, fetchFAQs]);

  const toggleFaq = (id) => {
    setExpandedFaqs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const addFaq = async () => {
    if (newFaqTitle.trim() && newFaqAnswer.trim() && currentCourse?._id) {
      const faqData = {
        question: newFaqTitle.trim(),
        answer: newFaqAnswer.trim()
      };
      
      const result = await createFAQ(currentCourse._id, faqData);
      if (result) {
        setNewFaqTitle("");
        setNewFaqAnswer("");
        setShowModal(false);
      }
    } else {
      toast.error("Please fill in all fields and ensure course is created");
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
      setShowTagInput(false);
    }
  };

  const handleDeleteFaq = async (faqId) => {
    if (currentCourse?._id) {
      const result = await deleteFAQ(currentCourse._id, faqId);
      if (result) {
        // Remove from expanded state as well
        setExpandedFaqs(prev => {
          const newState = { ...prev };
          delete newState[faqId];
          return newState;
        });
      }
    }
  };

  const handleSaveAndContinue = async () => {
    if (currentCourse?._id) {
      const updateData = {
        tags: tags,
        instructorMessage: message
      };
      
      const result = await updateCourse(currentCourse._id, updateData);
      if (result) {
        toast.success("Additional information saved successfully!");
        if (onNext) onNext();
      }
    } else {
      toast.error("Course not found. Please start from the beginning.");
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[20px] font-bold text-gray-900">FAQ's</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[var(--indigo-900)] cursor-pointer hover:bg-indigo-800 text-white px-6 py-3 rounded-full flex items-center gap-2 transition-colors"
        >
          <div className="rounded-full bg-white">
            <Plus size={15} className="text-black" />
          </div>
          Add New
        </button>
      </div>

      {/* FAQ Items */}
      <div className="space-y-4 mb-8">
        {faqs.map((faq) => (
          <div
            key={faq._id}
            className="bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <button
              onClick={() => toggleFaq(faq._id)}
              className="w-full cursor-pointer bg-[var(--gray-50)] flex items-center justify-between p-5 text-left hover:bg-gray-200 transition-colors"
            >
              <div className="flex items-center gap-3">
                <img
                  src="/dashboard/instructor/title.png"
                  alt="Title"
                  className="w-[13px] h-[14px]"
                />
                <span className="text-lg font-medium text-gray-900">
                  {faq.question}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFaq(faq._id);
                  }}
                  className="p-1 hover:bg-red-100 rounded-full transition-colors"
                >
                  <X size={16} className="text-red-500" />
                </button>
                <div
                  className={`w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center transition-transform ${
                    expandedFaqs[faq._id] ? "rotate-180" : ""
                  }`}
                >
                  <ChevronDown size={20} className="text-white" />
                </div>
              </div>
            </button>
            {expandedFaqs[faq._id] && (
              <div className="px-5 pb-5 pt-2 text-gray-600">
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tags Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Tags</h2>
        <div className="border border-[var(--gray-100)] p-2 rounded-[8px]">
          <div className="flex gap-3 flex-wrap items-center">
            {tags.map((tag, index) => (
              <div
                key={index}
                className="bg-[var(--gray-50)] border border-[var(--gray-100)] px-4 py-2 flex items-center gap-2"
              >
                <span className="text-gray-700">{tag}</span>
                <button
                  onClick={() => removeTag(tag)}
                  className="text-gray-400 cursor-pointer hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              </div>
            ))}

            {showTagInput ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTag()}
                  placeholder="Enter tag"
                  className="px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
                <button
                  onClick={addTag}
                  className="text-indigo-900 hover:text-indigo-700 font-medium"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowTagInput(false);
                    setNewTag("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowTagInput(true)}
                className="bg-[var(--indigo-900)] cursor-pointer hover:bg-indigo-800 text-white px-4 py-2 rounded-full flex items-center gap-1 transition-colors"
              >
                <Plus size={16} />
                Add Tag
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Message to Reviewer */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Message to a reviewer
        </h2>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          placeholder="Enter your message here..."
        />
      </div>

      {/* Copyright Notice */}
      <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200">
        <button
          onClick={() => setIsChecked(!isChecked)}
          className="flex-shrink-0 mt-1"
        >
          <div
            className={`w-5 h-5 cursor-pointer rounded flex items-center justify-center transition-colors ${
              isChecked ? "bg-red-500" : "bg-white border-2 border-gray-300"
            }`}
          >
            {isChecked && (
              <svg
                className="w-3 h-3 text-white"
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
        <p className="text-sm text-gray-700 leading-relaxed">
          Any images, sounds, or other assets that are not my own work, have
          been appropriately licensed for use in the file preview or main
          course. Other than these items, this work is entirely my own and I
          have full rights to sell it here.
        </p>
      </div>

      {/* Save and Continue Button */}
      <div className="flex justify-end mt-8">
        <button
          onClick={handleSaveAndContinue}
          disabled={isLoading}
          className="bg-[var(--indigo-900)] cursor-pointer hover:bg-indigo-800 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg transition-colors flex items-center gap-2"
        >
          {isLoading ? 'Saving...' : 'Save & Continue'}
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-100 p-4">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Add New FAQ
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setNewFaqTitle("");
                    setNewFaqAnswer("");
                  }}
                  className="text-gray-400 cursor-pointer hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newFaqTitle}
                  onChange={(e) => setNewFaqTitle(e.target.value)}
                  placeholder="Enter Title"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors text-gray-600"
                />
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-2">
                  Answer
                </label>
                <textarea
                  value={newFaqAnswer}
                  onChange={(e) => setNewFaqAnswer(e.target.value)}
                  placeholder="Enter Answer"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors text-gray-600 h-40 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setNewFaqTitle("");
                    setNewFaqAnswer("");
                  }}
                  className="px-6 py-3 cursor-pointer border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addFaq}
                  className="px-6 py-3 cursor-pointer bg-indigo-900 hover:bg-indigo-800 text-white rounded-lg transition-colors"
                >
                  Add FAQ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
