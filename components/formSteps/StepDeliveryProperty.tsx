"use client";
import React from "react";
import { motion } from "framer-motion";
import FormSelect from "../../components/form/FormSelect";

interface StepProps {
  formData: Record<string, any>;
  handleChange: (field: string, value: any) => void;
}

/**
 * Step 4 – Destination Property Type
 * Collects details about the destination property (house, apartment, office, etc.)
 */
export default function StepDeliveryProperty({ formData, handleChange }: StepProps) {
  const propertyOptions = [
    { value: "Casă", label: "Casă" },
    { value: "Apartament", label: "Apartament" },
    { value: "Office", label: "Office" },
    { value: "Depozit", label: "Depozit" },
  ];

  const roomOptions = [
    { value: "1 cameră", label: "1 cameră" },
    { value: "2 camere", label: "2 camere" },
    { value: "3 camere", label: "3 camere" },
    { value: "4 camere", label: "4 camere" },
    { value: "5+ camere", label: "5+ camere" },
  ];

  const floorOptions = [
    { value: "Parter", label: "Parter" },
    { value: "Etaj 1", label: "Etaj 1" },
    { value: "Etaj 2", label: "Etaj 2" },
    { value: "Etaj 3", label: "Etaj 3" },
    { value: "Etaj 4", label: "Etaj 4" },
    { value: "Etaj 5+", label: "Etaj 5+" },
  ];

  const liftOptions = [
    { value: "Da", label: "Da" },
    { value: "Nu", label: "Nu" },
  ];

  const houseFloorOptions = [
    { value: "Fără etaj", label: "Fără etaj" },
    { value: "1 etaj", label: "1 etaj" },
    { value: "2 etaje", label: "2 etaje" },
    { value: "3+ etaje", label: "3+ etaje" },
  ];

  return (
    <motion.div
      className="text-center space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-emerald-700">
        Tipul de proprietate la destinație
      </h2>

      <p className="text-sm text-gray-600 max-w-lg mx-auto">
        Completează informațiile despre locația de descărcare pentru a estima accesul și timpul necesar.
      </p>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md mx-auto text-left space-y-5 bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-emerald-100 shadow-sm"
      >
        {/* --- Tip proprietate --- */}
        <FormSelect
          id="propertyTypeTo"
          label="Tip proprietate"
          options={propertyOptions}
          value={formData.propertyTypeTo || ""}
          onChange={(e) => handleChange("propertyTypeTo", e.target.value)}
          required
        />

        {/* --- Casă --- */}
        {formData.propertyTypeTo === "Casă" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <FormSelect
              id="roomsTo"
              label="Număr camere"
              options={roomOptions}
              value={formData.roomsTo || ""}
              onChange={(e) => handleChange("roomsTo", e.target.value)}
            />

            <FormSelect
              id="houseFloorsTo"
              label="Câte etaje are casa?"
              options={houseFloorOptions}
              value={formData.houseFloorsTo || ""}
              onChange={(e) => handleChange("houseFloorsTo", e.target.value)}
            />
          </motion.div>
        )}

        {/* --- Apartament / Office --- */}
        {(formData.propertyTypeTo === "Apartament" ||
          formData.propertyTypeTo === "Office") && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <FormSelect
              id="roomsTo"
              label="Număr camere"
              options={roomOptions}
              value={formData.roomsTo || ""}
              onChange={(e) => handleChange("roomsTo", e.target.value)}
            />

            <FormSelect
              id="floorTo"
              label="Etaj"
              options={floorOptions}
              value={formData.floorTo || ""}
              onChange={(e) => handleChange("floorTo", e.target.value)}
            />

            {formData.floorTo && formData.floorTo !== "Parter" && (
              <FormSelect
                id="liftTo"
                label="Există lift?"
                options={liftOptions}
                value={formData.liftTo || ""}
                onChange={(e) => handleChange("liftTo", e.target.value)}
              />
            )}
          </motion.div>
        )}

        {/* --- Depozit --- */}
        {formData.propertyTypeTo === "Depozit" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-sm text-gray-600 italic"
          >
            <p>
              Poți specifica detalii despre accesul în depozit sau restricțiile de descărcare în
              secțiunea următoare.
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
