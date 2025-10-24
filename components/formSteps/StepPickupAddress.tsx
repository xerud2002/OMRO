"use client";
import React from "react";
import { motion } from "framer-motion";
import AddressSelector from "../../components/form/AddressSelector";
import FormInput from "../../components/form/FormInput";
import FormTextarea from "../../components/form/FormTextarea";

interface StepProps {
  formData: Record<string, any>;
  handleChange: (field: string, value: any) => void;
}

/**
 * Step 3 – Adresa completă de colectare
 * Folosește AddressSelector (județ + oraș/comună)
 */
export default function StepPickupAddress({ formData, handleChange }: StepProps) {
  return (
    <div className="text-center space-y-8">
      <h2 className="text-2xl font-bold text-emerald-700">
        Adresa completă de colectare
      </h2>

      <p className="text-sm text-gray-600 max-w-lg mx-auto">
        Completează detaliile exacte de unde se face ridicarea bunurilor, pentru ca
        echipa să poată estima timpul și accesul corect.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md mx-auto text-left space-y-5 bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-emerald-100 shadow-sm"
      >
        {/* Select județ + oraș/comună */}
        <AddressSelector type="pickup" formData={formData} handleChange={handleChange} />

        {/* Stradă + număr */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <FormInput
              id="pickupStreet"
              label="Stradă"
              placeholder="Ex: Str. Mihai Eminescu"
              value={formData.pickupStreet || ""}
              onChange={(e) => handleChange("pickupStreet", e.target.value)}
            />
          </div>
          <div className="sm:w-1/3">
            <FormInput
              id="pickupNumber"
              label="Nr."
              placeholder="Ex: 24A"
              value={formData.pickupNumber || ""}
              onChange={(e) => handleChange("pickupNumber", e.target.value)}
            />
          </div>
        </div>

        {/* Detalii suplimentare */}
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
        <FormTextarea
          id="pickupInstructions"
          label="Instrucțiuni speciale pentru acces"
          placeholder="Ex: interfon, acces camion, stradă îngustă..."
          rows={3}
          value={formData.pickupInstructions || ""}
          onChange={(e) => handleChange("pickupInstructions", e.target.value)}
        />
      </motion.div>
    </div>
  );
}
