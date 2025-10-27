"use client";
import React from "react";
import Head from "next/head";
import Navbar from "../../components/ui/Navbar";
import Footer from "../../components//ui/Footer";
import { motion } from "framer-motion";
import Image from "next/image";

export default function PregatireArticle() {
  return (
    <>
      <Head>
        <title>Pregătirea locuinței pentru mutare | ofertemutare.ro</title>
        <meta
          name="description"
          content="Află cum să îți pregătești locuința pentru o mutare eficientă. Ghid complet pentru o zi de mutare fără probleme."
        />
      </Head>

      <Navbar />

      <section className="py-20 bg-gradient-to-br from-white to-emerald-50">
        <div className="max-w-4xl mx-auto px-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-emerald-700 mb-6"
          >
            Pregătirea locuinței pentru o mutare eficientă
          </motion.h1>

          <Image
            src="/pics/loading4.png"
            alt="Pregătire mutare"
            width={900}
            height={500}
            className="rounded-2xl shadow-lg mb-8 object-cover"
          />

          <p className="text-gray-700 leading-relaxed mb-4">
            O mutare reușită începe cu o bună organizare. Pregătirea locuinței
            te ajută să eviți întârzierile, să protejezi obiectele și să
            simplifici munca echipei de mutări.
          </p>

          <h2 className="text-xl font-semibold text-emerald-700 mt-8 mb-3">Ce trebuie să faci:</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>✅ Eliberează coridoarele și ușile de acces.</li>
            <li>✅ Protejează podelele cu folie sau carton.</li>
            <li>✅ Asigură-te că obiectele fragile sunt separate și bine ambalate.</li>
            <li>✅ Deconectează electrocasnicele înainte de mutare.</li>
            <li>✅ Verifică dacă ai loc de parcare disponibil pentru echipă.</li>
          </ul>

          <p className="text-gray-700 mt-6">
            Cu cât spațiul este mai bine pregătit, cu atât procesul de mutare
            se desfășoară mai repede și fără surprize.
          </p>
        </div>
      </section>

      <Footer />
    </>
  );
}
