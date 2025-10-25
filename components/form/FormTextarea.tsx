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
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-semibold text-emerald-700"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <textarea
          id={id}
          {...props}
          className={`w-full bg-white/80 border border-emerald-100 rounded-xl p-3 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition-all hover:shadow-emerald-100 ${className}`}
        />
        <div
          className={`h-[2px] w-full rounded-full transition-all duration-300 ${
            props.value
              ? "bg-gradient-to-r from-emerald-500 to-sky-500"
              : "bg-gray-100"
          }`}
        />
      </div>

      {error && (
        <p className="text-xs text-red-500 font-medium mt-1">{error}</p>
      )}
    </div>
  );
}
