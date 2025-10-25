"use client";
import React from "react";
import { ChevronDown } from "lucide-react";

interface FormSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  required?: boolean;
}

export default function FormSelect({
  id,
  label,
  value,
  onChange,
  options,
  required = false,
}: FormSelectProps) {
  return (
    <div className="space-y-1.5 relative">
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-emerald-700"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full appearance-none bg-white/80 border border-emerald-100 rounded-xl py-3 px-4 pr-10 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition-all hover:shadow-emerald-100"
        >
          <option value="">Selectează...</option>
          {options.map((opt, i) => (
            <option key={i} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        {/* Iconă dropdown personalizată */}
        <ChevronDown
          size={18}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none"
        />
      </div>

      {/* Linie subtilă gradient la focus */}
      <div
        className={`h-[2px] w-full rounded-full transition-all duration-300 ${
          value
            ? "bg-gradient-to-r from-emerald-500 to-sky-500"
            : "bg-gray-100"
        }`}
      />
    </div>
  );
}
