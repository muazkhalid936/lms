"use client";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function OnboardingCard() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({
    stripeAccountId: null,
    payoutsEnabled: false,
    chargesEnabled: false,
    stripeDetailsSubmitted: false,
    stripeOnboardingComplete: false,
  });

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/stripe/connect/account-status", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setStatus({
          stripeAccountId: data.account?.id || null,
          payoutsEnabled: !!data.account?.payoutsEnabled,
          chargesEnabled: !!data.account?.chargesEnabled,
          stripeDetailsSubmitted: !!data.account?.detailsSubmitted,
          stripeOnboardingComplete: !!(data.account?.detailsSubmitted && data.account?.payoutsEnabled),
        });
      } else {
        // Not created yet
        setStatus((prev) => ({ ...prev, stripeAccountId: null }));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load Stripe status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleCreateAccount = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/stripe/connect/create-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Stripe account created");
        await fetchStatus();
      } else {
        toast.error(data.message || "Failed to create account");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleOnboarding = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/stripe/connect/account-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.message || "Failed to start onboarding");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to start onboarding");
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = () => {
    if (status.stripeOnboardingComplete) {
      return <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">Onboarding Complete</span>;
    }
    if (status.stripeDetailsSubmitted) {
      return <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm">Pending Review</span>;
    }
    return <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm">Not Started</span>;
  };

  return (
    <div className="border border-[var(--gray-100)] rounded-[10px] p-4 bg-white">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Stripe Payouts Setup</h3>
          <p className="text-sm text-gray-600 mt-1">Connect your bank account to receive payouts directly.</p>
          <div className="mt-2">{statusBadge()}</div>
        </div>
        <img src="/stripe-logo.svg" alt="Stripe" className="h-8" />
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {!status.stripeAccountId ? (
          <button onClick={handleCreateAccount} disabled={loading} className="px-4 py-2 bg-black text-white rounded-md">
            {loading ? "Please wait..." : "Create Stripe Account"}
          </button>
        ) : (
          <button onClick={handleOnboarding} disabled={loading || status.stripeOnboardingComplete} className={`px-4 py-2 rounded-md ${status.stripeOnboardingComplete ? 'bg-gray-300 text-gray-700' : 'bg-[#FF4667] text-white'}`}>
            {status.stripeOnboardingComplete ? "Onboarding Completed" : "Start/Continue Onboarding"}
          </button>
        )}

        <button onClick={fetchStatus} disabled={loading} className="px-4 py-2 bg-white border rounded-md">
          Refresh Status
        </button>
      </div>

      {status.payoutsEnabled && (
        <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded text-sm text-green-700">
          Payouts are enabled. You can withdraw your earnings directly to your bank account.
        </div>
      )}
    </div>
  );
}