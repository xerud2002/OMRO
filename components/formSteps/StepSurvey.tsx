"use client";
import React from "react";

interface StepProps {
  formData: any;
  handleChange: (field: string, value: any) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export default function StepSurvey({ formData, handleChange, setFormData }: StepProps) {
  const options = [
    { value: "video", label: "Da, prin video call (WhatsApp / Facebook ...)" },
    { value: "in_person", label: "Da, vizită în persoană" },
    { value: "estimate", label: "Nu, doresc doar o ofertă estimativă" },
    { value: "media", label: "Vreau să atașez poze/video cu ce e de mutat acum" },
    { value: "media_later", label: "Vreau să atașez poze/video cu ce e de mutat mai târziu" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-emerald-700 text-center mb-6">
        Pentru o ofertă cât mai exactă, ești dispus să faci un survey?
      </h2>

      <div className="space-y-3">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
              formData.survey === opt.value
                ? "border-emerald-500 bg-emerald-50 shadow-sm"
                : "border-gray-300 hover:border-emerald-300 hover:bg-emerald-50/30"
            }`}
          >
            <input
              type="radio"
              name="survey"
              value={opt.value}
              checked={formData.survey === opt.value}
              onChange={(e) => setFormData({ ...formData, survey: e.target.value })}
              className="mr-3 accent-emerald-600 h-5 w-5"
            />
            <span className="text-gray-800">{opt.label}</span>
          </label>
        ))}

        {/* MEDIA UPLOAD SECTION */}
        {formData.survey === "media" && (
          <div className="mt-6 bg-white/60 border border-emerald-100 rounded-2xl p-4 shadow-sm">
            <label className="block text-sm font-semibold text-emerald-700 mb-2">
              Încarcă poze sau clipuri video
            </label>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              title="Selectează fișiere"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  media: e.target.files ? Array.from(e.target.files) : [],
                })
              }
              className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg p-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
            <p className="text-xs text-gray-500 mt-2">
              Poți selecta mai multe fișiere (imagini sau videoclipuri).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
