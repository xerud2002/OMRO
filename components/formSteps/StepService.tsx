"use client";
import React from "react";
import { motion } from "framer-motion";

interface StepProps {
  formData: Record<string, any>;
  handleChange: (field: string, value: any) => void;
}

/**
 * Step 1 – Tip serviciu
 * Alege între mutare completă, transport obiecte, sau aruncare.
 */
const SERVICE_OPTIONS = [
  {
    value: "Mutare completă",
    label: "Mutare completă",
    desc: "Include ambalare, transport, descărcare și reasamblare.",
    icon: "🚛",
  },
  {
    value: "Transport câteva obiecte",
    label: "Transport câteva obiecte",
    desc: "Pentru mobilă sau articole individuale ce trebuie mutate.",
    icon: "📦",
  },
  {
    value: "Aruncare lucruri",
    label: "Aruncare lucruri",
    desc: "Scăpăm responsabil de mobilierul vechi sau resturile.",
    icon: "🗑️",
  },
];

export default function StepService({ formData, handleChange }: StepProps) {
  const selectedType = formData.serviceType;

  const handleSelect = (value: string) => {
    handleChange("serviceType", value);
  };

  return (
    <fieldset className="text-center space-y-8">
      <legend className="text-2xl font-bold text-emerald-700">
        Ce tip de serviciu dorești?
      </legend>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {SERVICE_OPTIONS.map((opt) => {
          const selected = selectedType === opt.value;
          return (
            <motion.label
              key={opt.value}
              htmlFor={opt.value}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={`relative flex flex-col justify-between items-center p-6 rounded-2xl border-2 cursor-pointer shadow-sm transition-all duration-200 ${
                selected
                  ? "border-emerald-500 bg-gradient-to-br from-emerald-50 to-sky-50 text-emerald-800 font-semibold shadow-md"
                  : "border-gray-200 bg-white/70 text-gray-700 hover:border-emerald-300"
              }`}
              onClick={() => handleSelect(opt.value)}
              aria-checked={selected}
              role="radio"
            >
              <div className="text-3xl mb-2">{opt.icon}</div>
              <div className="text-lg font-semibold">{opt.label}</div>
              <p className="text-sm text-gray-600 mt-2">{opt.desc}</p>

              {selected && (
                <motion.div
                  layoutId="serviceSelected"
                  className="absolute inset-0 rounded-2xl border-2 border-emerald-400 shadow-inner pointer-events-none"
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                />
              )}

              <input
                id={opt.value}
                type="radio"
                name="serviceType"
                value={opt.value}
                checked={selected}
                onChange={() => handleSelect(opt.value)}
                className="hidden"
              />
            </motion.label>
          );
        })}
      </div>

      <p className="text-sm text-gray-500 max-w-md mx-auto">
        Selectează tipul de serviciu pentru care dorești o ofertă personalizată.
      </p>
    </fieldset>
  );
}
