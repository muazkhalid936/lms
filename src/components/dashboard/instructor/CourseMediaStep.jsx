import React, { useState, useEffect } from 'react';
import { Upload, Image, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCourse } from '@/contexts/CourseContext';

export default function CourseMediaStep({ onNext }) {
  const { currentCourse, uploadThumbnail, isLoading } = useCourse();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isFeatured, setIsFeatured] = useState(false);
  const [mediaType, setMediaType] = useState('');
  const [existingThumbnail, setExistingThumbnail] = useState(null);

  // Set initial values when currentCourse is available
  useEffect(() => {
    if (currentCourse) {
      setIsFeatured(currentCourse.isFeatured || false);
      setExistingThumbnail(currentCourse.thumbnail?.url || null);
    }
  }, [currentCourse]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadClick = () => {
    document.getElementById('file-input').click();
  };

  const handleSaveAndContinue = async () => {
    if (!currentCourse) {
      alert('Please complete the course information step first');
      return;
    }

    // If there's a selected file, upload it
    if (selectedFile) {
      try {
        const result = await uploadThumbnail(currentCourse._id, selectedFile, isFeatured);
        if (result) {
          onNext();
        }
      } catch (error) {
        console.error('Error uploading thumbnail:', error);
      }
    } else if (existingThumbnail) {
      // If no new file but there's an existing thumbnail, just proceed
      // You might want to update the isFeatured status if it changed
      onNext();
    } else {
      alert('Please select a thumbnail image');
      return;
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto bg-white">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-[20px] font-bold text-[var(--gray-900)] mb-2">Course Media</h1>
        <p className="text-[14px] text-[var(--gray-600)]">
          Intro Course overview provider type. (.mp4, Youtube, Video etc.)
        </p>
      </div>

      {/* Course Thumbnail Section */}
      <div className="mb-6">
        <label className="block text-lg font-semibold text-[14px] text-[var(--gray-900)] mb-4">
          Course Thumbnail <span className="text-[var(--rose-500)]">*</span>
        </label>

        {/* File Upload Area */}
        <div className="mb-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className=" border border-[var(--gray-100)] rounded-[6px] px-4 py-3">
                <span className="text-gray-500">
                  {selectedFile ? selectedFile.name : 'No File Selected'}
                </span>
              </div>
            </div>
            <button
              onClick={handleUploadClick}
              className="bg-[var(--indigo-900)] cursor-pointer hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Upload File
            </button>
          </div>
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Image Upload Drop Zone */}
        <div className="border-2 border-[var(--gray-100)] rounded-[8px] p-8 text-center bg-[var(--gray-50)] hover:bg-gray-100 transition-colors">
          {/* Show existing thumbnail or upload area */}
          {existingThumbnail && !selectedFile ? (
            <div className="flex flex-col items-center">
              <div className="mb-4">
                <img 
                  src={existingThumbnail} 
                  alt="Current thumbnail" 
                  className="w-32 h-24 object-cover rounded-lg"
                />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Current Thumbnail</h3>
              <p className="text-gray-500 mb-4">
                This is your current course thumbnail
              </p>
              <button
                onClick={handleUploadClick}
                className="bg-[var(--indigo-900)] cursor-pointer hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Change Thumbnail
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Image className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {selectedFile ? 'New Image Selected' : 'Upload Image'}
              </h3>
              <p className="text-gray-500">
                JPEG, PNG, GIF, and WebP formats, up to 10 MB
              </p>
              {selectedFile && (
                <p className="text-green-600 mt-2 font-medium">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Featured Course Toggle */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFeatured(!isFeatured)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isFeatured ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isFeatured ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="text-[16px] text-gray-900">Check this for featured course</span>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveAndContinue}
          disabled={isLoading || (!selectedFile && !existingThumbnail)}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            isLoading || (!selectedFile && !existingThumbnail)
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-red-500 text-white hover:bg-red-600 cursor-pointer"
          }`}
        >
          {isLoading ? "Uploading..." : selectedFile ? "Upload & Continue" : "Save & Continue"}
        </button>
      </div>
    </div>
  );
}