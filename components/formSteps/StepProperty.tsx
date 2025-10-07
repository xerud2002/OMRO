"use client";
import React from "react";

interface StepProps {
  formData: any;
  handleChange: (field: string, value: any) => void;
}

export default function StepProperty({ formData, handleChange }: StepProps) {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-emerald-700 mb-6">
        Tipul de proprietate și detalii colectare 🏠
      </h2>

      <div className="max-w-md mx-auto text-left space-y-4">
        {/* Tip proprietate */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Tip proprietate
          </label>
          <select
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-300 outline-none transition-all"
            value={formData.propertyType || ""}
            onChange={(e) => handleChange("propertyType", e.target.value)}
            aria-label="Tip proprietate"
          >
            <option value="">Selectează tipul</option>
            <option>Casă</option>
            <option>Apartament</option>
            <option>Office</option>
            <option>Storage</option>
          </select>
        </div>

        {/* Mărime / Camere */}
        {formData.propertyType && (
          <>
            {formData.propertyType === "Storage" ? (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Mărimea spațiului (m³)
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-300 outline-none transition-all"
                  value={formData.rooms || ""}
                  onChange={(e) => handleChange("rooms", e.target.value)}
                  placeholder="Ex: 12"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Număr camere
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-300 outline-none transition-all"
                  value={formData.rooms || ""}
                  onChange={(e) => handleChange("rooms", e.target.value)}
                  aria-label="Număr camere"
                >
                  <option value="">Selectează</option>
                  <option>1 cameră</option>
                  <option>2 camere</option>
                  <option>3 camere</option>
                  <option>4 camere</option>
                  <option>5+ camere</option>
                </select>
              </div>
            )}
          </>
        )}

        {/* Detalii pentru casă */}
        {formData.propertyType === "Casă" && formData.rooms && (
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Câte etaje are casa?
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-300 outline-none transition-all"
              value={formData.houseFloors || ""}
              onChange={(e) => handleChange("houseFloors", e.target.value)}
              aria-label="Etaje casă"
            >
              <option value="">Selectează</option>
              <option>Fără etaj</option>
              <option>1 etaj</option>
              <option>2 etaje</option>
              <option>3 etaje</option>
            </select>
          </div>
        )}

        {/* Detalii pentru apartament / office */}
        {(formData.propertyType === "Apartament" ||
          formData.propertyType === "Office") &&
          formData.rooms && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  La ce etaj este?
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-300 outline-none transition-all"
                  value={formData.floor || ""}
                  onChange={(e) => handleChange("floor", e.target.value)}
                  aria-label="Etaj"
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

              {formData.floor !== "" && formData.floor !== "Parter" && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Există lift?
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-300 outline-none transition-all"
                    value={formData.lift || ""}
                    onChange={(e) => handleChange("lift", e.target.value)}
                    aria-label="Lift disponibil"
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
