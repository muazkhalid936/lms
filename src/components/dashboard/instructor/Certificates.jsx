"use client";
import React, { useState } from "react";
import {
  X,
  Plus,
  FolderOpen,
  Upload,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import CertificateCard from "./CertificateCard";

const ViewModal = ({ certificate, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-100 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 rounded-full bg-white hover:bg-gray-100 transition-colors z-10"
        aria-label="Close modal"
      >
        <X className="w-6 h-6 text-gray-800" />
      </button>

      <div
        className="max-w-6xl max-h-full overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={certificate.imageSrc}
          alt={certificate.name}
          className="w-full h-auto"
        />
      </div>
    </div>
  );
};

const AddCertificateModal = ({ onClose, onSubmit }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onSubmit(selectedFile);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center pb-4 border-b border-[var(--gray-100)]  justify-between mb-6">
          <h2 className="text-[16px] font-bold text-gray-800">
            Add New Certificate
          </h2>
          <button
            onClick={onClose}
            className="p-2 cursor-pointer rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="mb-8">
          <h3 className="text-[14px] font-medium text-gray-800 mb-4">
            Attachment
          </h3>

          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-800" />
            <p className="text-gray-600 text-lg mb-2">
              Drag and drop our files
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Accept File Type : doc,docx,jpg,jpeg,png,txt,pdf
            </p>

            <label className="inline-block">
              <input
                type="file"
                className="hidden"
                accept=".doc,.docx,.jpg,.jpeg,.png,.txt,.pdf"
                onChange={handleFileChange}
              />
              <span className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--rose-500)] hover:bg-pink-600 text-white rounded-full cursor-pointer transition-colors">
                <Upload className="w-5 h-5" />
                Upload
              </span>
            </label>

            {selectedFile && (
              <p className="mt-4 text-green-600 font-medium">
                Selected: {selectedFile.name}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="cursor-pointer px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="cursor-pointer px-8 py-3 bg-[var(--rose-500)] hover:bg-pink-600 text-white rounded-full transition-colors font-medium"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState([
    {
      id: 1,
      imageSrc: "/dashboard/instructor/cert.png",
      name: "Kelly Richardson",
      title: "Certificate 01",
    },
    {
      id: 2,
      imageSrc: "/dashboard/instructor/cert.png",
      name: "Kelly Richardson",
      title: "Certificate 01",
    },
    {
      id: 3,
      imageSrc: "/dashboard/instructor/cert.png",
      name: "Kelly Richardson",
      title: "Certificate 01",
    },
    {
      id: 4,
      imageSrc: "/dashboard/instructor/cert.png",
      name: "Kelly Richardson",
      title: "Certificate 01",
    },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [viewingCertificate, setViewingCertificate] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const itemsPerPage = 4;
  const totalPages = Math.ceil(certificates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCertificates = certificates.slice(startIndex, endIndex);

  const handleView = (certificate) => {
    setViewingCertificate(certificate);
  };

  const handleEdit = (certificate) => {
    //console.log("Edit certificate:", certificate);
  };

  const handleDelete = (certificate) => {
    setCertificates(certificates.filter((cert) => cert.id !== certificate.id));
  };

  const handleAddCertificate = (file) => {
    const newCertificate = {
      id: certificates.length + 1,
      imageSrc: URL.createObjectURL(file),
      name: file.name,
      title: `Certificate ${certificates.length + 1}`,
    };
    setCertificates([...certificates, newCertificate]);
    setShowAddModal(false);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="min-h-screen p-6 md:pt-0">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between border-b border-[var(--gray-100)] pb-4 mb-4">
          <h1 className="text-[20px] font-bold text-gray-800">Certificates</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className=" inline-flex items-center gap-2 px-6 py-3 bg-[var(--rose-500)] cursor-pointer hover:bg-pink-600 text-white rounded-full transition-colors font-medium shadow-md"
          >
            <div className="rounded-full bg-transparent border">
              <Plus size={15} className="text-white" />
            </div>
            Add Certificates
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {currentCertificates.map((certificate) => (
            <CertificateCard
              key={certificate.id}
              certificate={certificate}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`cursor-pointer p-2 rounded-full transition-colors ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white hover:bg-gray-100 text-gray-700 shadow-md"
              }`}
              aria-label="Previous page"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* <span className="text-gray-700 font-medium">
              Page {currentPage} of {totalPages}
            </span> */}

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`cursor-pointer p-2 rounded-full transition-colors ${
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white hover:bg-gray-100 text-gray-700 shadow-md"
              }`}
              aria-label="Next page"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}

        {viewingCertificate && (
          <ViewModal
            certificate={viewingCertificate}
            onClose={() => setViewingCertificate(null)}
          />
        )}

        {showAddModal && (
          <AddCertificateModal
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAddCertificate}
          />
        )}
      </div>
    </div>
  );
}
