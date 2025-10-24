"use client";
import React from "react";
import { motion } from "framer-motion";

interface FormDataType {
  survey?: string;
  media?: File[];
}

interface StepProps {
  formData: FormDataType;
  handleChange: (field: string, value: any) => void;
  setFormData: React.Dispatch<React.SetStateAction<FormDataType>>;
}

/**
 * Step 9 – Survey Estimare
 * Permite clientului să aleagă metoda de evaluare (video call, vizită, încărcare media etc.)
 */
export default function StepSurvey({ formData, handleChange, setFormData }: StepProps) {
  const options = [
    { value: "video", label: "Da, prin video call (WhatsApp / Facebook etc.)" },
    { value: "in_person", label: "Da, vizită în persoană" },
    { value: "estimate", label: "Nu, doresc doar o ofertă estimativă" },
    { value: "media", label: "Vreau să atașez poze / video cu ce e de mutat acum" },
    {
      value: "media_later",
      label: "Vreau să atașez poze / video mai târziu (voi primi link separat)",
    },
  ];

  // 🟢 Handle file selection
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setFormData((prev: FormDataType) => ({
      ...prev,
      media: [...(prev.media || []), ...files],
    }));
  };

  // 🎥 Handle direct camera capture
  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setFormData((prev: FormDataType) => ({
      ...prev,
      media: [...(prev.media || []), ...files],
    }));
  };

  // ❌ Remove individual media file
  const removeFile = (index: number) => {
    const newMedia = [...(formData.media || [])];
    newMedia.splice(index, 1);
    setFormData({ ...formData, media: newMedia });
  };

  return (
    <motion.div
      className="text-center space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-emerald-700">
        Pentru o ofertă cât mai exactă, ești dispus să faci un survey?
      </h2>

      <p className="text-sm text-gray-600 max-w-md mx-auto">
        Alege metoda preferată pentru evaluarea mutării. Un video call sau câteva imagini pot ajuta echipa
        să îți ofere o estimare mai precisă și rapidă.
      </p>

      {/* 🔹 Survey Options */}
      <div className="grid gap-3 max-w-md mx-auto">
        {options.map((opt, index) => {
          const selected = formData.survey === opt.value;
          return (
            <motion.label
              key={opt.value}
              htmlFor={`survey-${index}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              className={`p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 shadow-sm ${
                selected
                  ? "border-emerald-500 bg-gradient-to-r from-emerald-50 to-sky-50 text-emerald-700 font-medium shadow-md"
                  : "border-gray-300 hover:border-emerald-300 hover:bg-emerald-50/40 text-gray-700"
              }`}
            >
              <input
                id={`survey-${index}`}
                type="radio"
                name="survey"
                value={opt.value}
                checked={selected}
                onChange={(e) => handleChange("survey", e.target.value)}
                className="hidden"
              />
              {opt.label}
            </motion.label>
          );
        })}
      </div>

      {/* 📸 Upload + Camera Section */}
      {formData.survey === "media" && (
        <motion.div
          className="max-w-md mx-auto mt-6 bg-white/80 backdrop-blur-sm border border-emerald-100 rounded-2xl p-6 shadow-sm text-left"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <label className="block text-sm font-semibold text-emerald-700 mb-3">
            Încarcă poze sau videoclipuri
          </label>

          {/* --- Buttons for upload or camera --- */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Upload from device */}
            <label
              htmlFor="mediaUpload"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl font-medium text-white bg-gradient-to-r from-emerald-500 to-sky-500 shadow-md hover:shadow-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.97]"
            >
              📁 Alege fișiere
            </label>
            <input
              id="mediaUpload"
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleMediaUpload}
              className="hidden"
            />

            {/* Open camera directly */}
            <label
              htmlFor="cameraCapture"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl font-medium text-white bg-gradient-to-r from-sky-500 to-emerald-500 shadow-md hover:shadow-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.97]"
            >
              🎥 Deschide camera
            </label>
            <input
              id="cameraCapture"
              type="file"
              accept="image/*,video/*"
              capture="environment"
              onChange={handleCameraCapture}
              className="hidden"
            />
          </div>

          {/* Info text */}
          <p className="text-xs text-gray-500 mt-2">
            Poți selecta fișiere din galerie sau deschide camera pentru a înregistra acum. 
            Filmează fiecare cameră și arată obiectele de mutat, ambalat sau demontat.
          </p>

          {/* --- File Previews --- */}
          {formData.media && formData.media.length > 0 && (
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {formData.media.map((file: File, index: number) => {
                const isVideo = file.type.startsWith("video/");
                const fileURL = URL.createObjectURL(file);

                return (
                  <div
                    key={index}
                    className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm"
                  >
                    {isVideo ? (
                      <video
                        src={fileURL}
                        muted
                        controls
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <img
                        src={fileURL}
                        alt={file.name}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    )}

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 bg-red-500/80 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition"
                      title="Șterge fișierul"
                    >
                      ×
                    </button>

                    <p className="text-xs text-center text-gray-600 truncate px-1 py-1">
                      {file.name}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* ℹ️ Informații suplimentare */}
      <p className="text-sm text-gray-500 max-w-md mx-auto">
        Poți schimba metoda de evaluare sau încărca poze ulterior din contul tău.
      </p>
    </motion.div>
  );
}
