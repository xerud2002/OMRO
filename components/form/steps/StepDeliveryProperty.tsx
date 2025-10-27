"use client";
import React from "react";
import { motion } from "framer-motion";
import { Home, Building2, Briefcase, Package } from "lucide-react";

interface StepProps {
  formData: any;
  handleChange: (field: string, value: any) => void;
}

/**
 * Step 4 – Destination Property Type
 * Modern, clean, 4 buttons per row
 */
export default function StepDeliveryProperty({ formData, handleChange }: StepProps) {
  const propertyTypes = [
    { label: "Apartament", icon: <Building2 size={20} /> },
    { label: "Casă", icon: <Home size={20} /> },
    { label: "Birou", icon: <Briefcase size={20} /> },
    { label: "Spațiu de depozitare", icon: <Package size={20} /> },
  ];

  const roomOptions = {
    Apartament: ["Garsonieră", "2 camere", "3 camere", "4+ camere"],
    Casă: ["1 cameră", "2 camere", "3 camere", "4+ camere"],
  };

  const officeOptions = [
    { label: "Mic", desc: "1 birou individual / freelancer" },
    { label: "Mediu", desc: "2-5 birouri / echipă mică" },
    { label: "Mare", desc: "6-10 birouri / firmă medie" },
    { label: "Foarte mare", desc: "peste 10 birouri / sediu complet" },
  ];

  const floorOptions = ["Parter", "Etaj 1", "Etaj 2", "Etaj 3+"];
  const liftOptions = ["Da", "Nu"];

  const storageOptions = [
    { label: "Mic", desc: "Câteva cutii sau obiecte personale" },
    { label: "Mediu", desc: "Mobilier de apartament mic (pat, canapea, cutii)" },
    { label: "Mare", desc: "Mobilier complet pentru 2-3 camere" },
    { label: "Foarte mare", desc: "Mobilier de casă complet sau echipamente voluminoase" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-center space-y-8"
    >
      <h2 className="text-2xl md:text-3xl font-bold text-emerald-700">
        Tipul de proprietate la destinație
      </h2>
      <p className="text-gray-600 max-w-md mx-auto text-sm">
        Alege tipul de proprietate în care vor fi livrate bunurile și oferă câteva detalii despre spațiu și acces.
      </p>

      <motion.div
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-xl mx-auto bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-emerald-100 shadow-lg space-y-6"
      >
        {/* Tip proprietate */}
        <div>
          <p className="font-semibold text-emerald-700 mb-3 text-sm">Tip proprietate</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {propertyTypes.map((type) => (
              <motion.button
                key={type.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleChange("propertyTypeTo", type.label)}
                className={`flex flex-col items-center justify-center gap-2 py-3 rounded-2xl border transition-all ${
                  formData.propertyTypeTo === type.label
                    ? "bg-gradient-to-r from-emerald-500 to-sky-500 text-white shadow-md"
                    : "bg-white border-emerald-200 text-gray-700 hover:border-emerald-400"
                }`}
              >
                {type.icon}
                <span className="text-sm font-medium">{type.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Apartament */}
        {formData.propertyTypeTo === "Apartament" && (
          <>
            <PropertySection
              title="Număr camere"
              options={roomOptions.Apartament}
              selected={formData.roomsTo}
              onSelect={(v) => handleChange("roomsTo", v)}
            />

            <PropertySection
              title="Etaj"
              options={floorOptions}
              selected={formData.floorTo}
              onSelect={(v) => handleChange("floorTo", v)}
            />

            {formData.floorTo && formData.floorTo !== "Parter" && (
              <PropertySection
                title="Există lift?"
                options={liftOptions}
                selected={formData.liftTo}
                onSelect={(v) => handleChange("liftTo", v)}
              />
            )}
          </>
        )}

        {/* Casă */}
        {formData.propertyTypeTo === "Casă" && (
          <>
            <PropertySection
              title="Număr camere"
              options={roomOptions.Casă}
              selected={formData.roomsTo}
              onSelect={(v) => handleChange("roomsTo", v)}
            />

            <PropertySection
              title="Câte etaje are casa?"
              options={["Fără etaj", "1 etaj", "2 etaje", "3+ etaje"]}
              selected={formData.houseFloorsTo}
              onSelect={(v) => handleChange("houseFloorsTo", v)}
            />
          </>
        )}

        {/* Birou */}
        {formData.propertyTypeTo === "Birou" && (
          <>
            <div>
              <p className="font-semibold text-emerald-700 mb-3 text-sm">Dimensiunea biroului</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {officeOptions.map((s) => (
                  <motion.button
                    key={s.label}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handleChange("officeSizeTo", s.label)}
                    className={`p-4 rounded-2xl border text-sm text-left transition-all ${
                      formData.officeSizeTo === s.label
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

            <PropertySection
              title="Etaj"
              options={floorOptions}
              selected={formData.floorTo}
              onSelect={(v) => handleChange("floorTo", v)}
            />

            {formData.floorTo && formData.floorTo !== "Parter" && (
              <PropertySection
                title="Există lift?"
                options={liftOptions}
                selected={formData.liftTo}
                onSelect={(v) => handleChange("liftTo", v)}
              />
            )}
          </>
        )}

        {/* Spațiu de depozitare */}
        {formData.propertyTypeTo === "Spațiu de depozitare" && (
          <div>
            <p className="font-semibold text-emerald-700 mb-3 text-sm">Mărimea spațiului</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {storageOptions.map((s) => (
                <motion.button
                  key={s.label}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleChange("storageSizeTo", s.label)}
                  className={`p-4 rounded-2xl border text-sm text-left transition-all ${
                    formData.storageSizeTo === s.label
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
      </motion.div>
    </motion.div>
  );
}

/* ✅ Reusable subcomponent for option groups (4 per row) */
function PropertySection({
  title,
  options,
  selected,
  onSelect,
}: {
  title: string;
  options: string[];
  selected: string;
  onSelect: (val: string) => void;
}) {
  return (
    <div>
      <p className="font-semibold text-emerald-700 mb-3 text-sm">{title}</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {options.map((opt) => (
          <motion.button
            key={opt}
            whileHover={{ scale: 1.05 }}
            onClick={() => onSelect(opt)}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
              selected === opt
                ? "bg-gradient-to-r from-emerald-500 to-sky-500 text-white"
                : "bg-white border-emerald-200 text-gray-700 hover:border-emerald-400"
            }`}
          >
            {opt}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
