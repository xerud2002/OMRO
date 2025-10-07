"use client";
import React from "react";

interface StepProps {
  formData: any;
  handleChange: (field: string, value: any) => void;
}

/**
 * Step 2 – Property Type & Collection Details
 * Collects details about the pickup property (house, apartment, office, storage).
 */
export default function StepProperty({ formData, handleChange }: StepProps) {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-emerald-700 mb-6">
        Tipul de proprietate și detalii colectare
      </h2>

      <div className="max-w-md mx-auto text-left space-y-5">
        {/* --- Tip proprietate --- */}
        <div>
          <label
            htmlFor="propertyType"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Tip proprietate
          </label>
          <select
            id="propertyType"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
            value={formData.propertyType || ""}
            onChange={(e) => handleChange("propertyType", e.target.value)}
          >
            <option value="">Selectează tipul</option>
            <option value="Casă">Casă</option>
            <option value="Apartament">Apartament</option>
            <option value="Office">Office</option>
            <option value="Storage">Depozit / Storage</option>
          </select>
        </div>

        {/* --- Mărime / Camere --- */}
        {formData.propertyType && (
          <div>
            {formData.propertyType === "Storage" ? (
              <>
                <label
                  htmlFor="storageSize"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mărimea spațiului (m³)
                </label>
                <input
                  id="storageSize"
                  type="number"
                  min="1"
                  placeholder="Ex: 12"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
                  value={formData.rooms || ""}
                  onChange={(e) => handleChange("rooms", e.target.value)}
                />
              </>
            ) : (
              <>
                <label
                  htmlFor="rooms"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Număr camere
                </label>
                <select
                  id="rooms"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
                  value={formData.rooms || ""}
                  onChange={(e) => handleChange("rooms", e.target.value)}
                >
                  <option value="">Selectează</option>
                  <option>1 cameră</option>
                  <option>2 camere</option>
                  <option>3 camere</option>
                  <option>4 camere</option>
                  <option>5+ camere</option>
                </select>
              </>
            )}
          </div>
        )}

        {/* --- Detalii pentru casă --- */}
        {formData.propertyType === "Casă" && formData.rooms && (
          <div>
            <label
              htmlFor="houseFloors"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Câte etaje are casa?
            </label>
            <select
              id="houseFloors"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
              value={formData.houseFloors || ""}
              onChange={(e) => handleChange("houseFloors", e.target.value)}
            >
              <option value="">Selectează</option>
              <option>Fără etaj</option>
              <option>1 etaj</option>
              <option>2 etaje</option>
              <option>3 etaje</option>
            </select>
          </div>
        )}

        {/* --- Detalii pentru apartament / office --- */}
        {(formData.propertyType === "Apartament" ||
          formData.propertyType === "Office") &&
          formData.rooms && (
            <>
              <div>
                <label
                  htmlFor="floor"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  La ce etaj este?
                </label>
                <select
                  id="floor"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
                  value={formData.floor || ""}
                  onChange={(e) => handleChange("floor", e.target.value)}
                >
                  <option value="">Selectează</option>
                  <option>Parter</option>
                  <option>Etaj 1</option>
                  <option>Etaj 2</option>
                  <option>Etaj 3</option>
                  <option>Etaj 4</option>
                  <option>Etaj 5+</option>
                </select>
              </div>

              {formData.floor && formData.floor !== "Parter" && (
                <div>
                  <label
                    htmlFor="lift"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Există lift?
                  </label>
                  <select
                    id="lift"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
                    value={formData.lift || ""}
                    onChange={(e) => handleChange("lift", e.target.value)}
                  >
                    <option value="">Selectează</option>
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
