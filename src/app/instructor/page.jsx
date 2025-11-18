"use client";
import Header from "@/components/landing/Header";
import Navbar from "@/components/landing/Navbar";
import React, { useState, useEffect } from "react";
import InstructorPublicService from "@/lib/services/instructorPublicService";

import InstructorCard from "@/components/landing/InstructorCard";
import Footer from "@/components/landing/Footer";

const InstructorPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  
  // API state
  const [allInstructors, setAllInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch instructors from API
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await InstructorPublicService.getAllInstructors({
          limit: 100 // Get all instructors for filtering
        });
        console.log(result)
        if (result.success) {
          setAllInstructors(result.data);
        } else {
          setError(result.message || 'Failed to fetch instructors');
        }
      } catch (err) {
        setError('An error occurred while fetching instructors');
        console.error('Error fetching instructors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructors();
  }, []);

  // pagination
  const total = allInstructors.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageData = allInstructors.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <Navbar />
      <Header title="Instructor Grid" />
      <div className="max-w-[1440px] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            // Loading skeleton
            Array.from({ length: pageSize }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded mb-4"></div>
                <div className="h-3 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded"></div>
              </div>
            ))
          ) : error ? (
            // Error state
            <div className="col-span-full text-center py-8">
              <div className="text-red-500 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-semibold">Error Loading Instructors</p>
                <p className="text-sm text-gray-600 mt-2">{error}</p>
              </div>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-rose-500 text-white rounded hover:bg-rose-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : pageData.length === 0 ? (
            // No results state
            <div className="col-span-full text-center py-8">
              <div className="text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-lg font-semibold">No Instructors Found</p>
                <p className="text-sm text-gray-600 mt-2">No instructors available at the moment</p>
              </div>
            </div>
          ) : (
            // Instructor cards
            pageData.map((instr) => (
              <InstructorCard key={instr.id} instr={instr} />
            ))
          )}
        </div>

        {/* Pagination controls */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </div>

          <div className="flex items-center gap-2">
            <button
              aria-label="Previous page"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-full bg-[#F8F8F8] flex items-center justify-center disabled:opacity-50"
            >
              ‹
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pNum) => (
                <button
                  key={pNum}
                  onClick={() => setPage(pNum)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center  ${
                    pNum === page
                      ? "bg-rose-500 text-white"
                      : "bg-[#F8F8F8] text-gray-700"
                  }`}
                >
                  {pNum}
                </button>
              )
            )}

            <button
              aria-label="Next page"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 rounded-full bg-[#F8F8F8] flex items-center justify-center disabled:opacity-50"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default InstructorPage;
