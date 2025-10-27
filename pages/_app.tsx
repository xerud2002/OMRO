import type { AppProps } from "next/app";
import "../styles/globals.css";
import Head from "next/head";
import { useRouter } from "next/router";
import { Toaster } from "react-hot-toast";
import Navbar from "../components/ui/Navbar";
import Footer from "../components/ui/Footer";

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // 🔹 Pagini unde nu vrei Navbar / Footer (ex. login, admin auth)
  const hideLayoutOn = ["/admin/auth", "/company/auth"];
  const hideLayout = hideLayoutOn.some((path) => router.pathname.startsWith(path));

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

      {/* 🌿 Global Navbar + Footer */}
      {!hideLayout && <Navbar />}

      <main className="min-h-screen flex flex-col">
        <Component {...pageProps} />
      </main>

      {!hideLayout && <Footer />}

      {/* 🔔 Notificări globale */}
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
}
