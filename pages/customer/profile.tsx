"use client";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db, onAuthChange, storage } from "../../utils/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ClientLayout from "../../components/ClientLayout";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Loader2, Camera } from "lucide-react";

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

  // 🔹 Load user & profile data
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
          if (!data.userId) {
            await setDoc(doc(db, "users", u.uid), { userId: u.uid }, { merge: true });
          }
        } else {
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

  // 🔹 Upload photo
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

  // 🔹 Save form
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

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: "Profil client - ofertemutare.ro",
    url: "https://ofertemutare.ro/customer/profile",
    description:
      "Pagină privată pentru clienții ofertemutare.ro. Actualizează datele de contact și vizualizează cererile tale de mutare.",
  };

  if (loading)
    return (
      <ClientLayout>
        <Head>
          <meta name="robots" content="noindex, nofollow" />
          <title>Se încarcă profilul... | ofertemutare.ro</title>
        </Head>
        <div className="flex justify-center items-center h-[60vh] text-emerald-600 text-lg">
          <Loader2 className="animate-spin mr-2" /> Se încarcă profilul...
        </div>
      </ClientLayout>
    );

  return (
    <ClientLayout>
      <Head>
        <title>Profil client | ofertemutare.ro</title>
        <meta
          name="description"
          content="Actualizează-ți datele de contact, adresa și poza de profil pentru o comunicare rapidă cu firmele de mutări partenere."
        />
        <meta name="robots" content="noindex, nofollow" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto space-y-10 py-10 px-4 sm:px-0"
      >
        {/* 🌿 Header */}
        <div className="text-center relative">
          <div className="inline-block bg-gradient-to-r from-emerald-500 to-sky-500 text-white py-4 px-10 rounded-2xl shadow-lg">
            <h1 className="text-2xl sm:text-3xl font-bold">
              Profilul tău personal 👤
            </h1>
            <p className="text-emerald-50 text-sm mt-1">
              Actualizează-ți datele pentru o comunicare rapidă cu firmele de mutări.
            </p>
            <div className="h-0.5 w-24 mx-auto mt-3 bg-white/60 rounded-full" />
          </div>
        </div>

        {/* 🌿 Card */}
        <div className="rounded-3xl bg-white/90 backdrop-blur-md p-8 shadow-lg border border-emerald-100 hover:shadow-emerald-200 transition-all duration-300">
          
          {/* 🌈 Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group w-32 h-32">
              {/* Avatar Image with gradient ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-sky-400 p-[3px] shadow-md">
                <div className="w-full h-full rounded-full bg-white p-[2px]">
                  <img
                    src={form.photo || "/default-avatar.png"}
                    alt=" "
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>

              {/* Hover Overlay */}
              <label
                htmlFor="file-upload"
                className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-300"
              >
                <Camera size={22} className="text-white mb-1" />
                <span className="text-xs text-white font-medium">Schimbă poza</span>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>

              {/* Upload Loader Overlay */}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/70">
                  <Loader2 className="animate-spin text-emerald-500" size={28} />
                </div>
              )}
            </div>

            <p className="text-sm text-gray-500 mt-4">
              {uploading
                ? "Se încarcă imaginea..."
                : "Formatele acceptate: JPG, PNG, WebP"}
            </p>
          </div>

          {/* 🌿 Form Fields */}
          <div className="space-y-4">
            <Input label="Nume complet" value={form.name} onChange={(e) => handleChange("name", e.target.value)} />
            <Input label="Telefon" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} />
            <Input label="Email" value={form.email} disabled />
            <Input label="Adresă" value={form.address} onChange={(e) => handleChange("address", e.target.value)} />
            <div className="flex flex-col sm:flex-row gap-3">
              <Input label="Oraș" value={form.city} onChange={(e) => handleChange("city", e.target.value)} />
              <Input label="Județ" value={form.county} onChange={(e) => handleChange("county", e.target.value)} />
            </div>
          </div>

          {/* 💾 Save Button */}
          <div className="mt-8 text-center">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-white px-10 py-3 rounded-full font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all ${
                saving ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Se salvează...
                </>
              ) : (
                <>💾 Salvează modificările</>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </ClientLayout>
  );
}

/* 🧩 Reusable Input Component */
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
      <label className="text-sm text-gray-600 mb-1 font-medium">{label}</label>
      <input
        placeholder={label}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 bg-white shadow-sm transition-all ${
          disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""
        }`}
      />
    </div>
  );
}
