"use client";
import React from "react";
import Head from "next/head";
import Image from "next/image";
import { motion, type Variants } from "framer-motion"; // ✅ import Variants type
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

export default function AboutPage() {
  // ✅ Typed variants
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
    }),
  };

  return (
    <>
      <Head>
        <title>Despre Noi | ofertemutare.ro</title>
        <meta
          name="description"
          content="Află cine suntem, ce ne motivează și cum te ajutăm să găsești cele mai bune firme de mutări din România."
        />
      </Head>

      <Navbar />

      {/* === HERO === */}
      <section className="relative py-28 bg-gradient-to-br from-emerald-50 via-white to-sky-50 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/mesh.svg')] opacity-10 bg-cover" />

        <div className="max-w-7xl mx-auto px-8 md:px-12 lg:px-16 grid md:grid-cols-2 items-center gap-16 relative z-10">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="flex flex-col justify-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-emerald-700 mb-6 leading-tight">
              Despre <span className="text-sky-600">ofertemutare.ro</span>
            </h1>

            <p className="text-gray-700 text-lg leading-relaxed mb-5 max-w-xl">
              Suntem o echipă cu peste{" "}
              <span className="font-semibold text-emerald-600">
                15 ani de experiență
              </span>{" "}
              în domeniul mutărilor internaționale, cu peste{" "}
              <span className="font-semibold">3.000 de proiecte</span> realizate
              și mai mult de{" "}
              <span className="font-semibold">10.000 de evaluări</span>{" "}
              efectuate personal sau prin{" "}
              <span className="text-sky-600 font-medium">survey video</span>.
            </p>

            <p className="text-gray-700 text-lg leading-relaxed max-w-xl">
              Din această experiență s-a născut{" "}
              <span className="font-semibold text-emerald-700">
                ofertemutare.ro
              </span>{" "}
              – o platformă care transformă procesul de mutare într-o experiență{" "}
              <span className="font-semibold text-emerald-600">
                simplă, sigură și fără stres
              </span>
              , conectând clienții doar cu firme verificate și profesioniste.
            </p>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <div className="bg-white/90 rounded-3xl p-4 shadow-xl border border-emerald-100 hover:shadow-emerald-200/60 transition-all duration-300">
              <Image
                src="/pics/team.png"
                alt="Echipa ofertemutare.ro"
                width={580}
                height={400}
                className="rounded-2xl object-cover"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />

      {/* === VALUES === */}
      <section className="py-24 bg-gradient-to-br from-white to-emerald-50 relative">
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-emerald-700 mb-14"
          >
            Ce ne motivează
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[ 
              { title: "Transparență", desc: "Fiecare ofertă este clară, fără costuri ascunse." },
              { title: "Rapiditate", desc: "Primești oferte reale de la firme verificate în doar câteva ore." },
              { title: "Profesionalism", desc: "Colaborăm doar cu companii autorizate și echipe cu experiență." },
              { title: "Suport dedicat", desc: "Te ghidăm la fiecare pas, de la cerere până la finalul mutării." },
            ].map((item, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-md hover:shadow-lg border border-emerald-100 hover:border-emerald-300 transition-all duration-300 hover:-translate-y-1"
              >
                <h3 className="text-xl font-semibold text-emerald-700 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* === CTA === */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-sky-500 text-center text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto px-6"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Vrei să primești oferte personalizate?
          </h2>
          <p className="text-white/90 mb-8 text-lg">
            Completează formularul în doar 2 minute și primești oferte de la
            firme de mutări verificate.
          </p>
          <motion.a
            href="/form"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block bg-white text-emerald-700 font-semibold px-8 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
          >
            Obține oferte acum
          </motion.a>
        </motion.div>
      </section>

      <Footer />
    </>
  );
}
