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
 * Step 5 – Adresa completă de livrare
 * Folosește AddressSelector (județ + oraș/comună)
 */
export default function StepDeliveryAddress({ formData, handleChange }: StepProps) {
  return (
    <div className="text-center space-y-8">
      <h2 className="text-2xl font-bold text-emerald-700">
        Adresa completă de livrare
      </h2>

      <p className="text-sm text-gray-600 max-w-lg mx-auto">
        Completează detaliile exacte ale destinației pentru ca echipa să poată
        planifica descărcarea și accesul eficient.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md mx-auto text-left space-y-5 bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-emerald-100 shadow-sm"
      >
        {/* Select județ + oraș/comună */}
        <AddressSelector type="delivery" formData={formData} handleChange={handleChange} />

        {/* Stradă + număr */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <FormInput
              id="deliveryStreet"
              label="Stradă"
              placeholder="Ex: Strada Florilor"
              value={formData.deliveryStreet || ""}
              onChange={(e) => handleChange("deliveryStreet", e.target.value)}
            />
          </div>
          <div className="sm:w-1/3">
            <FormInput
              id="deliveryNumber"
              label="Nr."
              placeholder="Ex: 12A"
              value={formData.deliveryNumber || ""}
              onChange={(e) => handleChange("deliveryNumber", e.target.value)}
            />
          </div>
        </div>

        {/* Detalii suplimentare */}
        <FormInput
          id="deliveryDetails"
          label="Bloc / Scara / Etaj / Apartament (opțional)"
          placeholder="Ex: Bloc A, Scara 2, Etaj 3, Ap. 12"
          value={formData.deliveryDetails || ""}
          onChange={(e) => handleChange("deliveryDetails", e.target.value)}
        />

        {/* Cod poștal */}
        <FormInput
          id="deliveryPostal"
          label="Cod poștal"
          placeholder="Ex: 010101"
          value={formData.deliveryPostal || ""}
          onChange={(e) => handleChange("deliveryPostal", e.target.value)}
        />

        {/* Instrucțiuni */}
        <FormTextarea
          id="deliveryInstructions"
          label="Instrucțiuni speciale pentru acces"
          placeholder="Ex: Interfon 123, acces prin spatele blocului..."
          rows={3}
          value={formData.deliveryInstructions || ""}
          onChange={(e) => handleChange("deliveryInstructions", e.target.value)}
        />
      </motion.div>
    </div>
  );
}
