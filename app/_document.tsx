import Document, { Html, Head, Main, NextScript } from "next/document";

export default class MyDocument extends Document {
  render() {
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "ofertemutare.ro",
      alternateName: "Oferte Mutare România",
      url: "https://ofertemutare.ro",
      logo: "https://ofertemutare.ro/logo.png",
      image: "https://ofertemutare.ro/og-image.jpg",
      description:
        "ofertemutare.ro este platforma online care conectează clienți și firme de mutări verificate din România. Solicită rapid oferte gratuite și compară servicii profesionale de mutare.",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Strada Exemplu 10",
        addressLocality: "București",
        addressCountry: "RO",
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+40 700 000 000",
        contactType: "Customer Service",
        areaServed: "RO",
        availableLanguage: ["ro", "en"],
      },
      sameAs: [
        "https://www.facebook.com/ofertemutare",
        "https://www.instagram.com/ofertemutare",
        "https://www.linkedin.com/company/ofertemutare",
      ],
      serviceType: "Mutări locuințe, birouri, transport mobilă, relocări internaționale",
      areaServed: {
        "@type": "Place",
        name: "România",
      },
    };

    return (
      <Html lang="ro">
        <Head>
          <meta charSet="utf-8" />
          <meta name="theme-color" content="#059669" />
          <meta
            name="description"
            content="ofertemutare.ro — platforma care conectează clienți și firme de mutări verificate din România. Simplu, sigur și fără stres."
          />
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

          {/* Fonts for faster load */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />

          {/* ✅ JSON-LD structured data for SEO */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
          />
        </Head>

        <body className="bg-white text-gray-900 antialiased">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
