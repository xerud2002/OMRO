"use client";
import React, { useState } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { PhoneCall, Mail, MapPin } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

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

      {/* === CONTACT SECTION === */}
      <section className="relative py-28 bg-gradient-to-br from-emerald-50 via-white to-sky-50 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-start">
          {/* --- Left: Contact Info --- */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            viewport={{ once: true }}
            className="space-y-6 text-center md:text-left"
          >
            <h1 className="text-4xl font-bold text-emerald-700 mb-4">
              Contactează-ne
            </h1>
            <p className="text-gray-700 text-lg mb-6 max-w-md">
              Ai întrebări sau vrei să colaborezi cu noi? Suntem aici să te
              ajutăm cu informații și soluții rapide.
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-center md:justify-start gap-3 text-gray-700">
                <PhoneCall className="text-emerald-500" size={20} />
                <span>+40 700 000 000</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-3 text-gray-700">
                <Mail className="text-emerald-500" size={20} />
                <span>contact@ofertemutare.ro</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-3 text-gray-700">
                <MapPin className="text-emerald-500" size={20} />
                <span>București, România</span>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="mt-10"
            >
              <div className="bg-gradient-to-r from-emerald-500 to-sky-500 text-white px-6 py-4 rounded-2xl shadow-md">
                <p className="font-semibold">Program</p>
                <p className="text-sm text-white/90">
                  Luni - Vineri: 09:00 - 18:00
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* --- Right: Contact Form --- */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            viewport={{ once: true }}
            className="bg-white/80 backdrop-blur-lg border border-emerald-100 rounded-3xl shadow-md p-8"
          >
            <h2 className="text-2xl font-semibold text-emerald-700 mb-6 text-center">
              Trimite-ne un mesaj
            </h2>

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
                placeholder="Ex: Ion Popescu"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 outline-none"
                required
              />
            </div>

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
                placeholder="exemplu@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 outline-none"
                required
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="message"
                className="block text-gray-700 font-medium mb-2"
              >
                Mesaj
              </label>
              <textarea
                id="message"
                rows={5}
                placeholder="Scrie aici mesajul tău..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-emerald-400 outline-none"
                required
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-semibold shadow-md hover:shadow-lg transition-all"
            >
              Trimite mesajul
            </motion.button>

            {submitted && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-emerald-600 text-center font-medium"
              >
                ✅ Mesajul a fost trimis! Vom reveni în curând.
              </motion.p>
            )}
          </motion.form>
        </div>
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />

      <Footer />
    </>
  );
}
