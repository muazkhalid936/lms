"use client";
import React, { useState } from "react";

export default function WithdrawPage() {
  const [method, setMethod] = useState("bank");
  const [form, setForm] = useState({
    accountName: "",
    accountNumber: "",
    bankName: "",
    iban: "",
    bic: "",
  });

  const handleChange = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const handleSave = () => {
    if (method === "bank") {
      const missing = [
        !form.accountName,
        !form.accountNumber,
        !form.bankName,
        !form.iban,
        !form.bic,
      ].some(Boolean);
      if (missing) {
        alert("Please fill all bank fields");
        return;
      }
    }
    // TODO: persist withdrawal account
    alert("Withdrawal account saved (demo)");
  };

  return (
    <div className="mx-auto px-6 pb-6 bg-white">
      <h1 className="text-[20px] border-b border-[var(--gray-100)] pb-4 font-bold text-[var(--gray-900)] mb-6">Select a withdraw method</h1>

      <div className="border border-[var(--gray-100)] rounded-[10px] p-4 bg-white">
        <div className="space-y-3">
          <label className={`block border rounded p-4 ${method==='bank' ? 'border-rose-300' : 'border-[var(--gray-100)]'}`}>
            <div className="flex items-center gap-4">
              <input type="radio" name="method" checked={method==='bank'} onChange={()=>setMethod('bank')} className="w-5 h-5 text-rose-500" />
              <div>
                <div className="font-semibold">Bank Transfer</div>
                <div className="text-sm text-[var(--gray-500)]">Minimum withdraw $50</div>
              </div>
            </div>
          </label>

          <label className={`block border rounded p-4 ${method==='stripe' ? 'border-rose-300' : 'border-[var(--gray-100)]'}`}>
            <div className="flex items-center gap-4">
              <input type="radio" name="method" checked={method==='stripe'} onChange={()=>setMethod('stripe')} className="w-5 h-5 text-rose-500" />
              <div>
                <div className="font-semibold">Stripe</div>
                <div className="text-sm text-[var(--gray-500)]">Minimum withdraw $50</div>
              </div>
            </div>
          </label>

          <label className={`block border rounded p-4 ${method==='paypal' ? 'border-rose-300' : 'border-[var(--gray-100)]'}`}>
            <div className="flex items-center gap-4">
              <input type="radio" name="method" checked={method==='paypal'} onChange={()=>setMethod('paypal')} className="w-5 h-5 text-rose-500" />
              <div>
                <div className="font-semibold">PayPal</div>
                <div className="text-sm text-[var(--gray-500)]">Minimum withdraw $50</div>
              </div>
            </div>
          </label>
        </div>

        {method === 'bank' && (
          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[var(--gray-600)] mb-1 block">Account Name <span className="text-rose-500">*</span></label>
                <input value={form.accountName} onChange={handleChange('accountName')} className="border border-[var(--gray-100)] rounded-[6px] px-3 py-2 w-full" />
              </div>

              <div>
                <label className="text-xs text-[var(--gray-600)] mb-1 block">Account Number <span className="text-rose-500">*</span></label>
                <input value={form.accountNumber} onChange={handleChange('accountNumber')} className="border border-[var(--gray-100)] rounded-[6px] px-3 py-2 w-full" />
              </div>

              <div>
                <label className="text-xs text-[var(--gray-600)] mb-1 block">Bank Name <span className="text-rose-500">*</span></label>
                <input value={form.bankName} onChange={handleChange('bankName')} className="border border-[var(--gray-100)] rounded-[6px] px-3 py-2 w-full" />
              </div>

              <div>
                <label className="text-xs text-[var(--gray-600)] mb-1 block">IBAN <span className="text-rose-500">*</span></label>
                <input value={form.iban} onChange={handleChange('iban')} className="border border-[var(--gray-100)] rounded-[6px] px-3 py-2 w-full" />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-[var(--gray-600)] mb-1 block">BIC / SWIFT <span className="text-rose-500">*</span></label>
                <input value={form.bic} onChange={handleChange('bic')} className="border border-[var(--gray-100)] rounded-[6px] px-3 py-2 w-full" />
              </div>
            </div>

            <div className="mt-6">
              <button onClick={handleSave} className="px-4 py-2 bg-rose-500 text-white rounded-full">Save Withdrawal Account</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}