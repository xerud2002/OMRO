"use client";
import { useEffect, useState } from "react";
import { db, onAuthChange } from "../../utils/firebase";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import AdminLayout from "../../components/AdminLayout";
import AdminProtectedRoute from "../../components/AdminProtectedRoute";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Sparkles,
  Wallet,
  CalendarDays,
  Tag,
  Trash2,
  Loader2,
  PlusCircle,
  Coins,
  Percent,
  Hash,
  FileSpreadsheet,
} from "lucide-react";
import counties from "../../utils/counties";

export default function AdminPricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [leadPrices, setLeadPrices] = useState<any[]>([]);
  const [promos, setPromos] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [defaultPrice, setDefaultPrice] = useState<number>(10);
  const [seasonal, setSeasonal] = useState({
    active: false,
    percentage: 0,
    period: "",
  });
  const [newLead, setNewLead] = useState({ county: "", price: "" });
  const [newPromo, setNewPromo] = useState({ code: "", discount: "", expires: "" });
  const [newCommission, setNewCommission] = useState({
    requestId: "",
    amount: "",
    type: "fixed",
  });
  const [saving, setSaving] = useState(false);

  // Load data
  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (!u) return router.push("/company/auth");

      try {
        const [pricesSnap, promoSnap, commSnap] = await Promise.all([
          getDocs(collection(db, "leadPrices")),
          getDocs(collection(db, "promos")),
          getDocs(collection(db, "commissions")),
        ]);

        setLeadPrices(pricesSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setPromos(promoSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setCommissions(commSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
        toast.error("Eroare la încărcarea datelor!");
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [router]);

  // 🔹 Lead prices
  const saveLeadPrice = async () => {
    if (!newLead.county || !newLead.price) return toast.error("Completează toate câmpurile!");
    setSaving(true);
    try {
      await setDoc(doc(db, "leadPrices", newLead.county), {
        county: newLead.county,
        price: parseFloat(newLead.price),
      });
      setLeadPrices((prev) => [
        ...prev.filter((p) => p.county !== newLead.county),
        { county: newLead.county, price: parseFloat(newLead.price) },
      ]);
      toast.success("✅ Tarif actualizat!");
      setNewLead({ county: "", price: "" });
    } catch {
      toast.error("Eroare la salvare!");
    } finally {
      setSaving(false);
    }
  };

  const deleteLeadPrice = async (id: string) => {
    if (!confirm("Sigur vrei să ștergi acest tarif?")) return;
    await deleteDoc(doc(db, "leadPrices", id));
    setLeadPrices((prev) => prev.filter((p) => p.county !== id));
    toast.success("🗑️ Tarif șters!");
  };

  // 🔹 Promo codes
  const addPromo = async () => {
    if (!newPromo.code || !newPromo.discount) return toast.error("Completează codul și discountul!");
    await setDoc(doc(db, "promos", newPromo.code.toUpperCase()), {
      ...newPromo,
      discount: parseFloat(newPromo.discount),
      active: true,
    });
    setPromos((prev) => [...prev, { ...newPromo, active: true }]);
    setNewPromo({ code: "", discount: "", expires: "" });
    toast.success("🎁 Cod promoțional adăugat!");
  };

  const deletePromo = async (id: string) => {
    if (!confirm("Ștergi acest cod promoțional?")) return;
    await deleteDoc(doc(db, "promos", id));
    setPromos((prev) => prev.filter((p) => p.id !== id));
    toast.success("🗑️ Cod șters!");
  };

  // 🔹 Commissions
  const addCommission = async () => {
    if (!newCommission.requestId || !newCommission.amount)
      return toast.error("Completează toate câmpurile!");

    await setDoc(doc(db, "commissions", newCommission.requestId), {
      ...newCommission,
      amount: parseFloat(newCommission.amount),
      createdAt: new Date(),
    });

    setCommissions((prev) => [
      ...prev.filter((c) => c.requestId !== newCommission.requestId),
      { ...newCommission, amount: parseFloat(newCommission.amount) },
    ]);

    setNewCommission({ requestId: "", amount: "", type: "fixed" });
    toast.success("💰 Comision salvat!");
  };

  const deleteCommission = async (id: string) => {
    if (!confirm("Ștergi acest comision manual?")) return;
    await deleteDoc(doc(db, "commissions", id));
    setCommissions((prev) => prev.filter((c) => c.requestId !== id));
    toast.success("🗑️ Comision șters!");
  };

  if (loading)
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-[70vh] text-emerald-600 text-lg">
          <Loader2 className="animate-spin mr-2" /> Se încarcă tarifele...
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
          className="max-w-7xl mx-auto bg-white/80 backdrop-blur-md border border-emerald-100 rounded-3xl shadow-xl p-8 mt-6 mb-20"
        >
          <h1 className="text-3xl font-bold text-center text-emerald-700 mb-10 flex items-center justify-center gap-2">
            <Sparkles size={26} /> Tarife, Promoții & Comisioane
          </h1>

          {/* === Default price + Seasonal === */}
          <div className="grid sm:grid-cols-2 gap-6 mb-10">
            <div className="bg-gradient-to-r from-emerald-50 to-sky-50 border border-emerald-100 p-5 rounded-2xl shadow-sm">
              <h3 className="font-semibold text-emerald-700 flex items-center gap-2 mb-3">
                <Wallet size={18} /> Preț standard lead
              </h3>
              <input
                type="number"
                className="border rounded-lg p-2 w-28 focus:ring-2 focus:ring-emerald-400"
                value={defaultPrice}
                onChange={(e) => setDefaultPrice(Number(e.target.value))}
              />
              <span className="ml-2 text-gray-600">RON / cerere</span>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-amber-200 p-5 rounded-2xl shadow-sm">
              <h3 className="font-semibold text-amber-700 flex items-center gap-2 mb-3">
                <CalendarDays size={18} /> Majorare sezonieră
              </h3>
              <label className="flex items-center gap-2 text-sm mb-2">
                <input
                  type="checkbox"
                  checked={seasonal.active}
                  onChange={() =>
                    setSeasonal((p) => ({ ...p, active: !p.active }))
                  }
                />
                Activ
              </label>
              <input
                type="number"
                className="border rounded-lg p-2 w-28"
                placeholder="%"
                value={seasonal.percentage}
                onChange={(e) =>
                  setSeasonal({ ...seasonal, percentage: Number(e.target.value) })
                }
              />
              <input
                type="text"
                placeholder="Perioadă (ex: 20 Nov – 24 Dec)"
                className="mt-2 border rounded-lg p-2 w-full"
                value={seasonal.period}
                onChange={(e) =>
                  setSeasonal({ ...seasonal, period: e.target.value })
                }
              />
            </div>
          </div>

          {/* === County lead prices === */}
          <section className="mb-12">
            <h2 className="text-lg font-semibold text-emerald-700 flex items-center gap-2 mb-4">
              <Coins size={18} /> Tarife per județ
            </h2>
            <div className="flex flex-wrap gap-2 mb-4">
              <select
                className="border rounded-lg p-2"
                value={newLead.county}
                onChange={(e) => setNewLead({ ...newLead, county: e.target.value })}
              >
                <option value="">Selectează județ</option>
                {counties.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                type="number"
                className="border rounded-lg p-2 w-28"
                placeholder="Preț RON"
                value={newLead.price}
                onChange={(e) => setNewLead({ ...newLead, price: e.target.value })}
              />
              <button
                onClick={saveLeadPrice}
                disabled={saving}
                className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-white rounded-lg text-sm font-medium shadow-md hover:scale-[1.03] transition"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <PlusCircle size={14} />
                )}
                Salvează
              </button>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow">
              <table className="w-full text-sm">
                <thead className="bg-emerald-50 text-gray-800">
                  <tr>
                    <th className="p-3 border-b">Județ</th>
                    <th className="p-3 border-b text-right">Preț (RON)</th>
                    <th className="p-3 border-b text-center">Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {leadPrices.map((p) => (
                    <tr key={p.county} className="hover:bg-emerald-50 transition">
                      <td className="p-3 border-b">{p.county}</td>
                      <td className="p-3 border-b text-right font-semibold text-emerald-700">
                        {p.price.toFixed(2)}
                      </td>
                      <td className="p-3 border-b text-center">
                        <button
                          onClick={() => deleteLeadPrice(p.county)}
                          className="text-gray-500 hover:text-red-600 text-sm font-medium"
                        >
                          <Trash2 size={14} /> Șterge
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* === Promo Codes === */}
          <section className="mb-12">
            <h2 className="text-lg font-semibold text-emerald-700 flex items-center gap-2 mb-4">
              <Tag size={18} /> Coduri promoționale
            </h2>
            <div className="flex flex-wrap gap-2 mb-4">
              <input
                type="text"
                placeholder="Cod (ex: START10)"
                className="border rounded-lg p-2 w-32"
                value={newPromo.code}
                onChange={(e) =>
                  setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })
                }
              />
              <input
                type="number"
                placeholder="Reducere %"
                className="border rounded-lg p-2 w-28"
                value={newPromo.discount}
                onChange={(e) =>
                  setNewPromo({ ...newPromo, discount: e.target.value })
                }
              />
              <input
                type="date"
                className="border rounded-lg p-2"
                value={newPromo.expires}
                onChange={(e) =>
                  setNewPromo({ ...newPromo, expires: e.target.value })
                }
              />
              <button
                onClick={addPromo}
                className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-white rounded-lg text-sm font-medium shadow-md hover:scale-[1.03] transition"
              >
                <PlusCircle size={14} /> Adaugă
              </button>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow">
              <table className="w-full text-sm">
                <thead className="bg-emerald-50 text-gray-800">
                  <tr>
                    <th className="p-3 border-b">Cod</th>
                    <th className="p-3 border-b text-right">Reducere</th>
                    <th className="p-3 border-b">Expiră</th>
                    <th className="p-3 border-b text-center">Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {promos.map((p) => (
                    <tr key={p.id} className="hover:bg-emerald-50 transition">
                      <td className="p-3 border-b font-semibold text-emerald-700">
                        {p.code}
                      </td>
                      <td className="p-3 border-b text-right text-emerald-700">
                        -{p.discount}%
                      </td>
                      <td className="p-3 border-b text-gray-600">
                        {p.expires || "-"}
                      </td>
                      <td className="p-3 border-b text-center">
                        <button
                          onClick={() => deletePromo(p.id)}
                          className="text-gray-500 hover:text-red-600 text-sm font-medium"
                        >
                          <Trash2 size={14} /> Șterge
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* === Manual Commissions === */}
          <section>
            <h2 className="text-lg font-semibold text-emerald-700 flex items-center gap-2 mb-4">
              <FileSpreadsheet size={18} /> Comisioane per cerere
            </h2>
            <div className="flex flex-wrap gap-2 mb-4">
              <input
                type="text"
                placeholder="ID cerere (ex: REQ-12345)"
                className="border rounded-lg p-2 w-40"
                value={newCommission.requestId}
                onChange={(e) =>
                  setNewCommission({ ...newCommission, requestId: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Suma"
                className="border rounded-lg p-2 w-24"
                value={newCommission.amount}
                onChange={(e) =>
                  setNewCommission({ ...newCommission, amount: e.target.value })
                }
              />
              <select
                className="border rounded-lg p-2"
                value={newCommission.type}
                onChange={(e) =>
                  setNewCommission({ ...newCommission, type: e.target.value })
                }
              >
                <option value="fixed">Fix (RON)</option>
                <option value="percent">Procent (%)</option>
              </select>
              <button
                onClick={addCommission}
                className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-white rounded-lg text-sm font-medium shadow-md hover:scale-[1.03] transition"
              >
                <PlusCircle size={14} /> Salvează
              </button>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow">
              <table className="w-full text-sm">
                <thead className="bg-emerald-50 text-gray-800">
                  <tr>
                    <th className="p-3 border-b">Cerere ID</th>
                    <th className="p-3 border-b text-right">Comision</th>
                    <th className="p-3 border-b text-center">Tip</th>
                    <th className="p-3 border-b text-center">Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((c) => (
                    <tr key={c.id} className="hover:bg-emerald-50 transition">
                      <td className="p-3 border-b flex items-center gap-1">
                        <Hash size={14} className="text-sky-600" />
                        {c.requestId}
                      </td>
                      <td className="p-3 border-b text-right font-semibold text-emerald-700">
                        {c.amount}
                      </td>
                      <td className="p-3 border-b text-center capitalize">
                        {c.type === "fixed" ? "Fix" : "Procent"}
                      </td>
                      <td className="p-3 border-b text-center">
                        <button
                          onClick={() => deleteCommission(c.id)}
                          className="text-gray-500 hover:text-red-600 text-sm font-medium"
                        >
                          <Trash2 size={14} /> Șterge
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </motion.div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
