import React, { useState } from "react";
import { Copy, Eye, ChevronLeft, ChevronRight } from "lucide-react";

const ReferralsDashboard = ({
  netEarnings = 12000,
  balance = 15000,
  totalReferrals = 10,
  referralLink = "https://dreamslmscourse.com/refer/?refid=345re66",
  withdrawCommission = 25,
  withdrawThreshold = 10000,
  referralsData = [],
  itemsPerPage = 10,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [linkCopied, setLinkCopied] = useState(false);

  // Calculate pagination
  const totalPages = Math.ceil(referralsData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReferrals = referralsData.slice(startIndex, endIndex);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleWithdraw = () => {
    alert(`Withdrawing $${balance} to your bank account...`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const renderPaginationButton = (page) => (
    <button
      key={page}
      onClick={() => setCurrentPage(page)}
      className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
        currentPage === page
          ? "bg-[var(--rose-500)] text-white"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {page}
    </button>
  );

  return (
    <div className="mx-auto px-6 pb-6 lg:pr-20 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-[var(--gray-100)]">
        Referrals
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[var(--cyan-50)] rounded-2xl p-3 border border-cyan-100">
          <div className="flex items-center gap-4">
            <div className="bg-[var(--cyan-400)] rounded-2xl p-6">
              <img src="/dollar.png" className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-gray-500 text-sm mb-1">Net Earnings</h3>
              <p className="text-[20px] text-[var(--cyan-400)]">
                {formatCurrency(netEarnings)}
              </p>
              <p className="text-gray-500 text-xs">Earning this month</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--rose-50)] rounded-2xl p-3 border border-red-100">
          <div className="flex items-center gap-4">
            <div className="bg-[var(--rose-500)] rounded-2xl p-6">
              <img src="/wallet.png" className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-gray-500 text-sm mb-1">Balance</h3>
              <p className="text-[20px] text-[var(--rose-500)]">
                {formatCurrency(balance)}
              </p>
              <p className="text-gray-500 text-xs">In the Wallet</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--purple-50)] rounded-2xl p-3 border border-purple-100">
          <div className="flex items-center gap-4">
            <div className="bg-[var(--purple-600)] rounded-2xl p-6">
              <img src="/wallet.png" className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-gray-600 text-sm mb-1">No of Referrals</h3>
              <p className="text-[20px] text-[var(--purple-600)]">
                {totalReferrals}
              </p>
              <p className="text-gray-500 text-xs">In this month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Your Referral Link
          </h3>
          <p className="text-[var(--gray-600)] text-[15px] mb-4">
            You can earn easily money by copy and share
          </p>
          <div className="bg-gray-50 rounded-lg p-3 mb-4 font-mono text-sm text-gray-700 break-all">
            {referralLink}
          </div>
          <button
            onClick={handleCopyLink}
            className={`px-4 py-2 cursor-pointer rounded-full text-white text-sm font-medium transition-colors ${
              linkCopied
                ? "bg-green-500 hover:bg-green-600"
                : "bg-[var(--rose-500)] hover:bg-red-600"
            }`}
          >
            {linkCopied ? "Copied!" : "Copy link"}
          </button>
        </div>

        <div className="bg-white rounded-[10px] p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Withdraw Money
          </h3>
          <p className="text-[var(--gray-600)] text-[15px] mb-2">
            Withdraw securely to your bank account.
          </p>
          <p className="text-gray-500 text-[15px] mb-4">
            Commission is ${withdrawCommission} per transaction under{" "}
            {formatCurrency(withdrawThreshold)}
          </p>
          <button
            onClick={handleWithdraw}
            className="bg-[var(--rose-500)] cursor-pointer hover:bg-red-600 px-4 py-2 rounded-full text-white text-sm font-medium transition-colors"
          >
            Withdraw Money
          </button>
        </div>
      </div>

      {/* Referrals Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--gray-50)] border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--gray-900)]">
                  Referral ID
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--gray-900)]">
                  Referrals
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--gray-900)]">
                  URL
                </th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-[var(--gray-900)]">
                  Visit
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-[var(--gray-900)]">
                  Total Earned
                </th>
              </tr>
            </thead>
            <tbody>
              {currentReferrals.length > 0 ? (
                currentReferrals.map((referral, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-[var(--indigo-800)] text-sm">
                        {referral.id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <img src="/dashboard/avatar.png" className="w-[32px] h-[32px]" />
                        <span className="text-[var(--gray-600)] text-sm">
                          {referral.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[var(--gray-600)] text-xs font-mono max-w-xs">
                        ${referral.url}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-gray-600 text-sm">
                          {referral.visits}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-[var(--gray-600)] font-medium">
                        {formatCurrency(referral.earned)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No referrals data available
                  </td>
                </tr>
              )}
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

              <div className="flex gap-2">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNumber =
                    Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
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
      </div>
    </div>
  );
};

export default ReferralsDashboard;
