"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import FormInput from "../../components/form/FormInput";
import FormSelect from "../../components/form/FormSelect";

interface StepProps {
  formData: Record<string, any>;
  handleChange: (field: string, value: any) => void;
}

/**
 * Step 2 – Tip proprietate & detalii colectare
 */
export default function StepProperty({ formData, handleChange }: StepProps) {
  const propertyOptions = [
    { value: "Casă", label: "Casă" },
    { value: "Apartament", label: "Apartament" },
    { value: "Office", label: "Office" },
    { value: "Storage", label: "Depozit / Storage" },
  ];

  const roomOptions = [
    "1 cameră",
    "2 camere",
    "3 camere",
    "4 camere",
    "5+ camere",
  ].map((r) => ({ value: r, label: r }));

  const floorOptions = [
    "Parter",
    "Etaj 1",
    "Etaj 2",
    "Etaj 3",
    "Etaj 4",
    "Etaj 5+",
  ].map((f) => ({ value: f, label: f }));

  const liftOptions = ["Da", "Nu"].map((v) => ({ value: v, label: v }));

  const houseFloorOptions = [
    "Fără etaj",
    "1 etaj",
    "2 etaje",
    "3 etaje",
  ].map((f) => ({ value: f, label: f }));

  return (
    <div className="text-center space-y-8">
      <h2 className="text-2xl font-bold text-emerald-700">
        Tipul de proprietate și detalii colectare
      </h2>

      <p className="text-gray-600 text-sm max-w-lg mx-auto">
        Alege tipul de proprietate de la care colectăm bunurile și oferă câteva detalii
        despre mărime și acces.
      </p>

      <div className="max-w-md mx-auto text-left space-y-6 bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-emerald-100 shadow-sm">
        {/* Tip proprietate */}
        <FormSelect
          id="propertyType"
          label="Tip proprietate"
          options={propertyOptions}
          value={formData.propertyType || ""}
          onChange={(e) => handleChange("propertyType", e.target.value)}
        />

        <AnimatePresence mode="wait">
          {formData.propertyType && (
            <motion.div
              key={formData.propertyType}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              {/* Mărime / camere */}
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

              {/* Caz special: Casă */}
              {formData.propertyType === "Casă" && formData.rooms && (
                <FormSelect
                  id="houseFloors"
                  label="Câte etaje are casa?"
                  options={houseFloorOptions}
                  value={formData.houseFloors || ""}
                  onChange={(e) =>
                    handleChange("houseFloors", e.target.value)
                  }
                />
              )}

              {/* Apartament / Office */}
              {(formData.propertyType === "Apartament" ||
                formData.propertyType === "Office") &&
                formData.rooms && (
                  <>
                    <FormSelect
                      id="floor"
                      label="La ce etaj este?"
                      options={floorOptions}
                      value={formData.floor || ""}
                      onChange={(e) =>
                        handleChange("floor", e.target.value)
                      }
                    />

                    {formData.floor &&
                      formData.floor !== "Parter" && (
                        <FormSelect
                          id="lift"
                          label="Există lift?"
                          options={liftOptions}
                          value={formData.lift || ""}
                          onChange={(e) =>
                            handleChange("lift", e.target.value)
                          }
                        />
                      )}
                  </>
                )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
