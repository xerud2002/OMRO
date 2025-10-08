"use client";
import React from "react";
import FormSelect from "../../components/form/FormSelect";

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
  const propertyOptions = [
    { value: "Casă", label: "Casă" },
    { value: "Apartament", label: "Apartament" },
    { value: "Office", label: "Office" },
    { value: "Depozit", label: "Depozit" },
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
    { value: "3+ etaje", label: "3+ etaje" },
  ];

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-emerald-700 mb-6">
        Tipul de proprietate la destinație
      </h2>

      <div className="max-w-md mx-auto text-left space-y-5">
        {/* --- Tip proprietate --- */}
        <FormSelect
          id="propertyTypeTo"
          label="Tip proprietate"
          options={propertyOptions}
          value={formData.propertyTypeTo || ""}
          onChange={(e) => handleChange("propertyTypeTo", e.target.value)}
        />

        {/* --- Caz: Casă --- */}
        {formData.propertyTypeTo === "Casă" && (
          <>
            <FormSelect
              id="roomsTo"
              label="Număr camere"
              options={roomOptions}
              value={formData.roomsTo || ""}
              onChange={(e) => handleChange("roomsTo", e.target.value)}
            />

            <FormSelect
              id="houseFloorsTo"
              label="Câte etaje are casa?"
              options={houseFloorOptions}
              value={formData.houseFloorsTo || ""}
              onChange={(e) => handleChange("houseFloorsTo", e.target.value)}
            />
          </>
        )}

        {/* --- Caz: Apartament / Office --- */}
        {(formData.propertyTypeTo === "Apartament" ||
          formData.propertyTypeTo === "Office") && (
          <>
            <FormSelect
              id="roomsTo"
              label="Număr camere"
              options={roomOptions}
              value={formData.roomsTo || ""}
              onChange={(e) => handleChange("roomsTo", e.target.value)}
            />

            <FormSelect
              id="floorTo"
              label="Etaj"
              options={floorOptions}
              value={formData.floorTo || ""}
              onChange={(e) => handleChange("floorTo", e.target.value)}
            />

            {formData.floorTo && formData.floorTo !== "Parter" && (
              <FormSelect
                id="liftTo"
                label="Există lift?"
                options={liftOptions}
                value={formData.liftTo || ""}
                onChange={(e) => handleChange("liftTo", e.target.value)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
