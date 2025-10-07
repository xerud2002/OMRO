"use client";
import React from "react";
import Select from "react-select";
import counties from "../../utils/counties";

interface StepProps {
  formData: any;
  handleChange: (field: string, value: any) => void;
}

export default function StepPickupAddress({ formData, handleChange }: StepProps) {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-emerald-700 mb-6">
        Adresa completă de colectare 🚚
      </h2>

      <div className="max-w-md mx-auto text-left space-y-4">
        {/* Județ */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Județ
          </label>
          <Select
            className="react-select-container"
            options={counties.map((c) => ({ value: c, label: c }))}
            onChange={(opt) => handleChange("pickupCounty", opt?.value)}
            value={
              formData.pickupCounty
                ? { value: formData.pickupCounty, label: formData.pickupCounty }
                : null
            }
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

        {/* Oraș */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Oraș / Localitate
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-300 outline-none transition-all"
            placeholder="Ex: București, Cluj, Iași..."
            value={formData.pickupCity || ""}
            onChange={(e) => handleChange("pickupCity", e.target.value)}
          />
        </div>

        {/* Stradă și număr */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Stradă
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-300 outline-none transition-all"
              value={formData.pickupStreet || ""}
              onChange={(e) => handleChange("pickupStreet", e.target.value)}
            />
          </div>

          <div className="w-1/3">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Nr.
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-300 outline-none transition-all"
              value={formData.pickupNumber || ""}
              onChange={(e) => handleChange("pickupNumber", e.target.value)}
            />
          </div>
        </div>

        {/* Detalii suplimentare */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Bloc / Scara / Etaj / Apartament (opțional)
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-300 outline-none transition-all"
            value={formData.pickupDetails || ""}
            onChange={(e) => handleChange("pickupDetails", e.target.value)}
          />
        </div>

        {/* Cod poștal */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Cod poștal
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-300 outline-none transition-all"
            placeholder="Ex: 012345"
            value={formData.pickupPostal || ""}
            onChange={(e) => handleChange("pickupPostal", e.target.value)}
          />
        </div>

        {/* Instrucțiuni speciale */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Instrucțiuni speciale pentru acces
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-300 outline-none transition-all"
            rows={3}
            placeholder="Ex: interfon, acces camion, stradă îngustă..."
            value={formData.pickupInstructions || ""}
            onChange={(e) => handleChange("pickupInstructions", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
