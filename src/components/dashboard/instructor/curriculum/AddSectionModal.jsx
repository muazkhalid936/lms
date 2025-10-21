import React from "react";
import { X } from "lucide-react";

const AddSectionModal = ({
  isOpen,
  onClose,
  sectionName,
  setSectionName,
  onSubmit,
  addingSection,
  isEditing = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? "Edit Section" : "Add New Section"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section Name *
            </label>
            <input
              type="text"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter section name"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && sectionName.trim()) {
                  onSubmit();
                }
              }}
            />
          </div>
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
            disabled={!sectionName.trim() || addingSection}
            className="px-6 py-2 bg-[var(--indigo-800)] hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            {addingSection
              ? "Adding..."
              : isEditing
              ? "Update Section"
              : "Add Section"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSectionModal;