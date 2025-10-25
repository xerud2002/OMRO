import type { AppProps } from "next/app";
import "../styles/globals.css";
import Head from "next/head";
import { Toaster } from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <title>ofertemutare.ro</title>
        <meta
          name="description"
          content="Solicită rapid oferte de la firme de mutări verificate din România. Simplu, sigur și fără stres!"
        />
      </Head>

      {/* ✅ Navbar always visible */}
      <Navbar />

      {/* ✅ Page content */}
      <main className="pt-[80px] pb-[60px] min-h-[calc(100vh-140px)]">
        <Component {...pageProps} />
      </main>

      {/* ✅ Footer always visible */}
      <Footer />

      {/* ✅ Toasts */}
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
}
