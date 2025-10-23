"use client";
import React from "react";
import FormInput from "../../components/form/FormInput";

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
    <div className="text-center space-y-6">
      <h2 className="text-2xl font-bold text-emerald-700">
        Datele tale de contact
      </h2>

      <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
        {/* --- Nume complet --- */}
        <FormInput
          id="name"
          label="Nume complet"
          placeholder="Ex: Andrei Popescu"
          value={formData.name || ""}
          onChange={(e) => handleChange("name", e.target.value)}
          required
        />

        {/* --- Telefon --- */}
        <FormInput
          id="phone"
          label="Telefon"
          type="tel"
          placeholder="Ex: 07xx xxx xxx"
          pattern="[0-9+ ]*"
          value={formData.phone || ""}
          onChange={(e) => handleChange("phone", e.target.value)}
          required
        />
      </div>

      {/* --- Email --- */}
      <div className="max-w-md mx-auto text-left">
        <FormInput
          id="email"
          label="Email"
          type="email"
          placeholder="Ex: contact@exemplu.ro"
          value={formData.email || ""}
          onChange={(e) => handleChange("email", e.target.value)}
          required
        />

        {!formData.email && (
          <p className="text-red-500 text-sm mt-1">
            Emailul este obligatoriu pentru a primi ofertele.
          </p>
        )}
      </div>

      <p className="text-sm text-gray-500 max-w-md mx-auto">
        Te rugăm să introduci date reale si companiile de mutări te vor contacta
        direct pentru ofertă.
      </p>
    </div>
  );
}
