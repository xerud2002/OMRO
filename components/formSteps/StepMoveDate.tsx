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

  // 🗓️ Generează zilele lunii curente (memoizate)
  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }),
      }),
    [currentMonth]
  );

  // ✅ Clic pe o zi (stochează doar YYYY-MM-DD, corectat pentru timezone)
  const handleSelect = (day: Date) => {
    const localDate = new Date(day.getTime() - day.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
    handleChange("moveDate", localDate);
    handleChange("moveOption", "");
  };

  const isSelected = (day: Date) => selectedDate && isSameDay(day, selectedDate);
  const isToday = (day: Date) => isSameDay(day, new Date());

  // === UI ===
  return (
    <motion.div
      className="text-center flex flex-col items-center space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-emerald-700">
        Când dorești să aibă loc mutarea?
      </h2>

      {/* === Calendar === */}
      <motion.div
        className="bg-white/80 backdrop-blur-md border border-emerald-100 rounded-3xl shadow-lg p-6 w-full max-w-md"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* --- Header --- */}
        <div className="flex justify-between items-center mb-4 select-none">
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

        {/* --- Weekday Header --- */}
        <div className="grid grid-cols-7 text-emerald-600 text-sm font-semibold mb-2 uppercase">
          {["LU", "MA", "MI", "JO", "VI", "SÂ", "DU"].map((d, i) => (
            <div
              key={i}
              className={`text-center ${i >= 5 ? "text-red-500" : ""}`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* --- Days Grid --- */}
        <div className="grid grid-cols-7 gap-2 text-gray-700">
          {days.map((day) => {
            const outside = !isSameMonth(day, currentMonth);
            const selected = isSelected(day);
            const today = isToday(day);

            return (
              <motion.button
                key={day.toISOString()}
                whileHover={{ scale: 1.08 }}
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
                      ? "text-emerald-600 font-medium" // doar text verde subtil, fără border
                      : "hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer"
                  }`}
              >
                {format(day, "d")}
              </motion.button>
            );
          })}
        </div>

        {formData.moveDate && (
          <p className="mt-4 text-emerald-700 text-sm font-medium">
            📅 Ai selectat:{" "}
            {format(new Date(formData.moveDate), "d MMMM yyyy", { locale: ro })}
          </p>
        )}

        
      </motion.div>

      {/* === Flexible Date Options === */}
      <div className="w-full max-w-md flex flex-col gap-3">
        {["Sunt flexibil cu data mutării", "Încă nu știu data mutării"].map(
          (opt) => (
            <label
              key={opt}
              className={`p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                formData.moveOption === opt
                  ? "border-emerald-500 bg-gradient-to-r from-emerald-50 to-sky-50 shadow-md text-emerald-700 font-medium"
                  : "border-gray-300 hover:border-emerald-300 hover:bg-emerald-50/40 text-gray-700"
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
            </label>
          )
        )}
      </div>

      <p className="text-sm text-gray-500 max-w-md">
        Dacă data exactă nu este stabilită, poți reveni ulterior pentru
        actualizare.
      </p>
    </motion.div>
  );
}
