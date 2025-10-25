"use client";
import React from "react";
import { motion } from "framer-motion";
import { UserRound, Phone, Mail } from "lucide-react";
import FormInput from "../../components/form/FormInput";

interface StepProps {
  formData: Record<string, any>;
  handleChange: (field: string, value: any) => void;
  showErrors?: boolean;
}

/**
 * Step 10 – Date de contact
 * Colectează numele, telefonul și emailul clientului.
 */
export default function StepContact({ formData, handleChange, showErrors }: StepProps) {
  const isEmailMissing = !formData.email || formData.email.trim() === "";

  return (
    <motion.div
      className="text-center space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Titlu */}
      <h2 className="text-2xl md:text-3xl font-bold text-emerald-700 flex items-center justify-center gap-2">
        <UserRound className="text-sky-500" size={26} />
        Datele tale de contact
      </h2>

      <p className="text-sm text-gray-600 max-w-md mx-auto">
        Completează datele corecte — echipele de mutări te vor contacta direct
        pentru a discuta detaliile și a-ți trimite ofertele personalizate.
      </p>

      {/* Card */}
      <motion.div
        className="max-w-xl mx-auto bg-white/70 backdrop-blur-sm border border-emerald-100 rounded-3xl shadow-lg p-6 space-y-5"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* --- Nume complet + Telefon --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <FormInput
            id="name"
            label="Nume complet"
            placeholder="Ex: Andrei Popescu"
            value={formData.name || ""}
            onChange={(e) => handleChange("name", e.target.value)}
            required
            icon={<UserRound size={18} className="text-emerald-500" />}
          />

          <FormInput
            id="phone"
            label="Telefon"
            type="tel"
            placeholder="Ex: 07xx xxx xxx"
            pattern="[0-9+ ]*"
            value={formData.phone || ""}
            onChange={(e) => handleChange("phone", e.target.value)}
            required
            icon={<Phone size={18} className="text-sky-500" />}
          />
        </div>

        {/* --- Email --- */}
        <div className="text-left">
          <FormInput
            id="email"
            label="Email"
            type="email"
            placeholder="Ex: contact@exemplu.ro"
            value={formData.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            required
            icon={<Mail size={18} className="text-emerald-500" />}
          />

          {/* ⚠️ Mesaj eroare dacă emailul lipsește */}
          {showErrors && isEmailMissing && (
            <motion.p
              className="text-red-500 text-sm mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              Emailul este obligatoriu pentru a primi ofertele.
            </motion.p>
          )}
        </div>
      </motion.div>

      <p className="text-sm text-gray-500 max-w-md mx-auto">
        Asigură-te că adresa de email și numărul de telefon sunt corecte — așa
        vei putea primi rapid ofertele și detaliile despre mutare.
      </p>
    </motion.div>
  );
}
