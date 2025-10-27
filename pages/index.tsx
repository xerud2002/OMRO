"use client";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Truck, FormInput, Users, CheckCircle, ArrowRight } from "lucide-react";
import { onAuthChange, logout } from "../services/firebase";
import { User } from "firebase/auth";
import FadeInWhenVisible from "@/components/FadeInWhenVisible";
import { motion } from "framer-motion";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthChange(setUser);
    return () => unsub();
  }, []);

  const handleGetOffers = () => {
    if (user) router.push("/form");
    else {
      localStorage.setItem("redirectAfterLogin", "form");
      router.push("customer/auth");
    }
  };

  // 🔹 JSON-LD structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ofertemutare.ro",
    url: "https://ofertemutare.ro",
    description:
      "Compara oferte de la firme de mutări verificate din România. Platforma ofertemutare.ro conectează clienții cu companii de mutări sigure și profesionale.",
    inLanguage: "ro",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://ofertemutare.ro/form?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "ofertemutare.ro",
      url: "https://ofertemutare.ro",
      logo: "https://ofertemutare.ro/logo.png",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+40 700 000 000",
        contactType: "customer service",
        areaServed: "RO",
        availableLanguage: ["ro", "en"],
      },
    },
  };

  return (
    <>
      <Head>
        <title>
          Oferte mutare România | Firme de mutări verificate | ofertemutare.ro
        </title>
        <meta
          name="description"
          content="Compara oferte reale de la firme de mutări verificate din România. Platforma ofertemutare.ro te ajută să găsești rapid cea mai bună ofertă pentru mutarea ta."
        />
        <meta
          name="keywords"
          content="firme de mutări, oferte mutare, mutări România, transport mobilă, servicii mutare, platformă mutări"
        />
        <meta property="og:title" content="ofertemutare.ro - Firme de mutări verificate" />
        <meta
          property="og:description"
          content="Cere oferte de la companii de mutări verificate din România. Rapid, sigur și fără stres."
        />
        <meta property="og:image" content="https://ofertemutare.ro/og-image.jpg" />
        <meta property="og:url" content="https://ofertemutare.ro" />
        <link rel="canonical" href="https://ofertemutare.ro" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      
      <div className="h-[80px]" />

      {/* === HERO === */}
      <section className="relative h-screen w-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/hero.webp"
            alt="Firme de mutări România"
            fill
            priority
            className="object-cover object-center w-full h-full"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight drop-shadow-lg mb-6">
            Găsește firma de mutări potrivită pentru tine
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8">
            Compară oferte de la companii verificate și alege varianta ideală pentru mutarea ta.
          </p>
          <button
            onClick={handleGetOffers}
            className="bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:scale-105 transition-transform"
          >
            Obține oferte acum
          </button>
        </div>
      </section>
      {/* STEPS SECTION */}
      <section className="py-16 bg-gradient-to-br from-white to-emerald-50">
        <FadeInWhenVisible>
          <div className="max-w-5xl mx-auto text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-extrabold text-emerald-700"
            >
              Cum funcționează platforma <span className="text-sky-500">Ofertemutare.ro</span>?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-600 mt-3 text-lg max-w-3xl mx-auto"
            >
              Cu doar câteva click-uri, primești oferte verificate de la firme de mutări din zona ta.  
              Totul 100% online, fără apeluri inutile și fără stres.
            </motion.p>
          </div>
        </FadeInWhenVisible>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 px-6">
          {[
            {
              number: "1",
              icon: <FormInput className="text-emerald-600" size={38} />,
              title: "Completează cererea ta de mutare",
              desc: "Spune-ne ce trebuie mutat, de unde și unde. Formularul este rapid, intuitiv și complet gratuit.",
            },
            {
              number: "2",
              icon: <Users className="text-emerald-600" size={38} />,
              title: "Primești oferte verificate în 24 de ore",
              desc: "Firmele partenere îți trimit oferte personalizate în funcție de detaliile tale. Poți compara prețuri și condiții fără nicio obligație.",
            },
            {
              number: "3",
              icon: <CheckCircle className="text-emerald-600" size={38} />,
              title: "Alegi cea mai bună variantă pentru tine",
              desc: "Analizezi recenziile, compari prețurile și alegi firma care îți oferă cea mai bună combinație de preț, timp și siguranță.",
            },
          ].map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2, duration: 0.6 }}
              whileHover={{ scale: 1.04, y: -6 }}
              className="relative bg-white/85 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-emerald-100 hover:shadow-emerald-200/70 transition-all duration-300 group"
            >
              {/* Număr animat */}
              <motion.div
                className="absolute -top-5 left-5 bg-gradient-to-r from-emerald-500 to-sky-500 text-white w-10 h-10 flex items-center justify-center rounded-full font-bold text-lg shadow-md"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
              >
                {step.number}
              </motion.div>

              {/* Iconă */}
              <div className="flex justify-center mb-5 mt-4 text-emerald-600">
                <motion.div
                  whileHover={{ rotate: 10 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  {step.icon}
                </motion.div>
              </div>

              {/* Text */}
              <h3 className="text-xl font-semibold text-emerald-700 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>

              {/* Linie de accent animată */}
              <motion.div
                className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-emerald-400 to-sky-400 rounded-b-3xl group-hover:w-full transition-all duration-500"
              />
            </motion.div>
          ))}
        </div>

        {/* CTA de final */}
        <div className="text-center mt-16">
          <Link
            href="/form"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-semibold px-8 py-3 rounded-full shadow-md hover:scale-105 hover:shadow-lg transition-all"
          >
            Începe acum <ArrowRight size={20} />
          </Link>
          <p className="text-gray-500 mt-3 text-sm">
            Fără costuri ascunse, fără stres ; doar oferte reale de la companii verificate.
          </p>
        </div>
      </section>
      {/* 🌟 CLIENT ACCOUNT SECTION - versiune îmbunătățită */}
      <section className="py-16 bg-gradient-to-r from-emerald-50 to-sky-50 overflow-hidden">
        <FadeInWhenVisible>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-6xl mx-auto rounded-3xl bg-white/85 backdrop-blur-md p-10 flex flex-col md:flex-row items-center justify-between gap-10 shadow-xl border border-emerald-100 relative overflow-hidden"
          >
            {/* Fundal decorativ subtil */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/40 via-transparent to-sky-100/40 rounded-3xl"></div>

            {/* Text */}
            <div className="flex-1 max-w-md relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-emerald-700 mb-4">
                Contul tău de client
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Economisește timp și urmărește toate cererile tale într-un singur loc.  
                Fii mereu la curent cu ofertele primite de la firmele de mutări verificate.
              </p>

              {!user ? (
                <>
                  <Link
                    href="/customer/auth"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-white px-8 py-3 rounded-full font-medium shadow-lg hover:scale-105 hover:shadow-emerald-200/60 transition-all"
                  >
                    <ArrowRight size={18} /> Autentificare / Înregistrare
                  </Link>
                  <p className="text-sm text-gray-500 mt-3">
                    Creează un cont gratuit și începe să primești oferte în mai puțin de 2 minute.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-gray-700 mb-4">
                    Bun venit,{" "}
                    <span className="font-semibold text-emerald-600">
                      {user.displayName || user.email}
                    </span>
                    ! Ai acces complet la cererile și ofertele tale.
                  </p>
                  <div className="flex gap-4">
                    <Link
                      href="/customer/dashboard"
                      className="px-6 py-2 bg-emerald-600 text-white rounded-lg shadow hover:bg-emerald-700 transition-all hover:scale-105"
                    >
                      Panou Client
                    </Link>
                    <button
                      onClick={logout}
                      className="px-6 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition-all hover:scale-105"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Ilustrații animate */}
            <motion.div
              className="flex-1 flex gap-4 justify-center relative z-10"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                whileHover={{ rotate: -2, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <Image
                  src="/pics/oferta.png"
                  alt="Ofertă"
                  width={250}
                  height={250}
                  className="rounded-2xl shadow-lg object-cover hidden md:block"
                />
              </motion.div>
              {/* <motion.div
                whileHover={{ rotate: 2, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <Image
                  src="/pics/mutare.png"
                  alt="Mutare"
                  width={210}
                  height={220}
                  className="rounded-2xl shadow-lg object-cover hidden md:block"
                />
              </motion.div> */}
            </motion.div>
          </motion.div>
        </FadeInWhenVisible>
      </section>
      {/* 🌟 SERVICII OFERITE */}
      <section className="py-16 bg-gradient-to-br from-white via-emerald-50/50 to-sky-50/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.08),transparent_70%)]"></div>

        <FadeInWhenVisible>
          <div className="max-w-6xl mx-auto text-center mb-16 px-6 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-emerald-700 mb-4">
              Servicii oferite de companiile partenere
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Fie că te muți în același oraș sau în alt colț al țării, partenerii noștri
              oferă servicii complete de mutare ; flexibile, rapide și sigure.
            </p>
          </div>
        </FadeInWhenVisible>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto px-6 relative z-10">
          {[
            {
              img: "/pics/packing1.png",
              title: "Împachetare profesională",
              desc: "Obiectele fragile, electronicele și mobilierul sunt împachetate cu materiale de protecție de calitate, pentru transport sigur.",
            },
            {
              img: "/pics/dism.png",
              title: "Demontare & reasamblare mobilier",
              desc: "Echipele noastre se ocupă de dezasamblarea și reasamblarea mobilierului mare, rapid și fără daune.",
            },
            {
              img: "/pics/loading4.png",
              title: "Transport sigur și rapid",
              desc: "De la garsoniere până la case întregi ; partenerii noștri asigură transportul cu autoutilitare curate și echipate corespunzător.",
            },
            {
              img: "/pics/storage.png",
              title: "Depozitare temporară",
              desc: "Ai nevoie de timp între locații? Obiectele tale pot fi depozitate în spații sigure, ventilate și monitorizate 24/7.",
            },
            {
              img: "/pics/disposal.png",
              title: "Debarasare responsabilă",
              desc: "Scapă ușor de mobilierul vechi sau obiectele inutile ; partenerii noștri le colectează și le elimină în mod ecologic.",
            },
          ].map((s, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease: "easeOut" }}
              whileHover={{
                scale: 1.05,
                y: -5,
                boxShadow: "0 10px 30px rgba(16,185,129,0.2)",
              }}
              className="group bg-white/85 backdrop-blur-sm p-6 rounded-3xl shadow-md border border-emerald-100 hover:shadow-emerald-200/80 flex flex-col justify-between h-full min-h-[340px] transition-all duration-300"
            >
              <motion.div
                className="overflow-hidden rounded-2xl mb-4"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <motion.img
                  src={s.img}
                  alt={s.title}
                  className="rounded-2xl object-cover w-full h-40"
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.4 }}
                />
              </motion.div>

              <div className="text-center px-2">
                <motion.h3
                  className="text-lg font-semibold text-emerald-700 mb-2"
                  whileHover={{ scale: 1.04 }}
                  transition={{ duration: 0.2 }}
                >
                  {s.title}
                </motion.h3>
                <p className="text-gray-600 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      {/* 🤝 PARTENER SECTION */}
      <section className="py-16 bg-gradient-to-br from-emerald-50 via-white to-sky-50 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(16,185,129,0.08),transparent_70%)]"></div>

        <FadeInWhenVisible>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center rounded-3xl shadow-xl bg-white/85 backdrop-blur-md p-10 border border-emerald-100 relative z-10 overflow-hidden"
          >
            {/* Imagine animată ușor */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Image
                src="/pics/partner.png"
                alt="Partener ofertemutare.ro"
                width={600}
                height={400}
                className="rounded-2xl object-cover shadow-md hover:shadow-emerald-100 transition-all duration-300"
              />
            </motion.div>

            {/* Text + buton animat */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-emerald-700 mb-4 leading-tight">
                Devino partener <br />
                
              </h2>

              <p className="text-gray-700 mb-6 leading-relaxed max-w-md">
                Ai o firmă de mutări și vrei mai multe clienți fără costuri de publicitate?
                Prin platforma <strong>ofertemutare.ro</strong> primești cereri reale de la clienți
                interesați, din orașul tău și din toată țara.
              </p>

              <ul className="text-gray-700 mb-8 space-y-2 text-sm md:text-base">
                <li>✅ Primești cereri de mutare verificate</li>
                <li>✅ Comunici direct cu clientul, fără comisioane ascunse</li>
                <li>✅ Acces rapid la panou dedicat companiilor</li>
              </ul>

              <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 250 }}
              >
                <Link
                  href="/company/auth"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-emerald-300/50 transition-all font-semibold"
                >
                  Înregistrează-ți firma <ArrowRight size={20} />
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </FadeInWhenVisible>
      </section>
      {/* ARTICLES SECTION */}
      <section className="py-16 bg-gradient-to-b from-white to-emerald-50">
        <FadeInWhenVisible>
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-emerald-700 mb-14">
              Sfaturi utile pentru o mutare reușită
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  icon: "",
                  title: "Top 5 trucuri pentru împachetarea eficientă a obiectelor fragile",
                  desc: "Află cum să eviți deteriorarea obiectelor tale preferate prin tehnici de împachetare folosite de profesioniști.",
                  link: "/articles/impachetare",
                },
                {
                  icon: "",
                  title: "Cum îți pregătești locuința pentru ziua mutării fără stres",
                  desc: "De la etichetarea cutiilor până la protejarea podelelor – iată cum să ai o zi de mutare organizată și calmă.",
                  link: "/articles/pregatire",
                },
                {
                  icon: "",
                  title: "De ce o vizită virtuală (survey) te ajută să primești o ofertă corectă",
                  desc: "Un video call rapid îți oferă o evaluare precisă și te ajută să economisești timp și bani.",
                  link: "/articles/survey",
                },
              ].map((a, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.04, y: -4 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="bg-gradient-to-br from-white/90 to-emerald-50/60 backdrop-blur-md border border-emerald-100 shadow-md hover:shadow-emerald-200/60 p-8 rounded-3xl flex flex-col justify-between h-full transition-all duration-300"
                >
                  <div>
                    <div className="text-3xl mb-3">{a.icon}</div>
                    <h3 className="text-lg font-semibold text-emerald-700 mb-2 leading-snug">
                      {a.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{a.desc}</p>
                  </div>

                  <Link
                    href={a.link}
                    className="mt-5 inline-flex items-center gap-1 text-emerald-600 font-medium hover:underline hover:gap-2 transition-all"
                  >
                    Citește mai mult <ArrowRight size={14} />
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/articles"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-white px-6 py-3 rounded-full shadow-md hover:scale-105 transition-all"
              >
                Vezi toate articolele <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </FadeInWhenVisible>
      </section>
    </>
  );
}
