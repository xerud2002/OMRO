"use client";
import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  loginWithEmail,
  loginWithGoogle,
  onAuthChange,
  logout,
} from "../../utils/firebase";
import { handleRoleRedirect } from "../../utils/handleRoleRedirect";
import { LogOut, LogIn, Mail, Lock, Shield } from "lucide-react";
import type { User } from "firebase/auth";


export default function AdminAuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Listen for auth changes
  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (u) {
        setUser(u);
        await handleRoleRedirect(u, router);
      } else {
        setUser(null);
      }
    });
    return () => unsub();
  }, [router]);

  // 🔹 Handle Email Login
  const handleLogin = async () => {
    if (!email || !password)
      return toast.error("Completează emailul și parola!");
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      toast.success("✅ Autentificat cu succes!");
      router.push("/admin/dashboard");
    } catch (err: any) {
      toast.error("❌ Eroare: " + (err.message || "Verifică datele introduse."));
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Optional Google Login
  const handleGoogle = async () => {
    setLoading(true);
    try {
      const cred = await loginWithGoogle();
      toast.success("✅ Autentificat cu Google!");
      await handleRoleRedirect(cred.user, router);
    } catch (err: any) {
      toast.error("Eroare Google Login: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Structured data (SEO)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Autentificare admin - ofertemutare.ro",
    url: "https://ofertemutare.ro/admin/auth",
    description:
      "Autentificare securizată pentru administratorii platformei ofertemutare.ro.",
  };

  // 🔹 Logged-in view
  if (user) {
    return (
      <>
        <Head>
          <title>Panou admin | ofertemutare.ro</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>

        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] bg-gradient-to-br from-emerald-50 to-sky-50">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-lg w-full max-w-md text-center border border-emerald-100"
          >
            <Shield size={36} className="text-emerald-600 mx-auto mb-3" />
            <p className="text-lg font-semibold mb-4 text-emerald-700">
              Bine ai revenit, <span className="font-medium">{user.email}</span>
            </p>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-white rounded-xl shadow hover:scale-105 transition-all"
            >
              <LogOut size={18} /> Logout
            </button>
          </motion.div>
        </div>
      </>
    );
  }

  // 🔹 Login Form
  return (
    <>
      <Head>
        <title>Autentificare admin | ofertemutare.ro</title>
        <meta
          name="description"
          content="Conectează-te ca administrator pentru a gestiona companii, cereri și plăți pe ofertemutare.ro."
        />
        <meta name="robots" content="noindex, nofollow" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] bg-gradient-to-br from-emerald-50 to-sky-50 p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/85 backdrop-blur-xl p-8 rounded-3xl shadow-xl w-full max-w-md border border-emerald-100"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <Shield size={42} className="text-emerald-600 mx-auto mb-2" />
            <h1 className="text-2xl font-bold text-emerald-700">
              Autentificare admin
            </h1>
            <p className="text-gray-600 text-sm">
              Acces rezervat administratorilor platformei
            </p>
          </div>

          {/* Inputs */}
          <Input
            icon={<Mail size={18} />}
            placeholder="Email admin"
            value={email}
            onChange={setEmail}
            type="email"
          />
          <Input
            icon={<Lock size={18} />}
            placeholder="Parolă"
            value={password}
            onChange={setPassword}
            type="password"
          />

          {/* Submit */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl mb-3 font-medium shadow-md transition-all ${
              loading
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-500 to-sky-500 text-white hover:scale-[1.03]"
            }`}
          >
            {loading ? (
              "Se procesează..."
            ) : (
              <>
                <LogIn size={18} /> Login
              </>
            )}
          </button>

          {/* Optional Google login */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-red-500 text-white py-2.5 rounded-xl shadow-md hover:bg-red-600 transition-all"
          >
            <img src="/icons/google.svg" alt="Google" className="w-5 h-5" />
            <span>Login cu Google</span>
          </button>
        </motion.div>
      </div>
    </>
  );
}

/* 🔸 Reusable input */
function Input({
  icon,
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="relative mb-3">
      <div className="absolute left-3 top-3.5 text-gray-400">{icon}</div>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full border border-gray-300 p-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/90 transition-all"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
