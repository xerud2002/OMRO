"use client";
import React from "react";

interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  id?: string;
  error?: string;
}

export default function FormTextarea({
  label,
  id,
  error,
  className = "",
  ...props
}: FormTextareaProps) {
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
      <textarea
        id={id}
        {...props}
        className={`w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 outline-none transition-all bg-white/70 ${className}`}
      />
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}
