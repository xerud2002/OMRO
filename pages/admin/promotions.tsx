"use client";
import { useEffect, useState } from "react";
import { db, onAuthChange } from "../../utils/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import AdminLayout from "../../components/AdminLayout";
import AdminProtectedRoute from "../../components/AdminProtectedRoute";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Gift, Building2, Loader2, CheckCircle2 } from "lucide-react";

interface Company {
  id: string;
  name?: string;
  email?: string;
  freeLeads?: number;
  totalFreeLeads?: number;
}

export default function AdminPromotionsPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [freeCount, setFreeCount] = useState<number>(5);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🔹 Load all companies
  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (!u) return router.push("/company/auth");

      const userSnap = await getDoc(doc(db, "users", u.uid));
      if (!userSnap.exists() || userSnap.data().role !== "admin") {
        toast.error("⛔ Acces interzis!");
        router.push("/");
        return;
      }

      const snap = await getDocs(collection(db, "companies"));
      const list = snap.docs.map((d) => {
        const data = d.data() as Company;
        // 🟢 prevenim conflictul de 'id'
        const { id: _ignored, ...rest } = data;
        return { id: d.id, ...rest };
      });
      setCompanies(list);
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  const handleGrant = async () => {
    if (!selectedCompany) return toast.error("Selectează o companie!");
    setSaving(true);

    try {
      const companyRef = doc(db, "companies", selectedCompany);
      const companySnap = await getDoc(companyRef);
      const existingData = companySnap.exists() ? companySnap.data() : {};

      const currentFree = existingData.freeLeads || 0;
      const totalFree = existingData.totalFreeLeads || 0;

      await updateDoc(companyRef, {
        freeLeads: currentFree + freeCount,
        totalFreeLeads: totalFree + freeCount,
      });

      toast.success("🎁 Promoție aplicată cu succes!");
      setSelectedCompany("");
      setFreeCount(5);
    } catch (err) {
      console.error(err);
      toast.error("Eroare la aplicarea promoției!");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-[70vh] text-emerald-600 text-lg">
          <Loader2 className="animate-spin mr-2" /> Se încarcă companiile...
        </div>
      </AdminLayout>
    );

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto bg-white/80 border border-emerald-100 rounded-3xl shadow-xl p-8 mt-6 mb-20"
        >
          <h1 className="text-3xl font-bold text-emerald-700 mb-8 flex items-center gap-2">
            <Gift size={26} /> Oferă promoție companiilor
          </h1>

          <div className="space-y-6">
            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Selectează compania:
              </label>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full border rounded-lg p-3"
              >
                <option value="">Alege compania...</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Număr lead-uri gratuite:
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={freeCount}
                onChange={(e) => setFreeCount(parseInt(e.target.value))}
                className="border rounded-lg p-3 w-40"
              />
            </div>

            <button
              onClick={handleGrant}
              disabled={saving}
              className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-sky-500 text-white rounded-xl py-3 font-semibold shadow-md hover:scale-[1.03] transition flex items-center justify-center gap-2"
            >
              {saving ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <CheckCircle2 size={18} />
              )}
              {saving ? "Se aplică..." : "Aplică promoția"}
            </button>
          </div>
        </motion.div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
