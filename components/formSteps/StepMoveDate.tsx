"use client";
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  addMonths,
  subMonths,
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { ro } from "date-fns/locale";
import { Calendar } from "lucide-react";

interface StepProps {
  formData: Record<string, any>;
  handleChange: (field: string, value: any) => void;
}

/**
 * Step 6 – Move Date
 * Selectează o dată fixă sau opțiuni flexibile pentru mutare.
 */
export default function StepMoveDate({ formData, handleChange }: StepProps) {
  const [currentMonth, setCurrentMonth] = useState(
    formData.moveDate ? new Date(formData.moveDate) : new Date()
  );
  const selectedDate = formData.moveDate ? new Date(formData.moveDate) : null;

  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }),
      }),
    [currentMonth]
  );

  const handleSelect = (day: Date) => {
    const localDate = new Date(day.getTime() - day.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
    handleChange("moveDate", localDate);
    handleChange("moveOption", "");
  };

  const isSelected = (day: Date) => selectedDate && isSameDay(day, selectedDate);
  const isToday = (day: Date) => isSameDay(day, new Date());

  return (
    <motion.div
      className="text-center flex flex-col items-center space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Titlu */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-emerald-700 flex items-center justify-center gap-2">
          <Calendar className="text-sky-500" size={26} />
          Când dorești să aibă loc mutarea?
        </h2>
        <p className="text-gray-600 text-sm mt-2 max-w-md mx-auto">
          Selectează o dată potrivită sau alege o opțiune flexibilă dacă data nu
          este încă stabilită.
        </p>
      </div>

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white/80 backdrop-blur-md border border-emerald-100 rounded-3xl shadow-lg p-6 w-full max-w-md relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/20 via-transparent to-sky-50/20 rounded-3xl pointer-events-none" />

        {/* Header lună */}
        <div className="flex justify-between items-center mb-4 select-none relative z-10">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            aria-label="Luna precedentă"
            className="p-2 rounded-full text-emerald-600 hover:bg-emerald-50 transition active:scale-90"
          >
            ‹
          </button>
          <h3 className="text-lg font-semibold text-emerald-700 capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: ro })}
          </h3>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            aria-label="Luna următoare"
            className="p-2 rounded-full text-emerald-600 hover:bg-emerald-50 transition active:scale-90"
          >
            ›
          </button>
        </div>

        {/* Zilele săptămânii */}
        <div className="grid grid-cols-7 text-emerald-600 text-sm font-semibold mb-2 uppercase relative z-10">
          {["LU", "MA", "MI", "JO", "VI", "SÂ", "DU"].map((d, i) => (
            <div
              key={i}
              className={`text-center ${i >= 5 ? "text-red-500" : ""}`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Zilele lunii */}
        <div className="grid grid-cols-7 gap-2 text-gray-700 relative z-10">
          {days.map((day) => {
            const outside = !isSameMonth(day, currentMonth);
            const selected = isSelected(day);
            const today = isToday(day);

            return (
              <motion.button
                key={day.toISOString()}
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleSelect(day)}
                aria-label={`Selectează ${format(day, "d MMMM yyyy", {
                  locale: ro,
                })}`}
                className={`p-2 rounded-full text-sm font-medium transition-all duration-200 text-center select-none
                  ${
                    outside
                      ? "text-gray-300 cursor-default"
                      : selected
                      ? "bg-gradient-to-r from-emerald-500 to-sky-500 text-white shadow-md scale-105"
                      : today && !selectedDate
                      ? "text-emerald-600 font-medium"
                      : "hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer"
                  }`}
              >
                {format(day, "d")}
              </motion.button>
            );
          })}
        </div>

        {/* Data selectată */}
        {formData.moveDate && (
          <p className="mt-5 text-emerald-700 text-sm font-medium">
            📅 Ai selectat:{" "}
            {format(new Date(formData.moveDate), "d MMMM yyyy", { locale: ro })}
          </p>
        )}
      </motion.div>

      {/* Opțiuni flexibile */}
      <div className="w-full max-w-md flex flex-col gap-3">
        {["Sunt flexibil cu data mutării", "Încă nu știu data mutării"].map(
          (opt) => (
            <motion.label
              key={opt}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-2xl border text-left cursor-pointer transition-all duration-300 shadow-sm ${
                formData.moveOption === opt
                  ? "border-emerald-500 bg-gradient-to-r from-emerald-50 to-sky-50 text-emerald-700 font-medium shadow-md"
                  : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-gray-700"
              }`}
            >
              <input
                type="radio"
                name="moveOption"
                value={opt}
                checked={formData.moveOption === opt}
                onChange={(e) => {
                  handleChange("moveOption", e.target.value);
                  handleChange("moveDate", "");
                }}
                className="hidden"
              />
              {opt}
            </motion.label>
          )
        )}
      </div>

      {/* Subtext */}
      <p className="text-sm text-gray-500 max-w-md">
        Dacă data exactă nu este stabilită, poți reveni ulterior pentru
        actualizare.
      </p>
    </motion.div>
  );
}
