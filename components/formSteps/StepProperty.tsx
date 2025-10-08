"use client";
import React from "react";
import FormInput from "../../components/form/FormInput";
import FormSelect from "../../components/form/FormSelect";

interface StepProps {
  formData: any;
  handleChange: (field: string, value: any) => void;
}

/**
 * Step 2 – Property Type & Collection Details
 * Collects details about the pickup property (house, apartment, office, storage).
 */
export default function StepProperty({ formData, handleChange }: StepProps) {
  const propertyOptions = [
    { value: "Casă", label: "Casă" },
    { value: "Apartament", label: "Apartament" },
    { value: "Office", label: "Office" },
    { value: "Storage", label: "Depozit / Storage" },
  ];

  const roomOptions = [
    { value: "1 cameră", label: "1 cameră" },
    { value: "2 camere", label: "2 camere" },
    { value: "3 camere", label: "3 camere" },
    { value: "4 camere", label: "4 camere" },
    { value: "5+ camere", label: "5+ camere" },
  ];

  const floorOptions = [
    { value: "Parter", label: "Parter" },
    { value: "Etaj 1", label: "Etaj 1" },
    { value: "Etaj 2", label: "Etaj 2" },
    { value: "Etaj 3", label: "Etaj 3" },
    { value: "Etaj 4", label: "Etaj 4" },
    { value: "Etaj 5+", label: "Etaj 5+" },
  ];

  const liftOptions = [
    { value: "Da", label: "Da" },
    { value: "Nu", label: "Nu" },
  ];

  const houseFloorOptions = [
    { value: "Fără etaj", label: "Fără etaj" },
    { value: "1 etaj", label: "1 etaj" },
    { value: "2 etaje", label: "2 etaje" },
    { value: "3 etaje", label: "3 etaje" },
  ];

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-emerald-700 mb-6">
        Tipul de proprietate și detalii colectare
      </h2>

      <div className="max-w-md mx-auto text-left space-y-5">
        {/* --- Tip proprietate --- */}
        <FormSelect
          id="propertyType"
          label="Tip proprietate"
          options={propertyOptions}
          value={formData.propertyType || ""}
          onChange={(e) => handleChange("propertyType", e.target.value)}
        />

        {/* --- Mărime / Camere --- */}
        {formData.propertyType && (
          <>
            {formData.propertyType === "Storage" ? (
              <FormInput
                id="storageSize"
                type="number"
                min="1"
                label="Mărimea spațiului (m³)"
                placeholder="Ex: 12"
                value={formData.rooms || ""}
                onChange={(e) => handleChange("rooms", e.target.value)}
              />
            ) : (
              <FormSelect
                id="rooms"
                label="Număr camere"
                options={roomOptions}
                value={formData.rooms || ""}
                onChange={(e) => handleChange("rooms", e.target.value)}
              />
            )}
          </>
        )}

        {/* --- Detalii pentru casă --- */}
        {formData.propertyType === "Casă" && formData.rooms && (
          <FormSelect
            id="houseFloors"
            label="Câte etaje are casa?"
            options={houseFloorOptions}
            value={formData.houseFloors || ""}
            onChange={(e) => handleChange("houseFloors", e.target.value)}
          />
        )}

        {/* --- Detalii pentru apartament / office --- */}
        {(formData.propertyType === "Apartament" ||
          formData.propertyType === "Office") &&
          formData.rooms && (
            <>
              <FormSelect
                id="floor"
                label="La ce etaj este?"
                options={floorOptions}
                value={formData.floor || ""}
                onChange={(e) => handleChange("floor", e.target.value)}
              />

              {formData.floor && formData.floor !== "Parter" && (
                <FormSelect
                  id="lift"
                  label="Există lift?"
                  options={liftOptions}
                  value={formData.lift || ""}
                  onChange={(e) => handleChange("lift", e.target.value)}
                />
              )}
            </>
          )}
      </div>
    </div>
  );
}
