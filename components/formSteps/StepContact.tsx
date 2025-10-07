"use client";
import React from "react";

interface StepProps {
  formData: any;
  handleChange: (field: string, value: any) => void;
}

export default function StepContact({ formData, handleChange }: StepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-emerald-700 mb-6 text-center">
        Datele tale de contact
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Nume complet"
          className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />

        <input
          type="text"
          placeholder="Telefon"
          className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
          value={formData.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
        />
      </div>

      <div>
        <input
          type="email"
          placeholder="Email"
          className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
        />
        {!formData.email && (
          <p className="text-red-500 text-sm mt-2">
            Emailul este obligatoriu pentru a primi ofertele.
          </p>
        )}
      </div>
    </div>
  );
}
