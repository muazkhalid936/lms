"use client";
import React, { useMemo, useState, useEffect } from "react";
import toast from "react-hot-toast";
import Pagination from "@/components/common/Pagination";
import OnboardingCard from "./OnboardingCard";

const StatusBadge = ({ status }) => {
  const base =
    "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium";
  if (status === "Paid")
    return (
      <span className={`${base} bg-green-100 text-green-700`}>• Paid</span>
    );
  if (status === "Pending")
    return (
      <span className={`${base} bg-violet-100 text-violet-700`}>• Pending</span>
    );
  if (status === "Cancelled")
    return (
      <span className={`${base} bg-red-100 text-red-700`}>• Cancelled</span>
    );
  return <span className={`${base} bg-gray-100 text-gray-700`}>{status}</span>;
};

const GatewayCard = ({ id, label, selected, onClick, image }) => (
  <button
    onClick={() => onClick(id)}
    className={`flex items-center gap-4 border rounded-lg p-4 w-full md:w-auto hover:shadow-sm transition ${
      selected
        ? "border-rose-300 ring-1 ring-[#FF4667]"
        : "border-[var(--gray-100)]"
    }`}
  >
    <div className="flex items-center gap-3">
      <div
        className={`w-6 h-6 rounded-full border flex items-center justify-center ${
          selected ? "bg-rose-500 text-white" : "bg-white text-gray-400"
        }`}
      >
        {selected ? "●" : "○"}
      </div>
      {image ? (
        <img src={image} alt={label} className="h-6" />
      ) : (
        <span className="font-medium">{label}</span>
      )}
    </div>
  </button>
);

const TableRow = ({ id, date, amount, method, status }) => (
  <tr className="border-b last:border-b-0">
    <td className="py-4 px-4 text-sm text-[var(--gray-700)]">
      <a className="text-[#FF4667] hover:underline" href="#">
        {id}
      </a>
    </td>
    <td className="py-4 px-4 text-sm text-[var(--gray-600)]">{date}</td>
    <td className="py-4 px-4 text-sm text-[var(--gray-700)]">{amount}</td>
    <td className="py-4 px-4 text-sm text-[var(--gray-700)]">{method}</td>
    <td className="py-4 px-4 text-sm text-right">
      <StatusBadge status={status} />
    </td>
  </tr>
);

