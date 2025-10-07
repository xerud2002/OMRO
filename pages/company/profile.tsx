"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db, storage, auth, onAuthChange } from "../../utils/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import CompanyLayout from "../../components/CompanyLayout";
import { motion } from "framer-motion";
import {
  Building2,
  FileText,
  User,
  MapPin,
  Upload,
  FolderOpen,
  Landmark,
  ShieldCheck,
  Save,
  Send,
  Loader2,
} from "lucide-react";

export default function CompanyProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<any>({
    name: "",
    cui: "",
    address: "",
    phone: "",
    email: "",
    contactName: "",
    contactRole: "",
    contactPhone: "",
    contactEmail: "",
    city: "",
    county: "",
    insurance: false,
    services: [],
    logo: "",
    documents: [],
    verified: false,
  });

  // 🔹 Load or initialize company profile
  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (!u) {
        router.push("/company/auth");
        return;
      }

      try {
        const snap = await getDoc(doc(db, "companies", u.uid));
        if (snap.exists()) {
          setForm((p: any) => ({ ...p, ...snap.data() }));
        } else {
          // create basic record if missing
          await setDoc(doc(db, "companies", u.uid), {
            email: u.email || "",
            verified: false,
            createdAt: new Date(),
          });
          setForm((p: any) => ({ ...p, email: u.email || "" }));
        }
      } catch (err) {
        console.error("Error loading company:", err);
      }

      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  const handleChange = (field: string, value: any) =>
    setForm((prev: any) => ({ ...prev, [field]: value }));

  const toggleService = (service: string) => {
    setForm((prev: any) => {
      const exists = prev.services.includes(service);
      return {
        ...prev,
        services: exists
          ? prev.services.filter((s: string) => s !== service)
          : [...prev.services, service],
      };
    });
  };

  // 🔹 Upload logo or documents
  const handleUpload = async (e: any, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const path = `companies/${auth.currentUser?.uid}/${Date.now()}-${file.name}`;
      const fileRef = ref(storage, path);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);

      if (field === "logo") {
        handleChange("logo", url);
      } else {
        handleChange("documents", [...form.documents, url]);
      }
      alert("✅ Fișier încărcat cu succes!");
    } catch (err) {
      console.error(err);
      alert("❌ Eroare la încărcare fișier!");
    } finally {
      setUploading(false);
    }
  };

  // 🔹 Save profile
  const handleSave = async () => {
    if (!auth.currentUser) return;
    try {
      await setDoc(
        doc(db, "companies", auth.currentUser.uid),
        { ...form, updatedAt: new Date() },
        { merge: true }
      );
      alert("✅ Profil salvat cu succes!");
    } catch (err) {
      console.error(err);
      alert("❌ Eroare la salvare profil.");
    }
  };

  // 🔹 Submit for verification
  const handleSubmitForVerification = async () => {
    if (!auth.currentUser) return;
    try {
      await setDoc(
        doc(db, "companies", auth.currentUser.uid),
        { submittedForVerification: true },
        { merge: true }
      );
      alert("📩 Profil trimis spre verificare!");
    } catch (err) {
      console.error(err);
      alert("❌ Eroare la trimiterea verificării.");
    }
  };

  if (loading)
    return (
      <CompanyLayout>
        <div className="flex justify-center items-center h-[60vh] text-emerald-600">
          <Loader2 className="animate-spin mr-2" /> Se încarcă...
        </div>
      </CompanyLayout>
    );

  return (
    <CompanyLayout>
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto space-y-10"
      >
        {/* HEADER */}
        <div className="bg-gradient-to-r from-emerald-500 to-sky-500 text-white rounded-3xl shadow-lg p-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Profil firmă de mutări</h1>
          <p className="text-emerald-50 max-w-2xl mx-auto">
            Completează toate informațiile pentru verificare și afișare pe platformă.
          </p>
        </div>

        {/* FORM */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-8 border border-emerald-100">
          {/* LOGO */}
          <div className="flex flex-col items-center mb-10">
            {form.logo ? (
              <img
                src={form.logo}
                alt="Logo firmă"
                className="w-28 h-28 rounded-full border-4 border-emerald-100 object-cover shadow-lg mb-3"
              />
            ) : (
              <div className="w-28 h-28 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 mb-3">
                <Building2 size={28} />
              </div>
            )}
            <label className="cursor-pointer text-sm text-emerald-600 hover:underline">
              <Upload size={16} className="inline mr-1" />
              Încarcă logo
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(e) => handleUpload(e, "logo")}
                className="hidden"
              />
            </label>
          </div>

          {/* COMPANY DATA */}
          <Section icon={<FileText />} title="Date firmă">
            <Input label="Nume firmă" field="name" value={form.name} onChange={handleChange} />
            <Input label="CUI / CIF" field="cui" value={form.cui} onChange={handleChange} />
            <Input label="Adresă sediu" field="address" value={form.address} onChange={handleChange} />
            <Input label="Telefon firmă" field="phone" value={form.phone} onChange={handleChange} />
            <Input label="Email firmă" field="email" value={form.email} onChange={handleChange} />
          </Section>

          {/* CONTACT */}
          <Section icon={<User />} title="Persoană de contact">
            <Input label="Nume contact" field="contactName" value={form.contactName} onChange={handleChange} />
            <Input label="Funcție" field="contactRole" value={form.contactRole} onChange={handleChange} />
            <Input label="Telefon contact" field="contactPhone" value={form.contactPhone} onChange={handleChange} />
            <Input label="Email contact" field="contactEmail" value={form.contactEmail} onChange={handleChange} />
          </Section>

          {/* SERVICES */}
          <Section icon={<FolderOpen />} title="Servicii oferite">
            <div className="flex flex-wrap gap-2">
              {[
                "Mutări complete",
                "Transport obiecte",
                "Împachetare",
                "Demontare/Reasamblare",
                "Depozitare",
                "Debarasare",
              ].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleService(s)}
                  className={`px-3 py-1 rounded-full border text-sm transition-all ${
                    form.services.includes(s)
                      ? "bg-gradient-to-r from-emerald-500 to-sky-500 text-white border-emerald-500 shadow"
                      : "border-gray-300 hover:bg-emerald-50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Section>

          {/* LOCATION */}
          <Section icon={<MapPin />} title="Zone acoperite">
            <Input label="Oraș principal" field="city" value={form.city} onChange={handleChange} />
            <Input label="Județ" field="county" value={form.county} onChange={handleChange} />
          </Section>

          {/* DOCUMENTS */}
          <Section icon={<Landmark />} title="Documente și asigurare">
            <label className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-600">
              <Upload size={16} className="text-emerald-600" /> Încarcă documente (PDF / JPG / PNG)
            </label>
            <input
              type="file"
              id="company-docs"
              title="Selectează fișierele pentru încărcare"
              multiple
              disabled={uploading}
              onChange={(e) => handleUpload(e, "documents")}
              className="mb-3 text-sm"
            />
            <label
              htmlFor="company-docs"
              className="sr-only"
            >
              Selectează fișierele pentru încărcare
            </label>

            <ul className="mt-2 text-sm space-y-1">
              {form.documents.map((url: string, i: number) => (
                <li key={i}>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">
                    Document {i + 1}
                  </a>
                </li>
              ))}
            </ul>
            <label className="flex items-center gap-2 mt-4 text-sm">
              <input
                type="checkbox"
                checked={form.insurance}
                onChange={(e) => handleChange("insurance", e.target.checked)}
              />
              <ShieldCheck className="text-emerald-600" size={16} />
              Firma are asigurare activă
            </label>
          </Section>

          {/* STATUS */}
          <p
            className={`mt-8 text-center font-semibold ${
              form.verified ? "text-emerald-600" : "text-yellow-600"
            }`}
          >
            Status: {form.verified ? "✅ Verificată" : "⏳ În așteptare"}
          </p>

          {/* BUTTONS */}
          <div className="mt-6 flex flex-col md:flex-row gap-3 justify-center">
            <button
              onClick={handleSave}
              disabled={uploading}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-white px-6 py-2.5 rounded-xl shadow-md hover:scale-[1.03] transition-all"
            >
              <Save size={18} /> Salvează
            </button>
            {!form.verified && (
              <button
                onClick={handleSubmitForVerification}
                disabled={uploading}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-2.5 rounded-xl shadow-md hover:scale-[1.03] transition-all"
              >
                <Send size={18} /> Trimite spre verificare
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </CompanyLayout>
  );
}

/* ---------- Reusable Subcomponents ---------- */
function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold text-emerald-700 mb-3 flex items-center gap-2">
        {icon} {title}
      </h2>
      {children}
    </section>
  );
}

function Input({ label, field, value, onChange }: any) {
  return (
    <div className="mb-3">
      <input
        placeholder={label}
        value={value || ""}
        onChange={(e) => onChange(field, e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm"
      />
    </div>
  );
}
