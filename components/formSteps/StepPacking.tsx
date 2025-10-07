"use client";
import React from "react";

interface StepProps {
  formData: any;
  handleChange: (field: string, value: any) => void;
}

/**
 * Step 7 – Packing Service
 * Asks if the client needs packing assistance.
 */
export default function StepPacking({ formData, handleChange }: StepProps) {
  const options = [
    {
      value: "Da, complet",
      label: "Da, complet – dorim ca totul să fie împachetat de echipă",
    },
    {
      value: "Parțial",
      label: "Parțial – doar obiectele fragile sau mari",
    },
    {
      value: "Nu, ne ocupăm noi",
      label: "Nu – ne ocupăm noi de împachetare",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-emerald-700 text-center mb-6">
        Ai nevoie de ajutor la împachetare?
      </h2>

      <div className="grid gap-3">
        {options.map((opt) => {
          const selected = formData.packing === opt.value;
          return (
            <label
              key={opt.value}
              htmlFor={opt.value}
              className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 flex items-center text-left ${
                selected
                  ? "border-emerald-500 bg-gradient-to-r from-emerald-50 to-sky-50 shadow-sm text-emerald-700 font-medium"
                  : "border-gray-300 hover:border-emerald-300 hover:bg-emerald-50/40 text-gray-700"
              } hover:scale-[1.01]`}
            >
              <input
                id={opt.value}
                type="radio"
                name="packing"
                value={opt.value}
                checked={selected}
                onChange={(e) => handleChange("packing", e.target.value)}
                className="hidden"
              />
              <span>{opt.label}</span>
            </label>
          );
        })}
      </div>

      <p className="text-sm text-gray-500 text-center mt-4 max-w-md mx-auto">
        Selectează opțiunea potrivită. Dacă alegi serviciul complet, echipa va
        aduce materiale de ambalare profesionale.
      </p>
    </div>
  );
}
