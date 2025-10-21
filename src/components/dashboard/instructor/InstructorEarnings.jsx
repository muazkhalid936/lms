import React, { useState, useEffect } from 'react';
import EarningsService from '@/lib/services/earningsService';
import { FaMoneyBillWave, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const InstructorEarnings = () => {
  const [earnings, setEarnings] = useState([]);
  const [summary, setSummary] = useState({
    totalEarnings: 0,
    totalTransactions: 0,
    pendingPayout: 0,
    processedPayout: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchEarnings();
  }, [currentPage]);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await EarningsService.getInstructorEarnings({
        page: currentPage,
        limit: 10
      });
      
      if (result.success) {
        setEarnings(result.data.earnings || []);
        setSummary(result.data.summary || {});
        setPagination(result.data.pagination || {});
      } else {
        throw new Error(result.message || 'Failed to fetch earnings');
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPayoutStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaClock className="text-yellow-600" />;
      case 'processed':
        return <FaCheckCircle className="text-green-600" />;
      case 'failed':
        return <FaExclamationTriangle className="text-red-600" />;
      default:
        return <FaClock className="text-gray-600" />;
    }
  };

  if (loading && currentPage === 1) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 text-red-600">
          <FaExclamationTriangle />
          <div>
            <h3 className="font-medium">Failed to load earnings</h3>
            <p className="text-sm text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      {/* Header with Summary */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FaMoneyBillWave className="text-green-600" />
            Earnings Overview
          </h2>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-green-600 text-sm font-medium">Total Earnings</div>
            <div className="text-2xl font-bold text-green-800">
              {EarningsService.formatCurrency(summary.totalEarnings || 0)}
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-blue-600 text-sm font-medium">Transactions</div>
            <div className="text-2xl font-bold text-blue-800">
              {summary.totalTransactions || 0}
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-yellow-600 text-sm font-medium">Pending Payout</div>
            <div className="text-2xl font-bold text-yellow-800">
              {EarningsService.formatCurrency(summary.pendingPayout || 0)}
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-purple-600 text-sm font-medium">Processed</div>
            <div className="text-2xl font-bold text-purple-800">
              {EarningsService.formatCurrency(summary.processedPayout || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Earnings List */}
      <div className="p-6">
        {earnings.length === 0 ? (
          <div className="text-center py-8">
            <FaMoneyBillWave className="text-4xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No earnings yet</h3>
            <p className="text-gray-500">
              Start creating and selling courses to see your earnings here.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {earnings.map((earning) => (
                <div
                  key={earning._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                      {earning.course?.thumbnail?.url ? (
                        <img
                          src={earning.course.thumbnail.url}
                          alt={earning.course.courseTitle}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <FaMoneyBillWave className="text-green-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {earning.course?.courseTitle || 'Course Purchase'}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Student: {earning.student?.firstName} {earning.student?.lastName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(earning.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      {EarningsService.formatCurrency(earning.instructorEarnings)}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {getPayoutStatusIcon(earning.payoutStatus)}
                      <span className={`text-xs px-2 py-1 rounded-full ${EarningsService.getPayoutStatusColor(earning.payoutStatus)}`}>
                        {EarningsService.getPayoutStatusText(earning.payoutStatus)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, pagination.totalItems)} of {pagination.totalItems} earnings
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={!pagination.hasPrev}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={!pagination.hasNext}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InstructorEarnings;