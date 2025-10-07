"use client";
import React from "react";
import Head from "next/head";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { motion } from "framer-motion";
import Image from "next/image";

export default function ImpachetareArticle() {
  return (
    <>
      <Head>
        <title>Cum să împachetezi eficient | ofertemutare.ro</title>
        <meta
          name="description"
          content="Descoperă cele mai bune sfaturi pentru a împacheta eficient obiectele înainte de mutare. Evită deteriorarea și economisește timp."
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
            Cum să împachetezi eficient pentru o mutare fără griji
          </motion.h1>

          <Image
            src="/pics/packing.png"
            alt="Împachetare mutare"
            width={900}
            height={500}
            className="rounded-2xl shadow-lg mb-8 object-cover"
          />

          <p className="text-gray-700 leading-relaxed mb-4">
            Împachetarea este primul pas important către o mutare organizată și fără stres.
            O planificare atentă te ajută să protejezi obiectele fragile și să economisești timp
            la descărcare și despachetare.
          </p>

          <h2 className="text-xl font-semibold text-emerald-700 mt-8 mb-3">Sfaturi practice:</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>✅ Folosește cutii de dimensiuni potrivite și bandă adezivă de calitate.</li>
            <li>✅ Protejează obiectele fragile cu folie cu bule sau haine moi.</li>
            <li>✅ Etichetează clar fiecare cutie , menționează camera și conținutul.</li>
            <li>✅ Împachetează obiectele grele la bază și cele ușoare deasupra.</li>
            <li>✅ Evită cutiile foarte mari , pot deveni greu de transportat.</li>
          </ul>

          <p className="text-gray-700 mt-6">
            Cu o pregătire atentă, mutarea devine mai rapidă, mai sigură și mai ușoară.
          </p>
        </div>
      </section>

      <Footer />
    </>
  );
}
