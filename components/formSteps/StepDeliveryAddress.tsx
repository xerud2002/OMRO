"use client";
import React from "react";
import Select from "react-select";
import counties from "../../utils/counties";

interface StepProps {
  formData: any;
  handleChange: (field: string, value: any) => void;
}

export default function StepDeliveryAddress({ formData, handleChange }: StepProps) {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-emerald-700 mb-6">
        Adresa completă de livrare 🏠
      </h2>

      <div className="max-w-md mx-auto text-left space-y-4">
        {/* Județ */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Județ
          </label>
          <Select
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="Selectează județul"
            options={counties.map((c) => ({ value: c, label: c }))}
            onChange={(opt) => handleChange("deliveryCounty", opt?.value)}
            value={
              formData.deliveryCounty
                ? { value: formData.deliveryCounty, label: formData.deliveryCounty }
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

        {/* Oraș / Localitate */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Oraș / Localitate
          </label>
          <input
            type="text"
            placeholder="Ex: București, Cluj-Napoca"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-300 outline-none transition-all"
            value={formData.deliveryCity || ""}
            onChange={(e) => handleChange("deliveryCity", e.target.value)}
          />
        </div>

        {/* Stradă */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Stradă
          </label>
          <input
            type="text"
            placeholder="Ex: Strada Florilor"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-300 outline-none transition-all"
            value={formData.deliveryStreet || ""}
            onChange={(e) => handleChange("deliveryStreet", e.target.value)}
          />
        </div>

        {/* Număr */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Număr
          </label>
          <input
            type="text"
            placeholder="Ex: Nr. 12"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-300 outline-none transition-all"
            value={formData.deliveryNumber || ""}
            onChange={(e) => handleChange("deliveryNumber", e.target.value)}
          />
        </div>

        {/* Bloc / Scara / Etaj */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Bloc / Scara / Etaj / Apartament (opțional)
          </label>
          <input
            type="text"
            placeholder="Ex: Bloc A, Scara 2, Etaj 3, Ap. 12"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-300 outline-none transition-all"
            value={formData.deliveryDetails || ""}
            onChange={(e) => handleChange("deliveryDetails", e.target.value)}
          />
        </div>

        {/* Cod poștal */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Cod poștal
          </label>
          <input
            type="text"
            placeholder="Ex: 010101"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-300 outline-none transition-all"
            value={formData.deliveryPostal || ""}
            onChange={(e) => handleChange("deliveryPostal", e.target.value)}
          />
        </div>

        {/* Instrucțiuni */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Instrucțiuni speciale (ex: interfon, restricții, acces)
          </label>
          <textarea
            rows={3}
            placeholder="Ex: Interfon 123, acces prin spatele blocului"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-300 outline-none transition-all"
            value={formData.deliveryInstructions || ""}
            onChange={(e) => handleChange("deliveryInstructions", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
