import React, { useState, useEffect } from "react";
import { X, Upload, Youtube, Video, FileText } from "lucide-react";
import RichTextEditor from "@/components/ui/RichTextEditor";
import toast from "react-hot-toast";

const LectureFormModal = ({
  isOpen,
  onClose,
  selectedLectureType,
  lectureTitle,
  setLectureTitle,
  lectureDuration,
  setLectureDuration,
  lectureSummary,
  setLectureSummary,
  youtubeUrl,
  setYoutubeUrl,
  lectureText,
  setLectureText,
  uploadedFile,
  setUploadedFile,
  isFileUploading,
  isExtractingDuration,
  onSubmit,
  editingLectureId,
  handleYouTubeUrlChange,
  handleFileUpload,
}) => {
  if (!isOpen) return null;

  const lectureTypeConfig = {
    prerecorded: { icon: Video, label: "Pre Recorded Video" },
    youtube: { icon: Youtube, label: "Youtube Video" },
    document: { icon: Upload, label: "Upload Document" },
    text: { icon: FileText, label: "Text Content" },
  };

  const config = lectureTypeConfig[selectedLectureType];
  const IconComponent = config?.icon;

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {IconComponent && (
              <div className="bg-[var(--indigo-800)] p-2 rounded-full">
                <IconComponent size={20} className="text-white" />
              </div>
            )}
            <h2 className="text-xl font-semibold text-gray-900">
              {editingLectureId ? "Edit" : "Add"} {config?.label}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lecture Title *
            </label>
            <input
              type="text"
              value={lectureTitle}
              onChange={(e) => setLectureTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter lecture title"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (HH:MM:SS)
              {isExtractingDuration && (
                <span className="text-blue-500 ml-2">Extracting...</span>
              )}
            </label>
            <input
              type="text"
              value={lectureDuration}
              onChange={(e) => setLectureDuration(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="00:00:00"
              pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
            />
          </div>

          {/* Content based on type */}
          {selectedLectureType === "prerecorded" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Video File *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="video-upload"
                />
                <label
                  htmlFor="video-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload size={32} className="text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {uploadedFile
                      ? uploadedFile.name
                      : "Click to upload video file"}
                  </span>
                </label>
              </div>
            </div>
          )}

          {selectedLectureType === "youtube" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube URL *
              </label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => handleYouTubeUrlChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
          )}

          {selectedLectureType === "document" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Document *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="document-upload"
                />
                <label
                  htmlFor="document-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload size={32} className="text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {uploadedFile
                      ? uploadedFile.name
                      : "Click to upload document"}
                  </span>
                </label>
              </div>
            </div>
          )}

          {selectedLectureType === "text" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Content *
              </label>
              <textarea
                value={lectureText}
                onChange={(e) => setLectureText(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your text content here..."
              />
            </div>
          )}

          {/* Summary - only for non-prerecorded types */}
          {selectedLectureType !== "prerecorded" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lecture Summary
              </label>
              <RichTextEditor
                value={lectureSummary}
                onChange={setLectureSummary}
                placeholder="Enter lecture summary..."
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isFileUploading}
            className="px-6 py-2 bg-[var(--indigo-800)] hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            {isFileUploading
              ? "Uploading..."
              : editingLectureId
              ? "Update Content"
              : "Add Content"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LectureFormModal;