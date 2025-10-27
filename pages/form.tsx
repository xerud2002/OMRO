"use client";
import Head from "next/head";
import MoveForm from "../components/MoveForm";
import { motion } from "framer-motion";

export default function FormPage() {
  // 🔹 Structured Data for Google
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MovingService",
    name: "ofertemutare.ro - Cerere ofertă mutare",
    url: "https://ofertemutare.ro/form",
    description:
      "Completează cererea ta de mutare gratuit și primește rapid oferte de la firme de mutări verificate din România.",
    areaServed: {
      "@type": "Country",
      name: "România",
    },
    serviceType: [
      "Mutări locuințe",
      "Mutări birouri",
      "Transport mobilă",
      "Depozitare temporară",
    ],
    offers: {
      "@type": "Offer",
      priceCurrency: "RON",
      priceSpecification: {
        "@type": "PriceSpecification",
        price: 0,
        priceCurrency: "RON",
      },
      availability: "https://schema.org/InStock",
      eligibleRegion: "RO",
    },
    provider: {
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
          Cere ofertă de mutare gratuită | Firme de mutări verificate România
        </title>
        <meta
          name="description"
          content="Completează cererea ta de mutare și primește gratuit oferte de la firme de mutări verificate din România. Simplu, sigur și fără stres!"
        />
        <meta
          name="keywords"
          content="cerere mutare, ofertă mutare, firme de mutări, transport mobilă, mutări România, cerere mutare gratuită"
        />
        <meta property="og:title" content="Cere ofertă de mutare gratuită" />
        <meta
          property="og:description"
          content="Primește oferte de la firme de mutări verificate din România. Completarea cererii durează mai puțin de 2 minute!"
        />
        <meta property="og:image" content="https://ofertemutare.ro/og-image.jpg" />
        <meta property="og:url" content="https://ofertemutare.ro/form" />
        <link rel="canonical" href="https://ofertemutare.ro/form" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 py-24 px-4 flex justify-center items-start"
      >
        <div className="w-full max-w-4xl bg-white/80 backdrop-blur-md rounded-3xl shadow-lg border border-emerald-100 p-6 sm:p-10">
          <h1 className="text-3xl font-bold text-center text-emerald-700 mb-10">
            Completează detaliile pentru cererea ta de mutare
          </h1>
          <MoveForm />
        </div>
      </motion.section>
    </>
  );
}
