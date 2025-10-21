"use client"
import React, { useState, useEffect } from "react";
import { Search, ChevronDown, RefreshCw } from "lucide-react";
import Order from "./home/Order";
import OrderService from "@/lib/services/orderService";
import toast from "react-hot-toast";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalSpent: 0,
    completedOrders: 0,
    pendingOrders: 0
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false
  });

  useEffect(() => {
    fetchOrderHistory();
  }, [statusFilter]);

  const fetchOrderHistory = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page,
        limit: 10,
        ...(statusFilter && { status: statusFilter })
      };

      const response = await OrderService.getOrderHistory(params);
      
      if (response.success) {
        setOrders(response.data.orders || []);
        setSummary(response.data.summary || {});
        setPagination(response.data.pagination || {});
      } else {
        throw new Error(response.message || 'Failed to fetch order history');
      }
    } catch (error) {
      console.error('Error fetching order history:', error);
      setError(error.message);
      toast.error('Failed to load order history');
      
      // Fallback to empty state
      setOrders([]);
      setSummary({
        totalOrders: 0,
        totalSpent: 0,
        completedOrders: 0,
        pendingOrders: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchOrderHistory(pagination.currentPage);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchOrderHistory(newPage);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.orderId
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
      order.courseName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      !statusFilter ||
      order.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleViewOrder = (orderId) => {
    // Find the order and show course details or navigate to course
    const order = orders.find(o => o.orderId === orderId || o.id === orderId);
    if (order && order.courseId) {
      // Navigate to course page
      window.open(`/courses/${order.courseId}`, '_blank');
    }
  };

  const handleDownloadOrder = async (orderId) => {
    const order = orders.find(o => o.orderId === orderId || o.id === orderId);
    if (order) {
      try {
        await OrderService.downloadReceipt(order);
        console.log('Invoice downloaded:', order);
        toast.success('Invoice downloaded successfully!');
      } catch (error) {
        console.error('Error downloading invoice:', error);
        toast.error('Failed to download invoice. Please try again.');
      }
    }
  };

  return (
    <div className="mx-auto px-6 pb-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-[20px] font-bold text-gray-900">
            Order History
          </h1>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className={`p-2 rounded-lg transition-colors ${
              loading 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Refresh order history"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        
        {/* Summary Stats */}
        {!loading && !error && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-600">Total Orders</p>
              <p className="text-lg font-semibold text-blue-900">{summary.totalOrders}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-600">Total Spent</p>
              <p className="text-lg font-semibold text-green-900">
                {OrderService.formatCurrency(summary.totalSpent)}
              </p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-sm text-purple-600">Completed</p>
              <p className="text-lg font-semibold text-purple-900">{summary.completedOrders}</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-sm text-yellow-600">Pending</p>
              <p className="text-lg font-semibold text-yellow-900">{summary.pendingOrders}</p>
            </div>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600 text-sm">
            Error loading order history: {error}
          </p>
          <button
            onClick={handleRefresh}
            className="mt-2 text-red-600 underline text-sm"
          >
            Try again
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            disabled={loading}
            className="w-full text-[14px] sm:w-auto appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="cancelled">Cancelled</option>
            <option value="failed">Failed</option>
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {/* Search */}
        <div className="relative flex-1 sm:flex-initial sm:w-64">
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 
             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
             placeholder:text-gray-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-[10px] border border-gray-200 overflow-hidden">
        <div className="bg-[var(--gray-50)] border-b border-gray-200">
          <div className="flex items-center py-4 px-6 font-semibold text-black">
            <div className="flex-1 min-w-0">Order ID</div>
            <div className="flex-1 min-w-0 px-4">Course</div>
            <div className="flex-1 min-w-0 px-4">Date</div>
            <div className="flex-1 min-w-0 px-4">Amount</div>
            <div className="flex-1 min-w-0 px-4">Status</div>
            <div className="w-24 text-center">Actions</div>
          </div>
        </div>
        <div>
          {loading ? (
            <div className="py-12 text-center text-gray-500">
              <RefreshCw className="animate-spin w-6 h-6 mx-auto mb-2" />
              Loading orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              {orders.length === 0 
                ? "No orders found. Start learning by purchasing a course!"
                : "No orders found matching your criteria."
              }
            </div>
          ) : (
            filteredOrders.map((order, index) => (
              <Order
                key={`${order.id}-${index}`}
                orderId={order.orderId}
                courseName={order.courseName}
                courseImage={order.courseImage}
                date={OrderService.formatDate(order.enrolledAt)}
                amount={OrderService.formatCurrency(order.amount)}
                originalAmount={order.originalAmount}
                isFreeCourse={order.isFreeCourse}
                hasDiscount={order.hasDiscount}
                status={order.status}
                paymentMethod={order.paymentMethod}
                progress={order.progress}
                onView={handleViewOrder}
                onDownload={handleDownloadOrder}
              />
            ))
          )}
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden">
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 py-12 text-center text-gray-500">
            <RefreshCw className="animate-spin w-6 h-6 mx-auto mb-2" />
            Loading orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 py-12 text-center text-gray-500">
            {orders.length === 0 
              ? "No orders found. Start learning by purchasing a course!"
              : "No orders found matching your criteria."
            }
          </div>
        ) : (
          filteredOrders.map((order, index) => (
            <Order
              key={`${order.id}-${index}`}
              orderId={order.orderId}
              courseName={order.courseName}
              courseImage={order.courseImage}
              date={OrderService.formatDate(order.enrolledAt)}
              amount={OrderService.formatCurrency(order.amount)}
              originalAmount={order.originalAmount}
              isFreeCourse={order.isFreeCourse}
              hasDiscount={order.hasDiscount}
              status={order.status}
              paymentMethod={order.paymentMethod}
              progress={order.progress}
              onView={handleViewOrder}
              onDownload={handleDownloadOrder}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-600">
            Showing {((pagination.currentPage - 1) * 10) + 1} to {Math.min(pagination.currentPage * 10, pagination.totalItems)} of {pagination.totalItems} orders
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrev}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md">
              {pagination.currentPage}
            </span>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNext}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Results Summary */}
      {!loading && filteredOrders.length > 0 && (
        <div className="mt-6 text-sm text-gray-600 text-center sm:text-left">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
