"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  logout,
  onAuthChange,
  resetPassword,
  db,
} from "../../utils/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { User } from "firebase/auth";
import { motion } from "framer-motion";
import {
  UserPlus,
  LogIn,
  Mail,
  Lock,
  RefreshCw,
  LogOut,
  ArrowRight,
} from "lucide-react";

export default function CustomerAuthPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  // ✅ Detect auth state and redirect by Firestore role
  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (!u) return;
      setUser(u);

      const userRef = doc(db, "users", u.uid);
      const snap = await getDoc(userRef);

      let role = "customer";
      if (snap.exists()) {
        const data = snap.data();
        role = data.role || "customer";
      } else {
        await setDoc(userRef, {
          email: u.email,
          role,
          createdAt: new Date(),
        });
      }

      // Redirect by role
      if (role === "admin") router.push("/admin/companies");
      else if (role === "company") router.push("/company/dashboard");
      else router.push("/customer/dashboard");
    });

    return () => unsub();
  }, [router]);

  // ✅ Email / Password auth
  const handleEmailAuth = async () => {
    try {
      if (isRegister) {
        const cred = await registerWithEmail(email, password);
        const uid = cred.user.uid;

        await setDoc(doc(db, "users", uid), {
          email,
          role: "customer",
          createdAt: new Date(),
        });

        alert("✅ Cont client creat!");
        router.push("/customer/dashboard");
      } else {
        await loginWithEmail(email, password);
        alert("✅ Autentificat cu succes!");
      }
    } catch (err: any) {
      alert("❌ Eroare: " + err.message);
    }
  };

  // ✅ Reset password
  const handleResetPassword = async () => {
    if (!email) return alert("Introduceți adresa de email!");
    try {
      await resetPassword(email);
      alert("📩 Email trimis pentru resetarea parolei.");
    } catch (err: any) {
      alert("❌ Eroare: " + err.message);
    }
  };

  // ✅ Google login
  const handleGoogle = async () => {
    try {
      const cred = await loginWithGoogle();
      const u = cred.user;
      const ref = doc(db, "users", u.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        await setDoc(ref, {
          email: u.email,
          role: "customer",
          createdAt: new Date(),
        });
      }

      const data = (await getDoc(ref)).data();
      if (data?.role === "company") router.push("/company/dashboard");
      else if (data?.role === "admin") router.push("/admin/companies");
      else router.push("/customer/dashboard");
    } catch (err: any) {
      alert("❌ Eroare Google Login: " + err.message);
    }
  };

  // ✅ Logged in view
  if (user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-sky-50">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-lg w-full max-w-md text-center border border-emerald-100"
        >
          <p className="text-lg font-semibold mb-4 text-emerald-700">
            Salut, {user.email}
          </p>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-white rounded-xl shadow hover:scale-[1.03] transition-all"
          >
            <LogOut size={18} /> Logout
          </button>
        </motion.div>
      </div>
    );
  }

  // ✅ Auth form
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-sky-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl w-full max-w-md border border-emerald-100"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-emerald-700 mb-1">
            {isRegister ? "Înregistrare client" : "Autentificare client"}
          </h1>
          <p className="text-gray-600 text-sm">
            {isRegister
              ? "Creează-ți contul pentru a solicita oferte"
              : "Autentifică-te pentru a accesa contul tău"}
          </p>
        </div>

        {/* Email */}
        <div className="relative mb-3">
          <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
          <input
            type="email"
            placeholder="Email"
            className="w-full border border-gray-300 p-3 pl-10 rounded-lg focus:ring-2 focus:ring-emerald-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="relative mb-5">
          <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
          <input
            type="password"
            placeholder="Parolă"
            className="w-full border border-gray-300 p-3 pl-10 rounded-lg focus:ring-2 focus:ring-emerald-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Main action button */}
        <button
          onClick={handleEmailAuth}
          className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-white py-2.5 rounded-xl mb-3 shadow-md hover:scale-[1.03] transition-all"
        >
          {isRegister ? (
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
          className="w-full inline-flex items-center justify-center gap-2 bg-red-500 text-white py-2.5 rounded-xl shadow-md hover:bg-red-600 transition-all"
        >
          <img src="/icons/google.svg" alt="Google" className="w-5 h-5" />
          <span>Login cu Google</span>
        </button>
      </motion.div>
    </div>
  );
}
