"use client";
import React from "react";
import Select from "react-select";
import counties from "../../utils/counties";

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
        <div>
          <label
            htmlFor="pickupCity"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Oraș / Localitate
          </label>
          <input
            id="pickupCity"
            type="text"
            placeholder="Ex: București, Cluj, Iași..."
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
            value={formData.pickupCity || ""}
            onChange={(e) => handleChange("pickupCity", e.target.value)}
          />
        </div>

        {/* --- Stradă și număr --- */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label
              htmlFor="pickupStreet"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Stradă
            </label>
            <input
              id="pickupStreet"
              type="text"
              placeholder="Ex: Str. Mihai Eminescu"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
              value={formData.pickupStreet || ""}
              onChange={(e) => handleChange("pickupStreet", e.target.value)}
            />
          </div>

          <div className="sm:w-1/3">
            <label
              htmlFor="pickupNumber"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nr.
            </label>
            <input
              id="pickupNumber"
              type="text"
              placeholder="Ex: 24A"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
              value={formData.pickupNumber || ""}
              onChange={(e) => handleChange("pickupNumber", e.target.value)}
            />
          </div>
        </div>

        {/* --- Detalii suplimentare --- */}
        <div>
          <label
            htmlFor="pickupDetails"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Bloc / Scara / Etaj / Apartament (opțional)
          </label>
          <input
            id="pickupDetails"
            type="text"
            placeholder="Ex: Bloc C3, Sc. 2, Et. 4, Ap. 12"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
            value={formData.pickupDetails || ""}
            onChange={(e) => handleChange("pickupDetails", e.target.value)}
          />
        </div>

        {/* --- Cod poștal --- */}
        <div>
          <label
            htmlFor="pickupPostal"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Cod poștal
          </label>
          <input
            id="pickupPostal"
            type="text"
            placeholder="Ex: 012345"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
            value={formData.pickupPostal || ""}
            onChange={(e) => handleChange("pickupPostal", e.target.value)}
          />
        </div>

        {/* --- Instrucțiuni speciale --- */}
        <div>
          <label
            htmlFor="pickupInstructions"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Instrucțiuni speciale pentru acces
          </label>
          <textarea
            id="pickupInstructions"
            rows={3}
            placeholder="Ex: interfon, acces camion, stradă îngustă..."
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
            value={formData.pickupInstructions || ""}
            onChange={(e) => handleChange("pickupInstructions", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
