"use client";
import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { counties } from "../../utils/counties";
import FormInput from "./FormInput";
interface AddressSelectorProps {
  type: "pickup" | "delivery";
  formData: Record<string, any>;
  handleChange: (field: string, value: any) => void;
}

/**
 * Componet reutilizabil pentru selectarea județ + oraș / comună
 * Include fallback “Altă localitate” + încărcare dinamică a orașelor.
 */
export default function AddressSelector({ type, formData, handleChange }: AddressSelectorProps) {
  const prefix = type === "pickup" ? "pickup" : "delivery";

  const [cities, setCities] = useState<Record<string, string[]>>({});

  // Lazy-load cities doar când componenta e montată
  useEffect(() => {
    import("../../extra/cities").then((mod) => setCities(mod.default));
  }, []);

  // Opțiuni orașe pe baza județului selectat
  const cityOptions = useMemo(() => {
    const county = formData[`${prefix}County`];
    if (!county || !cities[county]) return [];
    const list = cities[county] || [];
    return [
      ...list.map((c) => ({ value: c, label: c })),
      { value: "other", label: "Altă localitate / comună" },
    ];
  }, [formData[`${prefix}County`], cities]);

  const selectedCity =
    cityOptions.find((c) => c.value === formData[`${prefix}City`]) || null;

  return (
    <div className="space-y-5">
      {/* Județ */}
      <div>
        <label
          htmlFor={`${prefix}County`}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Județ <span className="text-emerald-500">*</span>
        </label>
        <Select
          inputId={`${prefix}County`}
          options={counties.map((c) => ({ value: c, label: c }))}
          onChange={(opt) => {
            handleChange(`${prefix}County`, opt?.value || "");
            handleChange(`${prefix}City`, "");
          }}
          value={
            formData[`${prefix}County`]
              ? {
                  value: formData[`${prefix}County`],
                  label: formData[`${prefix}County`],
                }
              : null
          }
          placeholder="Selectează județul"
          styles={{
            control: (base) => ({
              ...base,
              borderRadius: "0.75rem",
              borderColor: "#d1d5db",
              boxShadow: "none",
              backgroundColor: "rgba(255,255,255,0.8)",
              "&:hover": { borderColor: "#10b981" },
            }),
          }}
        />
      </div>

      {/* Oraș / Comună */}
      {formData[`${prefix}County`] && (
        <div>
          <label
            htmlFor={`${prefix}City`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Oraș / Comună <span className="text-emerald-500">*</span>
          </label>
          <Select
            inputId={`${prefix}City`}
            options={cityOptions}
            onChange={(opt) => handleChange(`${prefix}City`, opt?.value || "")}
            value={selectedCity}
            placeholder="Selectează localitatea"
            styles={{
              control: (base) => ({
                ...base,
                borderRadius: "0.75rem",
                borderColor: "#d1d5db",
                boxShadow: "none",
                backgroundColor: "rgba(255,255,255,0.8)",
                "&:hover": { borderColor: "#10b981" },
              }),
            }}
          />
        </div>
      )}

      {/* Altă localitate */}
      {formData[`${prefix}City`] === "other" && (
        <FormInput
          id={`${prefix}OtherCity`}
          label="Introdu manual localitatea / comuna"
          placeholder="Ex: Comuna Valea Mare"
          value={formData[`${prefix}OtherCity`] || ""}
          onChange={(e) => handleChange(`${prefix}OtherCity`, e.target.value)}
        />
      )}
    </div>
  );
}
