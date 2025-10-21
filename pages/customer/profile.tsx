"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db, onAuthChange, storage } from "../../utils/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ClientLayout from "../../components/ClientLayout";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

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
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Auth & data load
  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (!u) {
        router.push("/customer/auth");
        return;
      }
      setUser(u);
      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        if (snap.exists()) {
          const data = snap.data();
          setForm((prev) => ({ ...prev, ...data }));
          // Auto-add userId if missing
          if (!data.userId) {
            await setDoc(doc(db, "users", u.uid), { userId: u.uid }, { merge: true });
          }
        } else {
          // Create initial user doc if missing
          await setDoc(doc(db, "users", u.uid), {
            userId: u.uid,
            email: u.email || "",
            role: "customer",
            createdAt: new Date(),
          });
          setForm((prev) => ({ ...prev, email: u.email || "" }));
        }
      } catch (err) {
        console.error("❌ Eroare la încărcarea profilului:", err);
        toast.error("Eroare la încărcarea datelor de profil!");
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [router]);

  const handleChange = (f: string, v: any) => setForm((p) => ({ ...p, [f]: v }));

  // ✅ Upload profile photo
  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const fileRef = ref(storage, `users/${user.uid}/profile-${Date.now()}-${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      setForm((p) => ({ ...p, photo: url }));
      await setDoc(doc(db, "users", user.uid), { photo: url }, { merge: true });
      toast.success("✅ Poză încărcată cu succes!");
    } catch (err) {
      console.error(err);
      toast.error("❌ Eroare la încărcarea pozei");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Save profile
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(
        doc(db, "users", user.uid),
        { ...form, updatedAt: new Date(), userId: user.uid },
        { merge: true }
      );
      toast.success("✅ Profil actualizat cu succes!");
    } catch (err) {
      console.error(err);
      toast.error("❌ Eroare la salvarea profilului");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <ClientLayout>
        <div className="flex justify-center items-center h-[60vh] text-emerald-600 text-lg">
          <Loader2 className="animate-spin mr-2" /> Se încarcă profilul...
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
        {/* Header */}
        <div className="rounded-3xl p-8 text-center text-white shadow-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-sky-500">
          <h1 className="text-3xl font-semibold mb-2">Profilul tău personal 👤</h1>
          <p className="text-emerald-50 text-sm">
            Actualizează-ți datele pentru o comunicare rapidă cu firmele de mutări.
          </p>
        </div>

        {/* Profile Card */}
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
              <img
                src="/default-avatar.png"
                alt="Default avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-emerald-50 shadow-md mb-2 opacity-70"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="text-sm"
              title={uploading ? "Se încarcă..." : "Încarcă poză nouă"}
            />
            {uploading && <p className="text-xs text-gray-500 mt-1">Se încarcă imaginea...</p>}
          </div>

          {/* FORM FIELDS */}
          <div className="space-y-3">
            <Input label="Nume complet" value={form.name} onChange={(e) => handleChange("name", e.target.value)} />
            <Input label="Telefon" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} />
            <Input label="Email" value={form.email} disabled />
            <Input label="Adresă" value={form.address} onChange={(e) => handleChange("address", e.target.value)} />
            <div className="flex gap-3">
              <Input label="Oraș" value={form.city} onChange={(e) => handleChange("city", e.target.value)} />
              <Input label="Județ" value={form.county} onChange={(e) => handleChange("county", e.target.value)} />
            </div>
          </div>

          {/* SAVE BUTTON */}
          <div className="mt-6 text-center">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`bg-gradient-to-r from-emerald-500 to-sky-500 text-white px-8 py-3 rounded-xl font-medium shadow-md hover:scale-[1.02] transition-all ${
                saving ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={18} /> Se salvează...
                </span>
              ) : (
                "💾 Salvează modificările"
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </ClientLayout>
  );
}

/* ✅ Reusable Input Component */
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
    <div className="flex flex-col w-full">
      <label className="text-sm text-gray-600 mb-1">{label}</label>
      <input
        placeholder={label}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all ${
          disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"
        }`}
      />
    </div>
  );
}
