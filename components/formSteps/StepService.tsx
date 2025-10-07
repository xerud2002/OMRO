"use client";
import React from "react";

interface StepProps {
  formData: any;
  handleChange: (field: string, value: any) => void;
}

/**
 * Step 1 – Service Type
 * Allows the user to choose between move, transport, or disposal.
 */
export default function StepService({ formData, handleChange }: StepProps) {
  const options = [
    {
      value: "Mutare completă",
      label: "Mutare completă ",
      desc: "Include ambalare, transport, descărcare și reasamblare.",
    },
    {
      value: "Transport câteva obiecte",
      label: "Transport câteva obiecte ",
      desc: "Pentru mobilă sau articole individuale ce trebuie mutate.",
    },
    {
      value: "Aruncare lucruri",
      label: "Aruncare lucruri ",
      desc: "Scăpăm responsabil de mobilierul vechi sau resturile.",
    },
  ];

  return (
    <fieldset className="text-center">
      <legend className="text-2xl font-bold text-emerald-700 mb-6">
        Ce tip de serviciu dorești?
      </legend>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {options.map((opt) => {
          const selected = formData.serviceType === opt.value;
          return (
            <label
              key={opt.value}
              htmlFor={opt.value}
              className={`flex flex-col items-center justify-between p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md ${
                selected
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-medium"
                  : "border-gray-200 hover:border-emerald-300 bg-white text-gray-700"
              } hover:scale-[1.02] focus-within:ring-2 focus-within:ring-emerald-400`}
              onClick={() => handleChange("serviceType", opt.value)}
            >
              <div className="text-lg font-semibold">{opt.label}</div>
              <p className="text-sm text-gray-600 mt-2">{opt.desc}</p>
              <input
                id={opt.value}
                type="radio"
                name="serviceType"
                value={opt.value}
                checked={selected}
                onChange={(e) => handleChange("serviceType", e.target.value)}
                className="hidden"
              />
            </label>
          );
        })}
      </div>

      <p className="text-sm text-gray-500 mt-6 max-w-md mx-auto">
        Selectează tipul de serviciu pentru care dorești o ofertă personalizată.
      </p>
    </fieldset>
  );
}
