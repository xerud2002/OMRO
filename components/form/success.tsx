"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, ClipboardList, ArrowRight } from "lucide-react";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const requestId = searchParams.get("id");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-sky-50 px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative bg-white/80 backdrop-blur-md border border-emerald-100 rounded-3xl shadow-xl p-10 max-w-lg w-full overflow-hidden"
      >
        {/* 🌿 Accent decorativ subtil */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/20 via-transparent to-sky-100/20 rounded-3xl pointer-events-none" />

        {/* ✅ Icon principal */}
        <CheckCircle2
          size={72}
          className="text-emerald-500 mx-auto mb-6 drop-shadow-sm"
        />

        {/* Titlu */}
        <h1 className="text-3xl md:text-4xl font-bold text-emerald-700 mb-3">
          Cererea ta a fost trimisă cu succes!
        </h1>

        {/* Text explicativ */}
        <p className="text-gray-600 mb-6 leading-relaxed text-sm md:text-base">
          Echipele de mutări verificate vor analiza detaliile și îți vor trimite
          oferte personalizate în cel mai scurt timp.
        </p>

        {/* Cod cerere (dacă există) */}
        {requestId && (
          <p className="text-sm text-gray-500 mb-8">
            Cod cerere:{" "}
            <span className="font-semibold text-emerald-600">
              {requestId}
            </span>
          </p>
        )}

        {/* 🔘 Butoane */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
          <Link
            href="/customer/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <ClipboardList size={18} /> Vezi cererea
          </Link>

          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-100 hover:scale-105 transition-all duration-300"
          >
            <ArrowRight size={18} /> Înapoi acasă
          </button>
        </div>
      </motion.div>

      {/* 🌱 Subsol decorativ */}
      <p className="mt-10 text-xs text-gray-400">
        Mulțumim că ai folosit platforma noastră 💚
      </p>
    </div>
  );
}
