"use client";
import React from "react";

interface StepProps {
  formData: any;
  handleChange: (field: string, value: any) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

/**
 * Step 9 – Survey Estimare
 * Allows the client to choose a survey method (video call, in-person, upload media, etc.)
 */
export default function StepSurvey({
  formData,
  handleChange,
  setFormData,
}: StepProps) {
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

  // 🔹 Handle media selection
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setFormData({ ...formData, media: files });
  };

  return (
    <div className="text-center space-y-6">
      <h2 className="text-2xl font-bold text-emerald-700">
        Pentru o ofertă cât mai exactă, ești dispus să faci un survey?
      </h2>

      {/* --- Options --- */}
      <div className="space-y-3 max-w-md mx-auto">
        {options.map((opt) => {
          const selected = formData.survey === opt.value;
          return (
            <label
              key={opt.value}
              htmlFor={opt.value}
              className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all duration-200 text-left ${
                selected
                  ? "border-emerald-500 bg-gradient-to-r from-emerald-50 to-sky-50 shadow-sm text-emerald-700 font-medium"
                  : "border-gray-300 hover:border-emerald-300 hover:bg-emerald-50/40 text-gray-700"
              } hover:scale-[1.01]`}
            >
              <input
                id={opt.value}
                type="radio"
                name="survey"
                value={opt.value}
                checked={selected}
                onChange={(e) => handleChange("survey", e.target.value)}
                className="hidden"
              />
              <span>{opt.label}</span>
            </label>
          );
        })}
      </div>

      {/* --- Upload Section --- */}
      {formData.survey === "media" && (
        <div className="max-w-md mx-auto mt-6 bg-white/70 border border-emerald-100 rounded-2xl p-5 shadow-sm text-left">
          <label
            htmlFor="mediaUpload"
            className="block text-sm font-semibold text-emerald-700 mb-2"
          >
            Încarcă poze sau clipuri video
          </label>

          <input
            id="mediaUpload"
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleMediaUpload}
            className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg p-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />

          <p className="text-xs text-gray-500 mt-2">
            Poți selecta mai multe fișiere (imagini sau videoclipuri).
          </p>

          {/* --- File List Preview --- */}
          {formData.media && formData.media.length > 0 && (
            <ul className="mt-3 text-sm text-gray-600 list-disc list-inside space-y-1 max-h-32 overflow-y-auto">
              {formData.media.map((file: File, index: number) => (
                <li key={index} className="truncate">{file.name}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* --- Info Text --- */}
      <p className="text-sm text-gray-500 max-w-md mx-auto">
        Selectează opțiunea potrivită. O vizită virtuală (prin video call) sau
        poze ajută echipa să ofere o estimare mai precisă și rapidă.
      </p>
    </div>
  );
}
