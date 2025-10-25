"use client";
import React from "react";
import { motion } from "framer-motion";
import { Package, Truck, Trash2 } from "lucide-react";

interface StepProps {
  formData: any;
  handleChange: (field: string, value: any) => void;
}

/**
 * Step 1 – Service Type
 * Lets the user choose what type of moving service they want
 */
export default function StepService({ formData, handleChange }: StepProps) {
  const services = [
    {
      id: "Mutare completă",
      title: "Mutare completă",
      desc: "Include ambalare, transport, descărcare și reasamblare.",
      icon: <Truck size={42} strokeWidth={1.5} />,
      gradient: "from-emerald-500 to-sky-500",
    },
    {
      id: "Transport câteva obiecte",
      title: "Transport câteva obiecte",
      desc: "Pentru piese de mobilier, electrocasnice sau articole individuale.",
      icon: <Package size={42} strokeWidth={1.5} />,
      gradient: "from-sky-500 to-emerald-400",
    },
    {
      id: "Aruncare lucruri",
      title: "Aruncare lucruri",
      desc: "Scapă responsabil de mobilierul vechi sau deșeurile nefolositoare.",
      icon: <Trash2 size={42} strokeWidth={1.5} />,
      gradient: "from-rose-500 to-orange-400",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center space-y-8"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-emerald-700 mb-2">
          Ce tip de serviciu dorești?
        </h2>
        <p className="text-gray-600 max-w-md mx-auto text-sm md:text-base">
          Alege tipul de serviciu pentru care dorești o ofertă personalizată.
        </p>
      </div>

      {/* Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {services.map((service) => {
          const isSelected = formData.serviceType === service.id;
          return (
            <motion.button
              key={service.id}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleChange("serviceType", service.id)}
              className={`relative p-6 rounded-3xl border shadow-md transition-all duration-300 text-left overflow-hidden
                ${
                  isSelected
                    ? "bg-gradient-to-br from-emerald-500 to-sky-500 text-white shadow-lg scale-105"
                    : "bg-white hover:bg-gradient-to-br hover:from-emerald-50 hover:to-sky-50 border-emerald-100 text-gray-700"
                }`}
            >
              {/* Animated background ring */}
              {isSelected && (
                <motion.div
                  layoutId="glow"
                  className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-sky-500/20 blur-xl"
                />
              )}

              {/* Icon */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-4 flex items-center justify-center w-14 h-14 rounded-2xl mx-auto
                  ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-gradient-to-br from-emerald-100 to-sky-100 text-emerald-600"
                  }`}
              >
                {service.icon}
              </motion.div>

              {/* Title */}
              <h3
                className={`text-lg font-semibold text-center mb-2 ${
                  isSelected ? "text-white" : "text-emerald-700"
                }`}
              >
                {service.title}
              </h3>

              {/* Description */}
              <p
                className={`text-sm text-center leading-relaxed ${
                  isSelected ? "text-white/90" : "text-gray-600"
                }`}
              >
                {service.desc}
              </p>

              {/* Active ring animation */}
              {isSelected && (
                <motion.div
                  layoutId="ring"
                  className="absolute inset-0 border-2 border-white/70 rounded-3xl shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="text-sm text-gray-500 mt-4">
        Selectează tipul de serviciu pentru care dorești o ofertă personalizată.
      </p>
    </motion.div>
  );
}
