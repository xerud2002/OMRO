"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { handleRoleRedirect } from "../../utils/handleRoleRedirect";
import {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  onAuthChange,
  logout,
  db,
} from "../../utils/firebase";
import { doc, setDoc } from "firebase/firestore";
import { User } from "firebase/auth";
import {
  Building2,
  Mail,
  Lock,
  Phone,
  MapPin,
  Landmark,
  LogOut,
  UserPlus,
  LogIn,
  Factory,
} from "lucide-react";

export default function CompanyAuthPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  // 🔹 Detect auth changes & redirect by role
  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (u) {
        setUser(u);
        await handleRoleRedirect(u, router);
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

  // 🔹 Register / Login handler
  const handleAuth = async () => {
    try {
      if (!email || !password)
        return alert("Completează emailul și parola!");

      if (isRegister && (!companyName || !phone || !city || !county))
        return alert("Completează toate câmpurile firmei!");

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
        await handleRoleRedirect(cred.user, router);
      } else {
        await loginWithEmail(email, password);
        alert("✅ Autentificat cu succes!");
        await handleRoleRedirect({ email } as User, router);
      }
    } catch (err: any) {
      alert("❌ Eroare: " + err.message);
    }
  };

  // 🔹 Logged-in view
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

  // 🔹 Auth form
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

        {/* Register-only fields */}
        {isRegister && (
          <>
            <Input
              icon={<Building2 size={18} />}
              placeholder="Numele firmei"
              value={companyName}
              onChange={setCompanyName}
            />
            <Input
              icon={<Phone size={18} />}
              placeholder="Telefon"
              value={phone}
              onChange={setPhone}
            />
            <Input
              icon={<MapPin size={18} />}
              placeholder="Oraș"
              value={city}
              onChange={setCity}
            />
            <Input
              icon={<Landmark size={18} />}
              placeholder="Județ"
              value={county}
              onChange={setCounty}
            />
          </>
        )}

        {/* Shared fields */}
        <Input
          icon={<Mail size={18} />}
          placeholder="Email"
          value={email}
          onChange={setEmail}
        />
        <Input
          icon={<Lock size={18} />}
          placeholder="Parolă"
          type="password"
          value={password}
          onChange={setPassword}
        />

        {/* Submit button */}
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

        {/* Toggle form type */}
        <p className="text-center text-sm text-gray-600 mb-4">
          {isRegister ? "Ai deja cont?" : "Nu ai cont?"}{" "}
          <span
            onClick={() => setIsRegister(!isRegister)}
            className="text-emerald-600 cursor-pointer hover:underline font-medium"
          >
            {isRegister ? "Login" : "Înregistrează-te"}
          </span>
        </p>

        {/* Google login */}
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
        className="w-full border border-gray-300 p-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/80 transition-all"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
