// pages/form/success.tsx
"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, ClipboardList } from "lucide-react";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const requestId = searchParams.get("id");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-sky-50 px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white/90 backdrop-blur-md p-10 rounded-3xl shadow-xl border border-emerald-100 max-w-lg"
      >
        <CheckCircle className="text-emerald-500 mx-auto mb-4" size={64} />

        <h1 className="text-2xl md:text-3xl font-bold text-emerald-700 mb-3">
          Cererea ta a fost trimisă cu succes!
        </h1>

        <p className="text-gray-600 mb-6">
          Echipele de mutări verificate vor analiza detaliile și îți vor trimite
          oferte personalizate în scurt timp.
        </p>

        {requestId && (
          <p className="text-sm text-gray-500 mb-6">
            Cod cerere:{" "}
            <span className="font-semibold text-emerald-600">{requestId}</span>
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/customer/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-medium shadow-md hover:scale-105 transition-all"
          >
            <ClipboardList size={18} /> Vezi cererea
          </Link>

          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-all"
          >
            <ArrowRight size={18} /> Înapoi la pagina principală
          </button>
        </div>
      </motion.div>
    </div>
  );
}
