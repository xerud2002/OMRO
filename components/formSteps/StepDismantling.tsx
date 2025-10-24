"use client";
import React from "react";
import { motion } from "framer-motion";
import FormTextarea from "../../components/form/FormTextarea";

interface StepProps {
  formData: Record<string, any>;
  handleChange: (field: string, value: any) => void;
}

/**
 * Step 8 – Demontare & reasamblare mobilier
 * Întreabă dacă utilizatorul are nevoie de ajutor la demontare și reasamblare.
 */
export default function StepDismantling({ formData, handleChange }: StepProps) {
  const options = [
    { value: "none", label: "Nu, nu este nevoie" },
    { value: "partial", label: "Da, doar câteva piese de mobilier" },
    { value: "all", label: "Da, pentru majoritatea pieselor" },
  ];

  return (
    <motion.div
      className="text-center space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-emerald-700">
        Ai nevoie de ajutor la demontare și reasamblare mobilier?
      </h2>

      <p className="text-sm text-gray-600 max-w-md mx-auto">
        Echipa poate veni pregătită cu scule profesionale pentru demontarea și reasamblarea mobilierului.
      </p>

      <div className="grid gap-3 max-w-md mx-auto">
        {options.map((opt, index) => {
          const selected = formData.dismantling === opt.value;
          return (
            <motion.label
              key={opt.value}
              htmlFor={`dismantling-${index}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 shadow-sm ${
                selected
                  ? "border-emerald-500 bg-gradient-to-r from-emerald-50 to-sky-50 text-emerald-700 font-medium shadow-md"
                  : "border-gray-300 hover:border-emerald-300 hover:bg-emerald-50/40 text-gray-700"
              }`}
            >
              <input
                id={`dismantling-${index}`}
                type="radio"
                name="dismantling"
                value={opt.value}
                checked={selected}
                onChange={(e) => handleChange("dismantling", e.target.value)}
                className="hidden"
              />
              {opt.label}
            </motion.label>
          );
        })}
      </div>

      {/* 🔧 Detalii suplimentare dacă e necesar */}
      {formData.dismantling && formData.dismantling !== "none" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-md mx-auto"
        >
          <FormTextarea
            id="dismantlingDetails"
            label="Detalii mobilier (opțional)"
            placeholder="Ex: Dulap dormitor, masă extensibilă, pat matrimonial..."
            rows={3}
            value={formData.dismantlingDetails || ""}
            onChange={(e) => handleChange("dismantlingDetails", e.target.value)}
          />
        </motion.div>
      )}

      <p className="text-sm text-gray-500">
        Poți actualiza această alegere mai târziu în contul tău.
      </p>
    </motion.div>
  );
}
