"use client";
import React from "react";
import { motion } from "framer-motion";
import { Wrench } from "lucide-react";
import FormTextarea from "@/components/form/FormTextarea";

interface StepProps {
  formData: Record<string, any>;
  handleChange: (field: string, value: any) => void;
}

/**
 * Step 8 – Demontare & reasamblare mobilier (versiune modernizată)
 * Întreabă utilizatorul dacă are nevoie de ajutor la demontare și reasamblare.
 */
export default function StepDismantling({ formData, handleChange }: StepProps) {
  const options = [
    {
      value: "none",
      label: "Nu este nevoie de demontare",
      desc: "Toate piesele de mobilier pot fi transportate ca atare.",
    },
    {
      value: "partial",
      label: "Demontare parțială",
      desc: "Doar câteva piese necesită demontare (ex: dulap, pat, masă mare).",
    },
    {
      value: "all",
      label: "Demontare completă",
      desc: "Majoritatea pieselor de mobilier trebuie dezasamblate și reasamblate la destinație.",
    },
  ];

  return (
    <motion.div
      className="text-center space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Titlu */}
      <h2 className="text-2xl md:text-3xl font-bold text-emerald-700 flex justify-center items-center gap-2">
        <Wrench className="text-sky-500" size={26} />
        Ai nevoie de ajutor la demontarea mobilierului?
      </h2>

      <p className="text-sm text-gray-600 max-w-md mx-auto">
        Echipa poate veni echipată cu scule profesionale pentru dezasamblarea
        și reasamblarea pieselor mari de mobilier.
      </p>

      {/* Opțiuni de demontare */}
      <div className="grid gap-4 max-w-md mx-auto">
        {options.map((opt, i) => {
          const selected = formData.dismantling === opt.value;
          return (
            <motion.label
              key={opt.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              className={`p-5 rounded-2xl border text-left cursor-pointer transition-all duration-300 shadow-sm relative overflow-hidden ${
                selected
                  ? "border-emerald-500 bg-gradient-to-r from-emerald-50 to-sky-50 text-emerald-800 font-medium shadow-md"
                  : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-gray-700"
              }`}
            >
              <input
                type="radio"
                name="dismantling"
                value={opt.value}
                checked={selected}
                onChange={(e) => handleChange("dismantling", e.target.value)}
                className="hidden"
              />
              <div className="flex flex-col gap-1">
                <span className="font-semibold">{opt.label}</span>
                <span className="text-xs text-gray-600">{opt.desc}</span>
              </div>
            </motion.label>
          );
        })}
      </div>

      {/* 🔧 Câmp detalii suplimentare */}
      {formData.dismantling && formData.dismantling !== "none" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-md mx-auto"
        >
          <FormTextarea
            id="dismantlingDetails"
            label="Detalii despre mobilier (opțional)"
            placeholder="Ex: dulap dormitor, pat matrimonial, masă extensibilă, mobilier de birou..."
            rows={3}
            value={formData.dismantlingDetails || ""}
            onChange={(e) => handleChange("dismantlingDetails", e.target.value)}
          />
        </motion.div>
      )}

      <p className="text-sm text-gray-500 max-w-md mx-auto">
        Poți actualiza această alegere ulterior din contul tău de client.
      </p>
    </motion.div>
  );
}
