"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db, auth, onAuthChange, storage } from "../../utils/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ClientLayout from "../../components/ClientLayout";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function CustomerProfile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    county: "",
    photo: "",
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Auth check
  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (!u) {
        router.push("/customer/auth");
        return;
      }
      setUser(u);
      const snap = await getDoc(doc(db, "users", u.uid));
      if (snap.exists()) {
        setForm((prev) => ({ ...prev, ...snap.data() }));
      } else {
        setForm((prev) => ({ ...prev, email: u.email || "" }));
      }
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  const handleChange = (f: string, v: any) =>
    setForm((p) => ({ ...p, [f]: v }));

  // ✅ Upload profile photo
  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const refPath = ref(
        storage,
        `users/${user.uid}/profile-${Date.now()}-${file.name}`
      );
      await uploadBytes(refPath, file);
      const url = await getDownloadURL(refPath);
      setForm((p) => ({ ...p, photo: url }));
      await setDoc(doc(db, "users", user.uid), { photo: url }, { merge: true });
      toast.success("✅ Poză încărcată cu succes!");
    } catch (err) {
      console.error(err);
      toast.error("❌ Eroare la încărcare poză");
    }
    setUploading(false);
  };

  // ✅ Save profile
  const handleSave = async () => {
    if (!user) return;
    await setDoc(
      doc(db, "users", user.uid),
      { ...form, updatedAt: new Date() },
      { merge: true }
    );
    toast.success("✅ Profil actualizat cu succes!");
  };

  if (loading)
    return (
      <ClientLayout>
        <div className="flex justify-center items-center h-[60vh] text-gray-500 text-lg">
          Se încarcă...
        </div>
      </ClientLayout>
    );

  return (
    <ClientLayout>
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto space-y-8"
      >
        {/* Header Card */}
        <div className="rounded-3xl p-8 text-center text-white shadow-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-sky-500">
          <h1 className="text-3xl font-semibold mb-2">
            Profilul tău personal 👤
          </h1>
          <p className="text-emerald-50 text-sm">
            Actualizează-ți datele de contact pentru o comunicare rapidă cu
            firmele de mutări.
          </p>
        </div>

        {/* Profile Form Card */}
        <div className="rounded-3xl bg-white/80 backdrop-blur-md p-8 shadow-lg border border-emerald-100">
          {/* PHOTO */}
          <div className="flex flex-col items-center mb-6">
            {form.photo ? (
              <img
                src={form.photo}
                alt="Foto profil"
                className="w-24 h-24 rounded-full object-cover border-4 border-emerald-100 shadow-md mb-2"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 mb-2">
                📸
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="text-sm"
              title={uploading ? "Se încarcă..." : "Încarcă poză nouă"}
            />
            {uploading && (
              <p className="text-xs text-gray-500 mt-1">
                Se încarcă imaginea...
              </p>
            )}
          </div>

          {/* FORM FIELDS */}
          <div className="space-y-3">
            <Input
              label="Nume complet"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            <Input
              label="Telefon"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
            <Input label="Email" value={form.email} disabled />
            <Input
              label="Adresă"
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
            />
            <div className="flex gap-3">
              <Input
                label="Oraș"
                value={form.city}
                onChange={(e) => handleChange("city", e.target.value)}
              />
              <Input
                label="Județ"
                value={form.county}
                onChange={(e) => handleChange("county", e.target.value)}
              />
            </div>
          </div>

          {/* SAVE BUTTON */}
          <div className="mt-6 text-center">
            <button
              onClick={handleSave}
              className="bg-gradient-to-r from-emerald-500 to-sky-500 text-white px-8 py-3 rounded-xl font-medium shadow-md hover:scale-[1.02] transition-all"
            >
              💾 Salvează modificările
            </button>
          </div>
        </div>
      </motion.div>
    </ClientLayout>
  );
}

// ✅ Reusable Input Component
function Input({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange?: (e: any) => void;
  disabled?: boolean;
}) {
  return (
    <input
      placeholder={label}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all ${
        disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"
      }`}
    />
  );
}
