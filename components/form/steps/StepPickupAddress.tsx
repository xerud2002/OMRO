"use client";
import React from "react";
import { motion } from "framer-motion";
import AddressSelector from "@/components/form/AddressSelector";
import FormInput from "@/components/form/FormInput";
import FormTextarea from "@/components/form/FormTextarea";
import { MapPin } from "lucide-react";

interface StepProps {
  formData: Record<string, any>;
  handleChange: (field: string, value: any) => void;
}

/**
 * Step 3 – Adresa completă de colectare
 * Modern UI aligned with the visual style of StepProperty & StepDeliveryProperty
 */
export default function StepPickupAddress({ formData, handleChange }: StepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center space-y-8"
    >
      {/* Title */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-emerald-700 mb-2 flex items-center justify-center gap-2">
          <MapPin className="text-sky-500" size={28} />
          Adresa completă de colectare
        </h2>
        <p className="text-sm md:text-base text-gray-600 max-w-lg mx-auto">
          Completează detaliile exacte de unde se face ridicarea bunurilor, pentru o estimare corectă a timpului și accesului.
        </p>
      </div>

      {/* Card container */}
      <motion.div
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-xl mx-auto bg-white/70 backdrop-blur-sm border border-emerald-100 rounded-3xl shadow-lg p-8 space-y-6 text-left"
      >
        {/* Localizare */}
        <div>
          <p className="font-semibold text-emerald-700 text-sm mb-2">Localizare</p>
          <AddressSelector type="pickup" formData={formData} handleChange={handleChange} />
        </div>

        {/* Stradă + Nr. */}
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <FormInput
              id="pickupStreet"
              label="Stradă"
              placeholder="Ex: Str. Mihai Eminescu"
              value={formData.pickupStreet || ""}
              onChange={(e) => handleChange("pickupStreet", e.target.value)}
            />
          </div>
          <div>
            <FormInput
              id="pickupNumber"
              label="Nr."
              placeholder="Ex: 24A"
              value={formData.pickupNumber || ""}
              onChange={(e) => handleChange("pickupNumber", e.target.value)}
            />
          </div>
        </div>

        {/* Bloc / Etaj / Apartament */}
        <FormInput
          id="pickupDetails"
          label="Bloc / Scara / Etaj / Apartament (opțional)"
          placeholder="Ex: Bloc C3, Sc. 2, Et. 4, Ap. 12"
          value={formData.pickupDetails || ""}
          onChange={(e) => handleChange("pickupDetails", e.target.value)}
        />

        {/* Cod poștal */}
        <FormInput
          id="pickupPostal"
          label="Cod poștal"
          placeholder="Ex: 012345"
          value={formData.pickupPostal || ""}
          onChange={(e) => handleChange("pickupPostal", e.target.value)}
        />

        {/* Instrucțiuni speciale */}
        <div>
          <FormTextarea
            id="pickupInstructions"
            label="Instrucțiuni speciale pentru acces"
            placeholder="Ex: interfon, acces camion, stradă îngustă..."
            rows={3}
            value={formData.pickupInstructions || ""}
            onChange={(e) => handleChange("pickupInstructions", e.target.value)}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
