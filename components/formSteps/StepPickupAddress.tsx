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
 * Step 3 – Pickup Address
 * Collects the complete pickup (collection) address details.
 */
export default function StepPickupAddress({
  formData,
  handleChange,
}: StepProps) {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-emerald-700 mb-6">
        Adresa completă de colectare
      </h2>

      <div className="max-w-md mx-auto text-left space-y-5">
        {/* --- Județ --- */}
        <div>
          <label
            htmlFor="pickupCounty"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Județ
          </label>
          <Select
            inputId="pickupCounty"
            className="react-select-container"
            options={counties.map((c) => ({ value: c, label: c }))}
            onChange={(opt) => handleChange("pickupCounty", opt?.value || "")}
            value={
              formData.pickupCounty
                ? {
                    value: formData.pickupCounty,
                    label: formData.pickupCounty,
                  }
                : null
            }
            placeholder="Selectează județul"
            styles={{
              control: (base) => ({
                ...base,
                borderRadius: "0.5rem",
                borderColor: "#d1d5db",
                boxShadow: "none",
                "&:hover": { borderColor: "#10b981" },
              }),
            }}
          />
        </div>

        {/* --- Oraș --- */}
        <FormInput
          id="pickupCity"
          label="Oraș / Localitate"
          placeholder="Ex: București, Cluj, Iași..."
          value={formData.pickupCity || ""}
          onChange={(e) => handleChange("pickupCity", e.target.value)}
        />

        {/* --- Stradă și număr --- */}
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

        {/* --- Detalii suplimentare --- */}
        <FormInput
          id="pickupDetails"
          label="Bloc / Scara / Etaj / Apartament (opțional)"
          placeholder="Ex: Bloc C3, Sc. 2, Et. 4, Ap. 12"
          value={formData.pickupDetails || ""}
          onChange={(e) => handleChange("pickupDetails", e.target.value)}
        />

        {/* --- Cod poștal --- */}
        <FormInput
          id="pickupPostal"
          label="Cod poștal"
          placeholder="Ex: 012345"
          value={formData.pickupPostal || ""}
          onChange={(e) => handleChange("pickupPostal", e.target.value)}
        />

        {/* --- Instrucțiuni speciale --- */}
        <FormTextarea
          id="pickupInstructions"
          label="Instrucțiuni speciale pentru acces"
          placeholder="Ex: interfon, acces camion, stradă îngustă..."
          rows={3}
          value={formData.pickupInstructions || ""}
          onChange={(e) => handleChange("pickupInstructions", e.target.value)}
        />
      </div>
    </div>
  );
}
