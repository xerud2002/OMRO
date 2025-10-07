"use client";
import React from "react";

interface StepProps {
  formData: any;
  handleChange: (field: string, value: any) => void;
}

export default function StepDeliveryProperty({ formData, handleChange }: StepProps) {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-emerald-700 mb-6">
        Tipul de proprietate la destinație 🏠
      </h2>

      <div className="max-w-md mx-auto text-left space-y-5">
        {/* Tip proprietate */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Tip proprietate
          </label>
          <select
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-300 outline-none transition-all"
            value={formData.propertyTypeTo}
            onChange={(e) => handleChange("propertyTypeTo", e.target.value)}
          >
            <option value="">Selectează...</option>
            <option>Casă</option>
            <option>Apartament</option>
            <option>Office</option>
            <option>Depozit</option>
          </select>
        </div>

        {/* Casă */}
        {formData.propertyTypeTo === "Casă" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Număr camere
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-300 outline-none transition-all"
                value={formData.roomsTo}
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
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Câte etaje are casa?
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-300 outline-none transition-all"
                value={formData.houseFloorsTo || ""}
                onChange={(e) => handleChange("houseFloorsTo", e.target.value)}
              >
                <option value="">Selectează...</option>
                <option>Parter</option>
                <option>1 etaj</option>
                <option>2 etaje</option>
                <option>3+ etaje</option>
              </select>
            </div>
          </>
        )}

        {/* Apartament / Office */}
        {(formData.propertyTypeTo === "Apartament" ||
          formData.propertyTypeTo === "Office") && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Număr camere
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-300 outline-none transition-all"
                value={formData.roomsTo}
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
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Etaj
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-300 outline-none transition-all"
                value={formData.floorTo}
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
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Există lift?
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-300 outline-none transition-all"
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
