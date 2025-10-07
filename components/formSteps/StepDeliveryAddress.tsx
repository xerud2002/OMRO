"use client";
import React from "react";
import Select from "react-select";
import counties from "../../utils/counties";

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
        <div>
          <label
            htmlFor="deliveryCity"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Oraș / Localitate
          </label>
          <input
            id="deliveryCity"
            type="text"
            placeholder="Ex: București, Cluj-Napoca"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
            value={formData.deliveryCity || ""}
            onChange={(e) => handleChange("deliveryCity", e.target.value)}
          />
        </div>

        {/* --- Stradă și număr --- */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label
              htmlFor="deliveryStreet"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Stradă
            </label>
            <input
              id="deliveryStreet"
              type="text"
              placeholder="Ex: Strada Florilor"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
              value={formData.deliveryStreet || ""}
              onChange={(e) => handleChange("deliveryStreet", e.target.value)}
            />
          </div>

          <div className="sm:w-1/3">
            <label
              htmlFor="deliveryNumber"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nr.
            </label>
            <input
              id="deliveryNumber"
              type="text"
              placeholder="Ex: 12A"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
              value={formData.deliveryNumber || ""}
              onChange={(e) => handleChange("deliveryNumber", e.target.value)}
            />
          </div>
        </div>

        {/* --- Detalii suplimentare --- */}
        <div>
          <label
            htmlFor="deliveryDetails"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Bloc / Scara / Etaj / Apartament (opțional)
          </label>
          <input
            id="deliveryDetails"
            type="text"
            placeholder="Ex: Bloc A, Scara 2, Etaj 3, Ap. 12"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
            value={formData.deliveryDetails || ""}
            onChange={(e) => handleChange("deliveryDetails", e.target.value)}
          />
        </div>

        {/* --- Cod poștal --- */}
        <div>
          <label
            htmlFor="deliveryPostal"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Cod poștal
          </label>
          <input
            id="deliveryPostal"
            type="text"
            placeholder="Ex: 010101"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
            value={formData.deliveryPostal || ""}
            onChange={(e) => handleChange("deliveryPostal", e.target.value)}
          />
        </div>

        {/* --- Instrucțiuni --- */}
        <div>
          <label
            htmlFor="deliveryInstructions"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Instrucțiuni speciale pentru acces (ex: interfon, restricții)
          </label>
          <textarea
            id="deliveryInstructions"
            rows={3}
            placeholder="Ex: Interfon 123, acces prin spatele blocului"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
            value={formData.deliveryInstructions || ""}
            onChange={(e) =>
              handleChange("deliveryInstructions", e.target.value)
            }
          />
        </div>
      </div>
    </div>
  );
}
