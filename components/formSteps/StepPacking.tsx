"use client";
import React from "react";

interface StepProps {
  formData: any;
  handleChange: (field: string, value: any) => void;
}

export default function StepPacking({ formData, handleChange }: StepProps) {
  const options = [
    { value: "Da, complet", label: "Da, complet – dorim ca totul să fie împachetat de echipă" },
    { value: "Parțial", label: "Parțial, doar obiectele fragile / mari" },
    { value: "Nu, ne ocupăm noi", label: "Nu, ne ocupăm noi de împachetare" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-emerald-700 text-center mb-6">
        Ai nevoie de ajutor la împachetare?
      </h2>

      <div className="grid gap-3">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 ${
              formData.packing === opt.value
                ? "border-emerald-500 bg-emerald-50 shadow-sm text-emerald-700 font-medium"
                : "border-gray-300 hover:border-emerald-300 hover:bg-emerald-50/30 text-gray-700"
            }`}
          >
            <input
              type="radio"
              name="packing"
              value={opt.value}
              checked={formData.packing === opt.value}
              onChange={(e) => handleChange("packing", e.target.value)}
              className="hidden"
            />
            {opt.label}
          </label>
        ))}
      </div>

      <p className="text-sm text-gray-500 text-center mt-4">
        Selectează opțiunea potrivită. Dacă alegi serviciul complet, echipa va aduce materiale de ambalare profesionale.
      </p>
    </div>
  );
}
