"use client";
import React from "react";
import { motion } from "framer-motion";

interface StepProps {
  formData: any;
  handleChange: (field: string, value: any) => void;
}

/**
 * Step 2 – Property Type & Size
 * Allows user to choose property type and related details (dynamic buttons)
 */
export default function StepProperty({ formData, handleChange }: StepProps) {
  const propertyTypes = ["Apartament", "Casă", "Birou", "Spațiu de depozitare"];

  const roomOptions = {
    Apartament: ["Garsonieră", "2 camere", "3 camere", "4 camere", "5+ camere"],
    Casă: ["1 cameră", "2 camere", "3 camere", "4 camere", "5+ camere"],
    Birou: ["1 birou", "2-3 birouri", "4-6 birouri", "7-10 birouri", "10+ birouri"],
  };

  const floorOptions = ["Parter", "Etaj 1", "Etaj 2", "Etaj 3", "Etaj 4", "Etaj 5+"];
  const liftOptions = ["Da", "Nu"];

  const storageOptions = [
    { label: "Mic", desc: "Câteva cutii sau obiecte personale" },
    { label: "Mediu", desc: "Mobilier de apartament mic (pat, canapea, cutii)" },
    { label: "Mare", desc: "Mobilier complet pentru 2-3 camere" },
    { label: "Foarte mare", desc: "Mobilier de casă complet sau echipamente voluminoase" },
  ];

  return (
    <div className="text-center space-y-6">
      <h2 className="text-2xl font-bold text-emerald-700">
        Tipul de proprietate și detalii colectare
      </h2>
      <p className="text-gray-600 max-w-md mx-auto text-sm">
        Alege tipul de proprietate de la care colectăm bunurile și oferă câteva detalii despre mărime și acces.
      </p>

      <div className="max-w-xl mx-auto bg-white/60 rounded-2xl p-6 border border-emerald-100 shadow-sm space-y-6">
        {/* --- Tip proprietate --- */}
        <div>
          <p className="font-medium text-emerald-700 mb-3">Tip proprietate</p>
          <div className="flex flex-wrap justify-center gap-3">
            {propertyTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleChange("propertyType", type)}
                className={`px-5 py-2.5 rounded-full border transition-all text-sm font-medium ${
                  formData.propertyType === type
                    ? "bg-gradient-to-r from-emerald-500 to-sky-500 text-white shadow-md"
                    : "bg-white border-emerald-200 text-gray-700 hover:border-emerald-400"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* --- Caz: Apartament --- */}
        {formData.propertyType === "Apartament" && (
          <>
            <div>
              <p className="font-medium text-emerald-700 mb-3">Număr camere</p>
              <div className="flex flex-wrap justify-center gap-3">
                {roomOptions.Apartament.map((r) => (
                  <button
                    key={r}
                    onClick={() => handleChange("rooms", r)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                      formData.rooms === r
                        ? "bg-gradient-to-r from-emerald-500 to-sky-500 text-white"
                        : "bg-white border-emerald-200 text-gray-700 hover:border-emerald-400"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-medium text-emerald-700 mb-3">Etaj</p>
              <div className="flex flex-wrap justify-center gap-3">
                {floorOptions.map((f) => (
                  <button
                    key={f}
                    onClick={() => handleChange("floor", f)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                      formData.floor === f
                        ? "bg-gradient-to-r from-emerald-500 to-sky-500 text-white"
                        : "bg-white border-emerald-200 text-gray-700 hover:border-emerald-400"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {formData.floor && formData.floor !== "Parter" && (
              <div>
                <p className="font-medium text-emerald-700 mb-3">Există lift?</p>
                <div className="flex justify-center gap-4">
                  {liftOptions.map((l) => (
                    <button
                      key={l}
                      onClick={() => handleChange("lift", l)}
                      className={`px-6 py-2 rounded-full border text-sm font-medium transition-all ${
                        formData.lift === l
                          ? "bg-gradient-to-r from-emerald-500 to-sky-500 text-white"
                          : "bg-white border-emerald-200 text-gray-700 hover:border-emerald-400"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* --- Caz: Casă --- */}
        {formData.propertyType === "Casă" && (
          <>
            <div>
              <p className="font-medium text-emerald-700 mb-3">Număr camere</p>
              <div className="flex flex-wrap justify-center gap-3">
                {roomOptions.Casă.map((r) => (
                  <button
                    key={r}
                    onClick={() => handleChange("rooms", r)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                      formData.rooms === r
                        ? "bg-gradient-to-r from-emerald-500 to-sky-500 text-white"
                        : "bg-white border-emerald-200 text-gray-700 hover:border-emerald-400"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-medium text-emerald-700 mb-3">Câte etaje are casa?</p>
              <div className="flex flex-wrap justify-center gap-3">
                {["Fără etaj", "1 etaj", "2 etaje", "3+ etaje"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleChange("houseFloors", opt)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                      formData.houseFloors === opt
                        ? "bg-gradient-to-r from-emerald-500 to-sky-500 text-white"
                        : "bg-white border-emerald-200 text-gray-700 hover:border-emerald-400"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* --- Caz: Birou --- */}
        {formData.propertyType === "Birou" && (
          <>
            <div>
              <p className="font-medium text-emerald-700 mb-3">Număr birouri</p>
              <div className="flex flex-wrap justify-center gap-3">
                {roomOptions.Birou.map((r) => (
                  <button
                    key={r}
                    onClick={() => handleChange("rooms", r)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                      formData.rooms === r
                        ? "bg-gradient-to-r from-emerald-500 to-sky-500 text-white"
                        : "bg-white border-emerald-200 text-gray-700 hover:border-emerald-400"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-medium text-emerald-700 mb-3">Etaj</p>
              <div className="flex flex-wrap justify-center gap-3">
                {floorOptions.map((f) => (
                  <button
                    key={f}
                    onClick={() => handleChange("floor", f)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                      formData.floor === f
                        ? "bg-gradient-to-r from-emerald-500 to-sky-500 text-white"
                        : "bg-white border-emerald-200 text-gray-700 hover:border-emerald-400"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {formData.floor && formData.floor !== "Parter" && (
              <div>
                <p className="font-medium text-emerald-700 mb-3">Există lift?</p>
                <div className="flex justify-center gap-4">
                  {liftOptions.map((l) => (
                    <button
                      key={l}
                      onClick={() => handleChange("lift", l)}
                      className={`px-6 py-2 rounded-full border text-sm font-medium transition-all ${
                        formData.lift === l
                          ? "bg-gradient-to-r from-emerald-500 to-sky-500 text-white"
                          : "bg-white border-emerald-200 text-gray-700 hover:border-emerald-400"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* --- Caz: Spațiu de depozitare --- */}
        {formData.propertyType === "Spațiu de depozitare" && (
          <div>
            <p className="font-medium text-emerald-700 mb-3">Mărimea spațiului</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {storageOptions.map((s) => (
                <motion.button
                  key={s.label}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleChange("storageSize", s.label)}
                  className={`p-4 rounded-2xl border text-sm text-left transition-all ${
                    formData.storageSize === s.label
                      ? "bg-gradient-to-r from-emerald-500 to-sky-500 text-white shadow-md"
                      : "bg-white border-emerald-200 text-gray-700 hover:border-emerald-400"
                  }`}
                >
                  <p className="font-semibold">{s.label}</p>
                  <p className="text-xs opacity-80 mt-1">{s.desc}</p>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
