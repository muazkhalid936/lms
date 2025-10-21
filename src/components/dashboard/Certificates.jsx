"use client"
import React, { useState } from "react";
import { Eye, Download, ChevronLeft, ChevronRight } from "lucide-react";

const Certificates = ({
  certificates = [],
  itemsPerPage = 10,
  onViewCertificate = () => {},
  onDownloadCertificate = () => {},
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const totalPages = Math.ceil(certificates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCertificates = certificates.slice(startIndex, endIndex);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const renderPaginationButton = (page) => (
    <button
      key={page}
      onClick={() => setCurrentPage(page)}
      className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
        currentPage === page
          ? "bg-red-500 text-white"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {page}
    </button>
  );

  return (
    <div className="mx-auto px-6 min-h-screen">
      <h1 className="text-[20px] font-bold border-b border-[var(--gray-100)] pb-4 text-gray-900 mb-6">Certificates</h1>

      {/* Certificates Table */}
      <div className="bg-white rounded-[10px] shadow-sm border border-gray-100 overflow-hidden">
        {currentCertificates.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--gray-50)] border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 w-20">
                      ID
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 w-50">
                      Certificate Name
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 w-40">
                      Date
                    </th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-gray-900 w-24">
                      Marks
                    </th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-gray-900 w-24">
                      Out Of
                    </th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-gray-900 w-32">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentCertificates.map((certificate, index) => (
                    <tr
                      key={certificate.id}
                      className="border-b border-gray-100 h-[10px] hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-[var(--gray-600)]">
                          {String(startIndex + index + 1).padStart(2, "0")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[var(--gray-900)] text-[14px]">
                          {certificate.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[var(--gray-600)] text-[14px]">
                          {formatDate(certificate.date)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-[var(--gray-600)] text-[14px]">
                          {certificate.marks}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-[var(--gray-600)] text-[14px]">
                          {certificate.outOf}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-10">
                          <Eye className="w-4 h-4 text-[var(--gray-600)] group-hover:text-gray-800" />
                          <Download className="w-4 h-4 text-[var(--gray-600)] group-hover:text-gray-800" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded-md text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="flex gap-1">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const pageNumber =
                        Math.max(1, Math.min(totalPages - 4, currentPage - 2)) +
                        i;
                      return renderPaginationButton(pageNumber);
                    })}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-1 rounded-md text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No certificates found
            </h3>
            <p className="text-gray-500">
              Complete courses to earn certificates and see them here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Certificates;
