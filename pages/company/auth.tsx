"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  onAuthChange,
  logout,
  db,
} from "../../utils/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { User } from "firebase/auth";
import { motion } from "framer-motion";
import {
  Building2,
  Mail,
  Lock,
  Phone,
  MapPin,
  Landmark,
  LogOut,
  UserPlus,
  ArrowRight,
  LogIn,
  Factory,
} from "lucide-react";

export default function CompanyAuthPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  // 🔹 Listen for auth changes & redirect by role
  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (u) {
        const snap = await getDoc(doc(db, "users", u.uid));

        let role = "company";
        if (!snap.exists()) {
          await setDoc(doc(db, "users", u.uid), {
            email: u.email,
            role,
            createdAt: new Date(),
          });
        } else {
          const data = snap.data();
          role = data.role || "company";
        }

        if (role === "admin") router.push("/admin/companies");
        else if (role === "company") router.push("/company/dashboard");
        else router.push("/customer/dashboard");
      }
    });

    return () => unsub();
  }, [router]);

  // 🔹 Local form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [county, setCounty] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const handleAuth = async () => {
    try {
      if (isRegister) {
        const cred = await registerWithEmail(email, password);
        const uid = cred.user.uid;

        await setDoc(doc(db, "companies", uid), {
          name: companyName,
          email,
          phone,
          city,
          county,
          verified: false,
          services: [],
          insurance: false,
          subscription: "free",
          createdAt: new Date(),
        });

        await setDoc(doc(db, "users", uid), {
          email,
          role: "company",
          createdAt: new Date(),
        });

        alert("✅ Cont firmă creat! În așteptarea verificării.");
        router.push("/company/dashboard");
      } else {
        await loginWithEmail(email, password);
        alert("✅ Autentificat cu succes!");
      }
    } catch (err: any) {
      alert("❌ Eroare: " + err.message);
    }
  };

  if (user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-sky-50">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-lg w-full max-w-md text-center border border-emerald-100"
        >
          <p className="text-lg font-semibold mb-4 text-emerald-700">
            Salut, {user.email}
          </p>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-white rounded-xl shadow hover:scale-105 transition-all"
          >
            <LogOut size={18} /> Logout
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-sky-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl w-full max-w-md border border-emerald-100"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <Factory size={40} className="text-emerald-600 mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-emerald-700">
            {isRegister ? "Înregistrare firmă" : "Autentificare firmă"}
          </h1>
          <p className="text-gray-600 text-sm">
            {isRegister
              ? "Creează-ți contul pentru a primi cereri de mutare"
              : "Autentifică-te pentru a accesa cererile clienților"}
          </p>
        </div>

        {/* Register fields */}
        {isRegister && (
          <>
            <div className="relative mb-3">
              <Building2 className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Numele firmei"
                className="w-full border border-gray-300 p-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div className="relative mb-3">
              <Phone className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Telefon"
                className="w-full border border-gray-300 p-3 pl-10 rounded-lg focus:ring-2 focus:ring-emerald-400"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="relative mb-3">
              <MapPin className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Oraș"
                className="w-full border border-gray-300 p-3 pl-10 rounded-lg focus:ring-2 focus:ring-emerald-400"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="relative mb-3">
              <Landmark className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Județ"
                className="w-full border border-gray-300 p-3 pl-10 rounded-lg focus:ring-2 focus:ring-emerald-400"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
              />
            </div>
          </>
        )}

        {/* Shared Fields */}
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

        {/* Submit Button */}
        <button
          onClick={handleAuth}
          className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-white py-2.5 rounded-xl mb-3 shadow-md hover:scale-[1.02] transition-all"
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
          onClick={() => loginWithGoogle("company")}
          className="w-full inline-flex items-center justify-center gap-2 bg-red-500 text-white py-2.5 rounded-xl shadow-md hover:bg-red-600 transition-all"
        >
          <img src="/icons/google.svg" alt="Google" className="w-5 h-5" />
          <span>Login cu Google</span>
        </button>
      </motion.div>
    </div>
  );
}
