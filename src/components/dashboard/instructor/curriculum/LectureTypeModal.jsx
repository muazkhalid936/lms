import React from "react";
import { X, Video, Youtube, Upload, HelpCircle } from "lucide-react";

const LectureTypeModal = ({
  isOpen,
  onClose,
  onSelectType,
}) => {
  if (!isOpen) return null;

  const lectureTypes = [
    { id: "prerecorded", label: "Pre Recorded Video", icon: Video },
    { id: "youtube", label: "Youtube Video", icon: Youtube },
    { id: "document", label: "Upload Document", icon: Upload },
    { id: "quiz", label: "Quiz", icon: HelpCircle },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Select Content Type
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            {lectureTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => onSelectType(type.id)}
                  className="flex flex-col items-center gap-3 p-6 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors group"
                >
                  <div className="bg-[var(--indigo-800)] group-hover:bg-indigo-700 p-3 rounded-full transition-colors">
                    <IconComponent size={24} className="text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 text-center">
                    {type.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LectureTypeModal;