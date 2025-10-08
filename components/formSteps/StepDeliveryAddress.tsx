"use client";
import React from "react";
import Select from "react-select";
import counties from "../../utils/counties";
import FormInput from "../../components/form/FormInput";
import FormTextarea from "../../components/form/FormTextarea";

interface StepProps {
  formData: any;
  handleChange: (field: string, value: any) => void;
}

/**
 * Step 5 – Delivery Address
 * Collects the full delivery address details (city, street, postal code, etc.)
 */
export default function StepDeliveryAddress({
  formData,
  handleChange,
}: StepProps) {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-emerald-700 mb-6">
        Adresa completă de livrare
      </h2>

      <div className="max-w-md mx-auto text-left space-y-5">
        {/* --- Județ --- */}
        <div>
          <label
            htmlFor="deliveryCounty"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Județ
          </label>
          <Select
            inputId="deliveryCounty"
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="Selectează județul"
            options={counties.map((c) => ({ value: c, label: c }))}
            onChange={(opt) => handleChange("deliveryCounty", opt?.value || "")}
            value={
              formData.deliveryCounty
                ? {
                    value: formData.deliveryCounty,
                    label: formData.deliveryCounty,
                  }
                : null
            }
            styles={{
              control: (base) => ({
                ...base,
                borderRadius: "0.75rem",
                borderColor: "#d1d5db",
                boxShadow: "none",
                "&:hover": { borderColor: "#10b981" },
              }),
            }}
          />
        </div>

        {/* --- Oraș --- */}
        <FormInput
          id="deliveryCity"
          label="Oraș / Localitate"
          placeholder="Ex: București, Cluj-Napoca"
          value={formData.deliveryCity || ""}
          onChange={(e) => handleChange("deliveryCity", e.target.value)}
        />

        {/* --- Stradă și număr --- */}
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

        {/* --- Detalii suplimentare --- */}
        <FormInput
          id="deliveryDetails"
          label="Bloc / Scara / Etaj / Apartament (opțional)"
          placeholder="Ex: Bloc A, Scara 2, Etaj 3, Ap. 12"
          value={formData.deliveryDetails || ""}
          onChange={(e) => handleChange("deliveryDetails", e.target.value)}
        />

        {/* --- Cod poștal --- */}
        <FormInput
          id="deliveryPostal"
          label="Cod poștal"
          placeholder="Ex: 010101"
          value={formData.deliveryPostal || ""}
          onChange={(e) => handleChange("deliveryPostal", e.target.value)}
        />

        {/* --- Instrucțiuni --- */}
        <FormTextarea
          id="deliveryInstructions"
          label="Instrucțiuni speciale pentru acces (ex: interfon, restricții)"
          placeholder="Ex: Interfon 123, acces prin spatele blocului"
          rows={3}
          value={formData.deliveryInstructions || ""}
          onChange={(e) =>
            handleChange("deliveryInstructions", e.target.value)
          }
        />
      </div>
    </div>
  );
}
