"use client";
import React from "react";

interface StepProps {
  formData: any;
  handleChange: (field: string, value: any) => void;
}

/**
 * Step 10 – Contact Details
 * Collects the client's name, phone number, and email.
 */
export default function StepContact({ formData, handleChange }: StepProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-emerald-700 text-center mb-4">
        Datele tale de contact
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* --- Nume complet --- */}
        <div className="flex flex-col">
          <label
            htmlFor="name"
            className="text-sm font-medium text-gray-700 mb-1"
          >
            Nume complet
          </label>
          <input
            id="name"
            type="text"
            placeholder="Ex: Andrei Popescu"
            className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
          />
        </div>

        {/* --- Telefon --- */}
        <div className="flex flex-col">
          <label
            htmlFor="phone"
            className="text-sm font-medium text-gray-700 mb-1"
          >
            Telefon
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="Ex: 07xx xxx xxx"
            className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            pattern="[0-9+ ]*"
            required
          />
        </div>
      </div>

      {/* --- Email --- */}
      <div className="flex flex-col">
        <label
          htmlFor="email"
          className="text-sm font-medium text-gray-700 mb-1"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="Ex: contact@exemplu.ro"
          className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          required
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
