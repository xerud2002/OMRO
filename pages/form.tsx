"use client";
import MoveForm from "../components/MoveForm";
import { motion } from "framer-motion";

export default function FormPage() {
  return (
    <>
      

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 py-24 px-4 flex justify-center items-start"
      >
        <div className="w-full max-w-4xl bg-white/80 backdrop-blur-md rounded-3xl shadow-lg border border-emerald-100 p-6 sm:p-10">
          <h1 className="text-3xl font-bold text-center text-emerald-700 mb-10">
            Completează detaliile pentru cererea ta de mutare{" "}
            
          </h1>
          <MoveForm />
        </div>
      </motion.section>

      
    </>
  );
}
