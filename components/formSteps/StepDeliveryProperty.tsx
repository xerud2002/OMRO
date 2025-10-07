"use client";
import React from "react";

interface StepProps {
  formData: any;
  handleChange: (field: string, value: any) => void;
}

/**
 * Step 4 – Destination Property Type
 * Collects details about the destination property (house, apartment, office, etc.)
 */
export default function StepDeliveryProperty({
  formData,
  handleChange,
}: StepProps) {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-emerald-700 mb-6">
        Tipul de proprietate la destinație
      </h2>

      <div className="max-w-md mx-auto text-left space-y-5">
        {/* --- Tip proprietate --- */}
        <div>
          <label
            htmlFor="propertyTypeTo"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Tip proprietate
          </label>
          <select
            id="propertyTypeTo"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
            value={formData.propertyTypeTo || ""}
            onChange={(e) => handleChange("propertyTypeTo", e.target.value)}
          >
            <option value="">Selectează...</option>
            <option value="Casă">Casă</option>
            <option value="Apartament">Apartament</option>
            <option value="Office">Office</option>
            <option value="Depozit">Depozit</option>
          </select>
        </div>

        {/* --- Caz: Casă --- */}
        {formData.propertyTypeTo === "Casă" && (
          <>
            <div>
              <label
                htmlFor="roomsTo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Număr camere
              </label>
              <select
                id="roomsTo"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
                value={formData.roomsTo || ""}
                onChange={(e) => handleChange("roomsTo", e.target.value)}
              >
                <option value="">Selectează...</option>
                <option>1 cameră</option>
                <option>2 camere</option>
                <option>3 camere</option>
                <option>4 camere</option>
                <option>5+ camere</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="houseFloorsTo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Câte etaje are casa?
              </label>
              <select
                id="houseFloorsTo"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
                value={formData.houseFloorsTo || ""}
                onChange={(e) => handleChange("houseFloorsTo", e.target.value)}
              >
                <option value="">Selectează...</option>
                <option>Fără etaj</option>
                <option>1 etaj</option>
                <option>2 etaje</option>
                <option>3+ etaje</option>
              </select>
            </div>
          </>
        )}

        {/* --- Caz: Apartament / Office --- */}
        {(formData.propertyTypeTo === "Apartament" ||
          formData.propertyTypeTo === "Office") && (
          <>
            <div>
              <label
                htmlFor="roomsTo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Număr camere
              </label>
              <select
                id="roomsTo"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
                value={formData.roomsTo || ""}
                onChange={(e) => handleChange("roomsTo", e.target.value)}
              >
                <option value="">Selectează...</option>
                <option>1 cameră</option>
                <option>2 camere</option>
                <option>3 camere</option>
                <option>4 camere</option>
                <option>5+ camere</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="floorTo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Etaj
              </label>
              <select
                id="floorTo"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
                value={formData.floorTo || ""}
                onChange={(e) => handleChange("floorTo", e.target.value)}
              >
                <option value="">Selectează...</option>
                <option>Parter</option>
                <option>Etaj 1</option>
                <option>Etaj 2</option>
                <option>Etaj 3</option>
                <option>Etaj 4</option>
                <option>Etaj 5+</option>
              </select>
            </div>

            {formData.floorTo && formData.floorTo !== "Parter" && (
              <div>
                <label
                  htmlFor="liftTo"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Există lift?
                </label>
                <select
                  id="liftTo"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
                  value={formData.liftTo || ""}
                  onChange={(e) => handleChange("liftTo", e.target.value)}
                >
                  <option value="">Selectează...</option>
                  <option>Da</option>
                  <option>Nu</option>
                </select>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
