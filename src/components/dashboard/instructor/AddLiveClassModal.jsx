"use client";
import React from "react";
import { X, Calendar, Clock, Users, Globe, Lock } from "lucide-react";

const AddLiveClassModal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  courses,
  editingClass = null,
  isSubmitting = false,
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingClass ? "Edit Live Class" : "Create New Live Class"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              placeholder="Enter class title"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              placeholder="Enter class description"
              rows="3"
              disabled={isSubmitting}
            />
          </div>

          {/* Course Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course *
            </label>
            <select
              value={formData.courseId}
              onChange={(e) => handleInputChange("courseId", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              required
              disabled={isSubmitting}
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.courseTitle}
                </option>
              ))}
            </select>
          </div>

          {/* Schedule and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-1" />
                Scheduled Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledDate}
                onChange={(e) => handleInputChange("scheduledDate", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock size={16} className="inline mr-1" />
                Duration (minutes) *
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => handleInputChange("duration", parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                min="15"
                max="480"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Max Participants */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users size={16} className="inline mr-1" />
              Maximum Participants
            </label>
            <input
              type="number"
              value={formData.maxParticipants}
              onChange={(e) => handleInputChange("maxParticipants", parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              min="1"
              max="1000"
              disabled={isSubmitting}
            />
          </div>

          {/* Settings */}
          {/* <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Settings</h3>

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => handleInputChange("isPublic", e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  disabled={isSubmitting}
                />
                <span className="ml-2 text-sm text-gray-700 flex items-center">
                  {formData.isPublic ? (
                    <Globe size={14} className="mr-1 text-green-600" />
                  ) : (
                    <Lock size={14} className="mr-1 text-gray-600" />
                  )}
                  Make this class public
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.requiresRegistration}
                  onChange={(e) => handleInputChange("requiresRegistration", e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  disabled={isSubmitting}
                />
                <span className="ml-2 text-sm text-gray-700">
                  Require registration
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.sendReminders}
                  onChange={(e) => handleInputChange("sendReminders", e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  disabled={isSubmitting}
                />
                <span className="ml-2 text-sm text-gray-700">
                  Send email reminders
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.recordSession}
                  onChange={(e) => handleInputChange("recordSession", e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  disabled={isSubmitting}
                />
                <span className="ml-2 text-sm text-gray-700">
                  Record session
                </span>
              </label>
            </div>
          </div> */}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? editingClass
                  ? "Updating..."
                  : "Creating..."
                : editingClass
                ? "Update Class"
                : "Create Class"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLiveClassModal;