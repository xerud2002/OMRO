"use client";
import React, { useState } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  return (
    <>
      <Head>
        <title>Contact | ofertemutare.ro</title>
        <meta
          name="description"
          content="Contactează echipa ofertemutare.ro pentru colaborări, întrebări sau suport tehnic."
        />
      </Head>

      <Navbar />

      <section className="py-24 bg-gradient-to-br from-emerald-50 to-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-emerald-700 mb-6"
          >
            Contactează-ne
          </motion.h1>

          <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
            Ai întrebări sau vrei să colaborezi cu noi? Completează formularul
            de mai jos și te vom contacta în cel mai scurt timp.
          </p>

          <form
            className="bg-white/80 backdrop-blur-md border border-emerald-100 rounded-3xl shadow-md p-8 text-left max-w-lg mx-auto"
            aria-label="Formular de contact"
          >
            {/* Nume complet */}
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-gray-700 font-medium mb-2"
              >
                Nume complet
              </label>
              <input
                id="name"
                type="text"
                title="Introduceți numele complet"
                placeholder="Ex: Ion Popescu"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-emerald-400"
                required
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                title="Introduceți adresa de email"
                placeholder="exemplu@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-emerald-400"
                required
              />
            </div>

            {/* Mesaj */}
            <div className="mb-6">
              <label
                htmlFor="message"
                className="block text-gray-700 font-medium mb-2"
              >
                Mesaj
              </label>
              <textarea
                id="message"
                title="Scrie mesajul tău"
                placeholder="Scrie aici mesajul tău..."
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-emerald-400"
                required
              />
            </div>

            {/* Submit button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-semibold shadow-lg hover:shadow-emerald-300/40 transition-all"
            >
              Trimite mesajul
            </motion.button>
          </form>
        </div>
      </section>

      <Footer />
    </>
  );
}
