"use client";
import React from "react";
import Head from "next/head";
import Navbar from "../../components/ui/Navbar";
import Footer from "../../components//ui/Footer";
import { motion } from "framer-motion";
import Image from "next/image";

export default function SurveyArticle() {
  return (
    <>
      <Head>
        <title>De ce recomandăm un video call sau survey | ofertemutare.ro</title>
        <meta
          name="description"
          content="Află de ce o evaluare prin video call sau survey este esențială pentru o ofertă de mutare corectă și completă."
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
            De ce recomandăm un video call sau survey înainte de mutare
          </motion.h1>

          <Image
            src="/pics/survey.png"
            alt="Survey mutare"
            width={900}
            height={500}
            className="rounded-2xl shadow-lg mb-8 object-cover"
          />

          <p className="text-gray-700 leading-relaxed mb-4">
            Pentru o ofertă realistă și completă, o evaluare vizuală este
            esențială. Un video call sau o vizită în persoană permite firmei
            de mutări să înțeleagă exact volumul, accesul și cerințele
            speciale ale mutării.
          </p>

          <h2 className="text-xl font-semibold text-emerald-700 mt-8 mb-3">Avantajele unui survey:</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>✅ Estimare corectă a volumului și duratei mutării.</li>
            <li>✅ Evitarea costurilor ascunse și neînțelegerilor.</li>
            <li>✅ Posibilitatea de a discuta detaliile direct cu echipa de mutări.</li>
            <li>✅ Identificarea din timp a provocărilor logistice (lift, parcare etc.).</li>
          </ul>

          <p className="text-gray-700 mt-6">
            Alegând un survey înainte de mutare, eviți surprizele neplăcute și
            te asiguri că primești o ofertă adaptată nevoilor tale reale.
          </p>
        </div>
      </section>

      <Footer />
    </>
  );
}
