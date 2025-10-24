"use client";
import React from "react";
import { motion } from "framer-motion";
import FormTextarea from "../../components/form/FormTextarea";

interface StepProps {
  formData: Record<string, any>;
  handleChange: (field: string, value: any) => void;
}

/**
 * Step 7 – Serviciu de împachetare
 * Întreabă dacă utilizatorul dorește ajutor la ambalare.
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
    <motion.div
      className="text-center space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-emerald-700">
        Ai nevoie de ajutor la împachetare?
      </h2>

      <p className="text-sm text-gray-600 max-w-md mx-auto">
        Alege una dintre opțiunile de mai jos. Dacă selectezi serviciul complet,
        echipa va aduce materiale profesionale (folie, cutii, bandă etc.).
      </p>

      <div className="grid gap-3 max-w-md mx-auto">
        {options.map((opt, index) => {
          const selected = formData.packing === opt.value;
          return (
            <motion.label
              key={opt.value}
              htmlFor={`packing-${index}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              className={`p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 shadow-sm ${
                selected
                  ? "border-emerald-500 bg-gradient-to-r from-emerald-50 to-sky-50 text-emerald-700 font-medium shadow-md"
                  : "border-gray-300 hover:border-emerald-300 hover:bg-emerald-50/40 text-gray-700"
              }`}
            >
              <input
                id={`packing-${index}`}
                type="radio"
                name="packing"
                value={opt.value}
                checked={selected}
                onChange={(e) => handleChange("packing", e.target.value)}
                className="hidden"
              />
              {opt.label}
            </motion.label>
          );
        })}
      </div>

      {/* 🧳 Câmp opțional pentru detalii suplimentare */}
      {formData.packing && formData.packing !== "Nu, ne ocupăm noi" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-md mx-auto"
        >
          <FormTextarea
            id="packingDetails"
            label="Detalii despre împachetare (opțional)"
            placeholder="Ex: obiecte fragile, articole de bucătărie, tablouri..."
            rows={3}
            value={formData.packingDetails || ""}
            onChange={(e) => handleChange("packingDetails", e.target.value)}
          />
        </motion.div>
      )}

      <p className="text-sm text-gray-500">
        Poți actualiza această alegere ulterior din contul tău.
      </p>
    </motion.div>
  );
}
