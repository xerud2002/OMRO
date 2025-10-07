"use client";
import React from "react";

interface StepProps {
  formData: any;
  handleChange: (field: string, value: any) => void;
}

export default function StepDismantling({ formData, handleChange }: StepProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-emerald-700 text-center mb-6">
        Ai nevoie de ajutor la demontare și reasamblare mobilier?
      </h2>

      <div className="flex flex-col sm:flex-row gap-4">
        {[
          { value: "none", label: "Nu, nu este nevoie" },
          { value: "all", label: "Da, pentru majoritatea pieselor" },
        ].map((opt) => (
          <label
            key={opt.value}
            className={`flex-1 border rounded-xl p-4 text-center cursor-pointer transition-all duration-200 ${
              formData.dismantling === opt.value
                ? "border-emerald-500 bg-emerald-50 shadow-sm text-emerald-700 font-medium"
                : "border-gray-300 hover:border-emerald-300 hover:bg-emerald-50/30 text-gray-700"
            }`}
          >
            <input
              type="radio"
              name="dismantling"
              value={opt.value}
              checked={formData.dismantling === opt.value}
              onChange={(e) => handleChange("dismantling", e.target.value)}
              className="hidden"
            />
            {opt.label}
          </label>
        ))}
      </div>

      <p className="text-sm text-gray-500 text-center mt-4">
        Selectează opțiunea potrivită. Echipa va veni pregătită cu unelte
        pentru mobilierul ce necesită demontare.
      </p>
    </div>
  );
}
