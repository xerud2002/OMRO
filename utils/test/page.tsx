"use client";
import { useState } from "react";
import { testFirestoreRules } from "../../utils/testFirestoreRules";

export default function FirestoreTest() {
  const [result, setResult] = useState("");

  const handleTest = async () => {
    setResult("⏳ Se testează...");
    const r = await testFirestoreRules();
    setResult(r);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800">
      <button
        onClick={handleTest}
        className="px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-semibold shadow-md hover:scale-105 transition"
      >
        Testează permisiunile Firestore 🔍
      </button>

      {result && (
        <pre className="mt-6 bg-white border border-emerald-200 rounded-xl p-4 shadow-sm text-sm whitespace-pre-wrap text-left max-w-md">
          {result}
        </pre>
      )}
    </div>
  );
}
