"use client"
import React, { useState } from 'react'
import Input from './Input'

export default function PasswordInput({ label, required, ...props }) {
  const [visible, setVisible] = useState(false)
  return (
    <div>
      {label && (
        <label className="text-xs text-[var(--gray-600)] mb-1 block">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          className="border border-[var(--gray-100)] rounded-[6px] px-3 py-2 w-full"
          {...props}
        />
        <button type="button" onClick={() => setVisible((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--gray-400)]">
          {visible ? '🙈' : '👁️'}
        </button>
      </div>
      {/* strength bar placeholder */}
      <div className="mt-3 flex gap-2">
        <div className="h-1 bg-[var(--gray-200)] rounded w-1/4" />
        <div className="h-1 bg-[var(--gray-200)] rounded w-1/4" />
        <div className="h-1 bg-[var(--gray-200)] rounded w-1/4" />
        <div className="h-1 bg-[var(--gray-200)] rounded w-1/4" />
      </div>
      <div className="mt-2 text-sm text-[var(--gray-500)]">Use 8 or more characters with a mix of letters, numbers & symbols.</div>
    </div>
  )
}
