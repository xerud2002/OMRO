"use client";
import React from "react";

interface StepProps {
  formData: any;
  handleChange: (field: string, value: any) => void;
}

/**
 * Step 8 – Dismantling / Reassembly
 * Asks the client if they need help dismantling and reassembling furniture.
 */
export default function StepDismantling({ formData, handleChange }: StepProps) {
  const options = [
    { value: "none", label: "Nu, nu este nevoie" },
    { value: "all", label: "Da, pentru majoritatea pieselor" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-emerald-700 text-center mb-6">
        Ai nevoie de ajutor la demontare și reasamblare mobilier?
      </h2>

      <div className="flex flex-col sm:flex-row gap-4">
        {options.map((opt) => {
          const selected = formData.dismantling === opt.value;
          return (
            <label
              key={opt.value}
              htmlFor={opt.value}
              className={`flex-1 border rounded-xl p-4 text-center cursor-pointer transition-all duration-200 ${
                selected
                  ? "border-emerald-500 bg-gradient-to-r from-emerald-50 to-sky-50 shadow-sm text-emerald-700 font-medium"
                  : "border-gray-300 hover:border-emerald-300 hover:bg-emerald-50/40 text-gray-700"
              } hover:scale-[1.01]`}
            >
              <input
                id={opt.value}
                type="radio"
                name="dismantling"
                value={opt.value}
                checked={selected}
                onChange={(e) => handleChange("dismantling", e.target.value)}
                className="hidden"
              />
              {opt.label}
            </label>
          );
        })}
      </div>

      <p className="text-sm text-gray-500 text-center mt-4 max-w-md mx-auto">
        Selectează opțiunea potrivită. Echipa va veni pregătită cu unelte pentru
        mobilierul ce necesită demontare și reasamblare.
      </p>
    </div>
  );
}
