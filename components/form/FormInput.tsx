"use client";
import React from "react";
import { motion } from "framer-motion";

interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id?: string;
  error?: string;
  icon?: React.ReactNode;
}

export default function FormInput({
  label,
  id,
  error,
  icon,
  className = "",
  ...props
}: FormInputProps) {
  return (
    <div className="space-y-1.5">
      {/* Etichetă */}
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-semibold text-emerald-700"
        >
          {label}
        </label>
      )}

      {/* Input container */}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500">
            {icon}
          </div>
        )}

        <input
          id={id}
          {...props}
          className={`w-full bg-white/80 border border-emerald-100 rounded-xl p-3 ${
            icon ? "pl-10" : ""
          } text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition-all hover:shadow-emerald-100 ${className}`}
        />

        {/* Linie decorativă gradient */}
        <motion.div
          layoutId={`${id}-underline`}
          className={`h-[2px] w-full rounded-full transition-all duration-300 ${
            props.value
              ? "bg-gradient-to-r from-emerald-500 to-sky-500"
              : "bg-gray-100"
          }`}
        />
      </div>

      {/* Eroare */}
      {error && (
        <p className="text-xs text-red-500 font-medium mt-1">{error}</p>
      )}
    </div>
  );
}
