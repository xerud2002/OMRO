import Document, { Html, Head, Main, NextScript } from "next/document";

export default class MyDocument extends Document {
  render() {
    const { locale } = this.props.__NEXT_DATA__;

    return (
      <Html lang={locale || "ro"}>
        <Head>
          {/* Meta base setup */}
          <meta charSet="utf-8" />
          <meta name="theme-color" content="#059669" />
          <meta
            name="description"
            content="ofertemutare.ro — platforma care conectează clienți și firme de mutări verificate din România. Simplu, sigur și fără stres."
          />

          {/* Favicons */}
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

          {/* Font & style optimization */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />

          {/* Optional Open Graph (for social sharing) */}
          <meta property="og:title" content="Oferte Mutare | Mutări rapide și sigure" />
          <meta
            property="og:description"
            content="Solicită rapid oferte de la firme de mutări verificate din România. Simplu, sigur și fără stres!"
          />
          <meta property="og:image" content="/og-image.jpg" />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://ofertemutare.ro" />
        </Head>

        <body className="bg-white text-gray-900 antialiased">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
