"use client";
import Head from "next/head";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import MoveForm from "../../components/MoveForm";

export default function FormPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MovingService",
    name: "ofertemutare.ro",
    url: "https://ofertemutare.ro/form",
    description:
      "Cere o ofertă de mutare gratuită și primește prețuri de la firme de mutări verificate din România. Servicii de mutare locuințe, birouri și transport mobilă.",
    areaServed: {
      "@type": "Country",
      name: "România",
    },
    serviceType: "Mutări rezidențiale și comerciale",
    provider: {
      "@type": "Organization",
      name: "ofertemutare.ro",
      url: "https://ofertemutare.ro",
      logo: "https://ofertemutare.ro/logo.png",
    },
  };

  return (
    <>
      <Head>
        <title>Cere ofertă de mutare | ofertemutare.ro</title>
        <meta
          name="description"
          content="Completează formularul pentru a primi oferte gratuite de la firme de mutări verificate din România. Rapid, sigur și fără stres."
        />
        <meta
          name="keywords"
          content="ofertă mutare, firme de mutări, transport mobilă, mutări România, cere ofertă mutare, platformă mutări"
        />
        <meta property="og:title" content="Cere ofertă de mutare - ofertemutare.ro" />
        <meta
          property="og:description"
          content="Primește oferte reale de la firme de mutări verificate din România."
        />
        <meta property="og:url" content="https://ofertemutare.ro/form" />
        <meta property="og:image" content="https://ofertemutare.ro/og-image.jpg" />
        <link rel="canonical" href="https://ofertemutare.ro/form" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-sky-50 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-700 text-center mb-10">
            Cere ofertă de mutare
          </h1>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Completează formularul de mai jos și primești oferte personalizate de la firme
            verificate de mutări din România — fără costuri și fără obligații.
          </p>

          <div className="bg-white rounded-3xl shadow-lg border border-emerald-100 p-6 md:p-10">
            <MoveForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