export default function PayoutsPage() {
  const all = [];

  const [paymentMethod, setPaymentMethod] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Real balance and payout states
  const [availableBalance, setAvailableBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutsEnabled, setPayoutsEnabled] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawError, setWithdrawError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch instructor stats to get pending payout (available balance)
        const statsRes = await fetch("/api/instructor/stats", {
          method: "GET",
          credentials: "include",
        });
        if (statsRes.ok) {
          const statsJson = await statsRes.json();
          const pending =
            statsJson?.data?.earningsBreakdown?.pendingPayout ?? 0;
          setAvailableBalance(pending);
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setBalanceLoading(false);
      }

      try {
        // Fetch Stripe account status to know if payouts are enabled
        const acctRes = await fetch("/api/stripe/connect/account-status", {
          method: "GET",
          credentials: "include",
        });
        if (acctRes.ok) {
          const acctJson = await acctRes.json();
          setPayoutsEnabled(!!acctJson?.account?.payoutsEnabled);
        }
      } catch (err) {
        console.error("Failed to fetch account status:", err);
      }
    };

    fetchData();
  }, []);

  const handleWithdraw = async () => {
    try {
      setPayoutLoading(true);
      // Validate amount input
      const amount = parseFloat((withdrawAmount || "").toString());
      if (isNaN(amount) || amount <= 0) {
        setWithdrawError("Enter a valid amount");
        setPayoutLoading(false);
        return;
      }
      if (amount > Number(availableBalance) + 0.0001) {
        setWithdrawError("Amount exceeds available balance");
        setPayoutLoading(false);
        return;
      }
      setWithdrawError("");

      // Send requested amount to server (server should expect `amount` in USD as number)
      const res = await fetch("/api/stripe/connect/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
        credentials: "include",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        // Refresh available balance after successful payout
        const statsRes = await fetch("/api/instructor/stats", {
          method: "GET",
          credentials: "include",
        });
        if (statsRes.ok) {
          const statsJson = await statsRes.json();
          const pending =
            statsJson?.data?.earningsBreakdown?.pendingPayout ?? 0;
          setAvailableBalance(pending);
          // clear amount input on success
          setWithdrawAmount("");
        }
        toast.success("Withdrawal requested successfully");
      } else {
        toast.error(json.message || "Failed to withdraw");
      }
    } catch (err) {
      console.error("Withdrawal error:", err);
      toast.error("Error requesting withdrawal");
    } finally {
      setPayoutLoading(false);
    }
  };

  const parsedWithdraw = (() => {
    const v = parseFloat((withdrawAmount || "").toString());
    return isNaN(v) ? 0 : v;
  })();
  const remainingBalance = Math.max(
    0,
    Number(availableBalance) - parsedWithdraw
  );

  const filtered = useMemo(() => {
    let data = all.slice();
    if (paymentMethod !== "all")
      data = data.filter((d) => d.method.toLowerCase().includes(paymentMethod));
    if (statusFilter !== "all")
      data = data.filter((d) => d.status === statusFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      data = data.filter(
        (d) =>
          d.id.toLowerCase().includes(q) || d.method.toLowerCase().includes(q)
      );
    }
    return data;
  }, [paymentMethod, statusFilter, query]);

  const totalItems = filtered.length;
  const rows = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, page]);

  return (
    <div className="mx-auto px-6 pb-6 bg-white">
      <h1 className="text-[20px] border-b border-[var(--gray-100)] pb-4 font-bold text-[var(--gray-900)] mb-6">
        Payouts
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 items-start">
        <div className="col-span-2">
          <OnboardingCard />
        </div>
        <div className="col-span-1 items-stretch h-full md:col-span-1">
          <div className="border  border-[var(--gray-100)] h-full  items-stretch rounded-[12px] p-4 bg-white ">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-gradient-to-br from-rose-50 to-rose-100">
                <div className="text-2xl font-bold text-[#FF4667]">$</div>
              </div>
              {/* Withdraw Input Section */}
              <div className="mt-4">
                <label className="text-xs text-[var(--gray-600)] mb-1 block">
                  Withdraw amount
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="border  border-[var(--gray-100)] rounded-md px-3 py-2 text-sm flex-1 
                 focus:outline-none focus:ring-1 focus:ring-gray-300 
                 focus:border-gray-300 transition-all"
                    disabled={
                      !payoutsEnabled || payoutLoading || balanceLoading
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(String(availableBalance))}
                    disabled={
                      !payoutsEnabled || payoutLoading || availableBalance <= 0
                    }
                    className="px-3 py-2 text-sm rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100 transition"
                  >
                    Max
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs text-red-600">
                    {withdrawError || ""}
                  </div>
                  <div className="text-xs text-[var(--gray-500)]">
                    Remaining:{" "}
                    <span className="font-medium text-[var(--gray-900)]">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(remainingBalance)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handleWithdraw}
                    disabled={
                      !payoutsEnabled ||
                      payoutLoading ||
                      Number(availableBalance) <= 0
                    }
                    className={`flex-1 px-4 py-2 rounded-md text-white text-sm 
                  ${
                    !payoutsEnabled || Number(availableBalance) <= 0
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-black hover:bg-gray-800"
                  } 
                  transition`}
                  >
                    {payoutLoading ? "Withdrawing…" : "Withdraw"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setWithdrawAmount("");
                      setWithdrawError("");
                    }}
                    className="px-4 py-2 rounded-md border border-gray-200 bg-white text-sm hover:bg-gray-50 transition"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* filters and table */}
      <div className="border border-[var(--gray-100)] rounded-[10px] p-6 bg-white">
        <div className="flex items-center justify-between mb-4 gap-4">
          <div className="flex items-center gap-3">
            {/* <select value={paymentMethod} onChange={(e) => { setPaymentMethod(e.target.value); setPage(1); }} className="border rounded px-3 py-2 text-sm">
              <option value="all">Payment Method</option>
              <option value="paypal">PayPal</option>
              <option value="stripe">Stripe</option>
              <option value="bank transfer">Bank Transfer</option>
            </select> */}

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="border rounded px-3 py-2 text-sm"
            >
              <option value="all">Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-1/3">
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search"
              className="border rounded px-3 py-2 text-sm w-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-[var(--gray-50)]">
                <th className="text-left py-3 px-4 text-sm text-[var(--gray-600)]">
                  ID
                </th>
                <th className="text-left py-3 px-4 text-sm text-[var(--gray-600)]">
                  Date
                </th>
                <th className="text-left py-3 px-4 text-sm text-[var(--gray-600)]">
                  Amount
                </th>
                <th className="text-left py-3 px-4 text-sm text-[var(--gray-600)]">
                  Payment Method
                </th>
                <th className="text-right py-3 px-4 text-sm text-[var(--gray-600)]">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white rounded-b overflow-hidden">
              {rows.length > 0 ? (
                rows.map((r, idx) => (
                  <TableRow
                    key={`${r.id}-${idx}`}
                    id={r.id}
                    date={r.date}
                    amount={r.amount}
                    method={r.method}
                    status={r.status}
                  />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-6 text-[var(--gray-500)] text-sm"
                  >
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <Pagination
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            currentPage={page}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
