"use client";
import React from "react";

interface Option {
  value: string;
  label: string;
}

interface FormSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  id?: string;
  options: Option[];
  error?: string;
}

export default function FormSelect({
  label,
  id,
  options,
  error,
  className = "",
  ...props
}: FormSelectProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <select
        id={id}
        {...props}
        className={`w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 outline-none transition-all bg-white/70 ${className}`}
      >
        <option value="">Selectează...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}
