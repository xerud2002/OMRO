"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { handleRoleRedirect } from "../../utils/handleRoleRedirect";
import {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  logout,
  onAuthChange,
  resetPassword,
  db,
} from "../../utils/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { User } from "firebase/auth";
import {
  UserPlus,
  LogIn,
  Mail,
  Lock,
  RefreshCw,
  LogOut,
} from "lucide-react";

export default function CustomerAuthPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔹 Detect auth state and redirect by role
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

  // 🔹 Email / Password Auth
  const handleEmailAuth = async () => {
    if (loading) return;
    if (!email || !password) return toast.error("Completează toate câmpurile!");
    setLoading(true);
    try {
      if (isRegister) {
        const cred = await registerWithEmail(email, password);
        const uid = cred.user.uid;

        await setDoc(doc(db, "users", uid), {
          email,
          role: "customer",
          userId: uid, // ✅ Firestore rule requirement
          createdAt: serverTimestamp(),
        });

        toast.success("✅ Cont client creat cu succes!");
        router.push("/form"); // direct spre formular
      } else {
        await loginWithEmail(email, password);
        toast.success("✅ Autentificat cu succes!");
        router.push("/form");
      }
    } catch (err: any) {
      console.error("❌ Eroare autentificare:", err);
      toast.error(err.message || "Eroare la autentificare.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Reset password
  const handleResetPassword = async () => {
    if (!email) return toast.error("Introduceți adresa de email!");
    try {
      await resetPassword(email);
      toast.success("📩 Email trimis pentru resetarea parolei.");
    } catch (err: any) {
      console.error("Eroare resetare parolă:", err);
      toast.error("Eroare: " + err.message);
    }
  };

  // 🔹 Google login
  const handleGoogle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const cred = await loginWithGoogle("customer"); // ✅ set role explicitly
      const u = cred.user;

      // ✅ Ensure user profile exists and has userId field
      await setDoc(
        doc(db, "users", u.uid),
        {
          email: u.email,
          name: u.displayName || "",
          role: "customer",
          userId: u.uid,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      toast.success("✅ Autentificat cu Google!");
      await handleRoleRedirect(u, router);
    } catch (err: any) {
      console.error("Eroare Google Login:", err);
      toast.error("Eroare Google Login: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Structured Data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: isRegister
      ? "Înregistrare client - ofertemutare.ro"
      : "Autentificare client - ofertemutare.ro",
    url: "https://ofertemutare.ro/customer/auth",
    description:
      "Pagina dedicată clienților ofertemutare.ro pentru autentificare și creare cont.",
  };

  // 🔹 Logged-in view
  if (user) {
    return (
      <>
        <Head>
          <title>Contul tău | ofertemutare.ro</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>

        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] bg-gradient-to-br from-emerald-50 to-sky-50">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-lg w-full max-w-md text-center border border-emerald-100"
          >
            <p className="text-lg font-semibold mb-4 text-emerald-700">
              Salut, <span className="font-medium">{user.email}</span>
            </p>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-white rounded-xl shadow hover:scale-[1.03] transition-all"
            >
              <LogOut size={18} /> Logout
            </button>
          </motion.div>
        </div>
      </>
    );
  }

  // 🔹 Auth form
  return (
    <>
      <Head>
        <title>
          {isRegister
            ? "Înregistrare client | ofertemutare.ro"
            : "Autentificare client | ofertemutare.ro"}
        </title>
        <meta
          name="description"
          content="Autentifică-te sau creează un cont nou pentru a primi oferte de mutare de la companii verificate din România."
        />
        <meta name="robots" content="noindex, nofollow" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] bg-gradient-to-br from-emerald-50 to-sky-50 p-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/85 backdrop-blur-xl p-8 rounded-3xl shadow-xl w-full max-w-md border border-emerald-100"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-emerald-700 mb-1">
              {isRegister ? "Înregistrare client" : "Autentificare client"}
            </h1>
            <p className="text-gray-600 text-sm">
              {isRegister
                ? "Creează-ți contul pentru a solicita oferte"
                : "Autentifică-te pentru a continua cererea"}
            </p>
          </div>

          {/* Inputs */}
          <Input
            icon={<Mail size={18} />}
            placeholder="Email"
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

          {/* Submit Button */}
          <button
            onClick={handleEmailAuth}
            disabled={loading}
            className={`w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl mb-3 font-medium shadow-md transition-all ${
              loading
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-500 to-sky-500 text-white hover:scale-[1.03]"
            }`}
          >
            {loading ? (
              "Se procesează..."
            ) : isRegister ? (
              <>
                <UserPlus size={18} /> Creează cont
              </>
            ) : (
              <>
                <LogIn size={18} /> Login
              </>
            )}
          </button>

          {/* Forgot password */}
          {!isRegister && (
            <p
              onClick={handleResetPassword}
              className="text-sm text-emerald-600 text-center mb-4 cursor-pointer hover:underline"
            >
              <RefreshCw size={14} className="inline mr-1" />
              Am uitat parola
            </p>
          )}

          {/* Switch form type */}
          <p className="text-center text-sm text-gray-600 mb-4">
            {isRegister ? "Ai deja cont?" : "Nu ai cont?"}{" "}
            <span
              onClick={() => setIsRegister(!isRegister)}
              className="text-emerald-600 cursor-pointer hover:underline font-medium"
            >
              {isRegister ? "Login" : "Înregistrează-te"}
            </span>
          </p>

          {/* Google Login */}
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

/* 🔸 Small reusable input component */
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
