"use client";
import { useEffect, useState } from "react";
import { db, onAuthChange } from "../../extra/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import AdminLayout from "../../components/AdminLayout";
import AdminProtectedRoute from "../../components/AdminProtectedRoute";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Settings,
  FileDown,
  Bell,
  Mail,
  FileText,
  Save,
  Loader2,
  ShieldCheck,
} from "lucide-react";

interface PlatformSettings {
  platformName: string;
  contactEmail: string;
  contactPhone: string;
  logoUrl: string;
  defaultCommission: number;
  verificationRequired: boolean;
  notifications: {
    newRequest: boolean;
    newReview: boolean;
    newPayment: boolean;
  };
  templates: Record<string, string>;
  policies: Record<string, string>;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState<PlatformSettings>({
    platformName: "oferemutare.ro",
    contactEmail: "",
    contactPhone: "",
    logoUrl: "",
    defaultCommission: 10,
    verificationRequired: true,
    notifications: {
      newRequest: true,
      newReview: true,
      newPayment: true,
    },
    templates: {
      deposit:
        "Mulțumim pentru plata avansului de 30%. Echipa noastră vă va contacta.",
      quoteFollowUp: "Bună ziua, revenim cu oferta pentru mutarea dvs...",
      paymentReminder: "Aceasta este o reamintire pentru plata facturii restante...",
    },
    policies: {
      terms: "Termenii și condițiile vor fi afișați aici.",
      privacy: "Politica de confidențialitate va fi afișată aici.",
      deposit: "Avansul este nerambursabil cu 7 zile înainte de mutare.",
    },
  });

  // 🔹 Load current settings
  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (!u) return router.push("/company/auth");
      const snap = await getDoc(doc(db, "admin", "settings"));
      if (snap.exists()) setSettings(snap.data() as PlatformSettings);
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "admin", "settings"), settings, { merge: true });
      toast.success("✅ Setările au fost salvate!");
    } catch (err) {
      console.error(err);
      toast.error("Eroare la salvare!");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "admin_settings_backup.json";
    a.click();
  };

  if (loading)
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-[70vh] text-emerald-600 text-lg">
          <Loader2 className="animate-spin mr-2" /> Se încarcă setările...
        </div>
      </AdminLayout>
    );

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-6xl mx-auto bg-white/80 backdrop-blur-md border border-emerald-100 rounded-3xl shadow-xl p-8 mt-6 mb-20"
        >
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-3xl font-bold text-emerald-700 flex items-center gap-2">
              <Settings size={28} /> Setări Platformă
            </h1>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 border rounded-xl text-gray-700 text-sm hover:bg-gray-200 transition"
              >
                <FileDown size={16} /> Export JSON
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-white rounded-xl text-sm font-medium shadow-md hover:scale-[1.03] transition"
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                Salvează
              </button>
            </div>
          </div>

          {/* General Info */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-emerald-700 mb-4">
              Informații generale
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nume platformă"
                value={settings.platformName}
                onChange={(e) =>
                  setSettings({ ...settings, platformName: e.target.value })
                }
                className="border rounded-lg p-2"
              />
              <input
                type="text"
                placeholder="Email contact"
                value={settings.contactEmail}
                onChange={(e) =>
                  setSettings({ ...settings, contactEmail: e.target.value })
                }
                className="border rounded-lg p-2"
              />
              <input
                type="text"
                placeholder="Telefon contact"
                value={settings.contactPhone}
                onChange={(e) =>
                  setSettings({ ...settings, contactPhone: e.target.value })
                }
                className="border rounded-lg p-2"
              />
              <input
                type="text"
                placeholder="URL Logo"
                value={settings.logoUrl}
                onChange={(e) =>
                  setSettings({ ...settings, logoUrl: e.target.value })
                }
                className="border rounded-lg p-2"
              />
            </div>

            <div className="mt-4 flex items-center gap-4">
              <input
                type="number"
                placeholder="Comision standard RON"
                value={settings.defaultCommission}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    defaultCommission: parseFloat(e.target.value),
                  })
                }
                className="border rounded-lg p-2 w-48"
              />
              <label className="flex items-center gap-2 text-gray-700">
                <input
                  type="checkbox"
                  checked={settings.verificationRequired}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      verificationRequired: e.target.checked,
                    })
                  }
                />
                <ShieldCheck size={16} /> Companiile trebuie verificate înainte
                de a primi lead-uri
              </label>
            </div>
          </section>

          {/* Email Templates */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-emerald-700 mb-4 flex items-center gap-2">
              <Mail size={20} /> Template-uri Email
            </h2>
            {(Object.entries(settings.templates) as [string, string][]).map(
              ([key, val]) => (
                <div key={key} className="mb-4">
                  <p className="capitalize text-gray-700 font-medium mb-1">
                    {key.replace(/([A-Z])/g, " $1")}
                  </p>
                  <textarea
                    value={val}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        templates: {
                          ...settings.templates,
                          [key]: e.target.value,
                        },
                      })
                    }
                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-emerald-400"
                    rows={3}
                  />
                </div>
              )
            )}
          </section>

          {/* Notifications */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-emerald-700 mb-4 flex items-center gap-2">
              <Bell size={20} /> Notificări
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              {(Object.entries(settings.notifications) as [string, boolean][]).map(
                ([key, val]) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 text-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={val}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            [key]: e.target.checked,
                          },
                        })
                      }
                    />
                    {key === "newRequest"
                      ? "Nouă cerere client"
                      : key === "newReview"
                      ? "Recenzie nouă"
                      : "Plată nouă"}
                  </label>
                )
              )}
            </div>
          </section>

          {/* Policies */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-emerald-700 mb-4 flex items-center gap-2">
              <FileText size={20} /> Termeni & Politici
            </h2>
            {(Object.entries(settings.policies) as [string, string][]).map(
              ([key, val]) => (
                <div key={key} className="mb-4">
                  <p className="capitalize text-gray-700 font-medium mb-1">
                    {key}
                  </p>
                  <textarea
                    value={val}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        policies: {
                          ...settings.policies,
                          [key]: e.target.value,
                        },
                      })
                    }
                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-emerald-400"
                    rows={3}
                  />
                </div>
              )
            )}
          </section>
        </motion.div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
