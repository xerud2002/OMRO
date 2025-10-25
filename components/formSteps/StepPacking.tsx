"use client";
import React from "react";
import { motion } from "framer-motion";
import { PackageOpen } from "lucide-react";
import FormTextarea from "../../components/form/FormTextarea";

interface StepProps {
  formData: Record<string, any>;
  handleChange: (field: string, value: any) => void;
}

/**
 * Step 7 – Serviciu de împachetare (versiune modernizată)
 * Întreabă utilizatorul dacă dorește ajutor profesional pentru ambalare.
 */
export default function StepPacking({ formData, handleChange }: StepProps) {
  const options = [
    {
      value: "Complet",
      label: "Împachetare completă",
      desc: "Include toate materialele necesare (cutii, folie, bandă, protecții pentru mobilier).",
    },
    {
      value: "Parțial",
      label: "Împachetare parțială – doar obiectele fragile sau voluminoase",
      desc: "Perfect dacă ai nevoie de ajutor doar pentru zonele sensibile.",
    },
    {
      value: "Fără",
      label: "Nu este nevoie – ne ocupăm noi de împachetare",
      desc: "Nu se adaugă costuri suplimentare pentru acest serviciu.",
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
        <PackageOpen className="text-sky-500" size={26} />
        Ai nevoie de ajutor la împachetare?
      </h2>

      <p className="text-sm text-gray-600 max-w-md mx-auto">
        Selectează varianta potrivită pentru tine. Dacă alegi serviciul complet,
        echipa va aduce materiale profesionale și va proteja toate bunurile cu
        grijă.
      </p>

      {/* Opțiuni de împachetare */}
      <div className="grid gap-4 max-w-md mx-auto">
        {options.map((opt, i) => {
          const selected = formData.packing === opt.value;
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
                name="packing"
                value={opt.value}
                checked={selected}
                onChange={(e) => handleChange("packing", e.target.value)}
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

      {/* Câmp opțional pentru detalii */}
      {formData.packing && formData.packing !== "Fără" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-md mx-auto"
        >
          <FormTextarea
            id="packingDetails"
            label="Detalii suplimentare despre împachetare (opțional)"
            placeholder="Ex: obiecte fragile, articole de bucătărie, tablouri, echipamente electronice..."
            rows={3}
            value={formData.packingDetails || ""}
            onChange={(e) => handleChange("packingDetails", e.target.value)}
          />
        </motion.div>
      )}

      <p className="text-sm text-gray-500 max-w-md mx-auto">
        Poți modifica această alegere mai târziu din contul tău de client.
      </p>
    </motion.div>
  );
}
