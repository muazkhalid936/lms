import { useState } from "react";
import { ChevronUp, ChevronDown, Download, Eye } from "lucide-react";

const SupportingMaterials = ({
  title = "Supporting Materials",
  sections = [],
}) => {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionIndex) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionIndex]: !prev[sectionIndex],
    }));
  };

  return (
    <div className="w-full mx-auto bg-white max-h-[80vh] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 sm:p-6 flex-shrink-0">
        <h1 className="text-lg sm:text-[20px] font-bold text-gray-900 truncate pr-2">
          {title}
        </h1>
      </div>

      {/* Sections */}
      <div className="border border-[var(--gray-100)] rounded-[10px] mx-2 sm:ml-5 p-2 sm:p-5 overflow-y-auto flex-1">
        <div className="divide-y divide-gray-200 space-y-2">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="bg-[var(--gray-100-50)]">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(sectionIndex)}
                className="w-full flex justify-between items-center p-3 sm:p-4 text-left hover:bg-[var(--gray-100)] transition-colors rounded-md bg-gray-100"
              >
                <h2 className="text-base sm:text-[20px] text-gray-900 truncate pr-2">
                  {section.title}
                </h2>
                {expandedSections[sectionIndex] ? (
                  <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                )}
              </button>

              {/* Section Content */}
              {expandedSections[sectionIndex] && (
                <div className="bg-white mt-2 rounded-md">
                  {section.files &&
                    section.files.map((file, fileIndex) => (
                      <div
                        key={fileIndex}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border-b border-[var(--gray-100)] last:border-b-0 hover:bg-gray-50 transition-colors gap-3 sm:gap-0"
                      >
                        {/* File Name */}
                        <div className="flex items-center flex-1 min-w-0">
                          <h3 className="text-[var(--gray-600)] text-xs sm:text-[14px] break-words">
                            {file.name}
                          </h3>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end sm:justify-start space-x-3 sm:space-x-5 flex-shrink-0">
                          <button className="flex items-center space-x-1 text-[var(--indigo-900)] text-xs sm:text-[14px] hover:text-blue-800 underline">
                            <span className="hidden lg:inline">Download</span>
                            <span className="lg:hidden">DL</span>
                            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <button className="flex items-center space-x-1 text-[var(--gray-600)] text-xs sm:text-[14px] hover:text-blue-800 underline">
                            <span>View</span>
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupportingMaterials;