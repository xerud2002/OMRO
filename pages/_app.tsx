import type { AppProps } from "next/app";
import "../styles/globals.css";
import Head from "next/head";
import { Toaster } from "react-hot-toast";

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

      <Component {...pageProps} />

      {/* 🔹 Toaster pentru notificări globale */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: "white",
            color: "#065f46", // emerald-700
            border: "1px solid #d1fae5", // emerald-100
            padding: "10px 14px",
            fontWeight: 500,
            boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
            borderRadius: "10px",
          },
          success: {
            iconTheme: {
              primary: "#059669", // emerald-600
              secondary: "white",
            },
          },
          error: {
            style: {
              background: "#fee2e2",
              color: "#b91c1c",
              border: "1px solid #fecaca",
            },
            iconTheme: {
              primary: "#dc2626",
              secondary: "white",
            },
          },
        }}
      />

    </>
  );
}
