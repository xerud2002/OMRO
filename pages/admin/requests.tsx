"use client";
import { useEffect, useState } from "react";
import { db, onAuthChange } from "../../utils/firebase";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell } from "recharts";
import {
  Inbox,
  Handshake,
  CheckCircle2,
  Ban,
  Hash,
  Eye,
  Trash2,
  SearchCheck,
  Loader2,
  ClipboardList,
  Home,
  MapPin,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import AdminLayout from "../../components/AdminLayout";
import AdminProtectedRoute from "../../components/AdminProtectedRoute";

export default function AdminRequestsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [selected, setSelected] = useState<any | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // --- Load data ---
  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (!u) return router.push("/company/auth");
      const snap = await getDoc(doc(db, "users", u.uid));
      if (!snap.exists() || snap.data().role !== "admin") {
        toast.error("⛔ Acces interzis!");
        return router.push("/");
      }

      const requestsSnap = await getDocs(collection(db, "requests"));
      const merged = await Promise.all(
        requestsSnap.docs.map(async (r) => {
          const data = r.data();
          let requestId = data.requestId;
          if (!requestId) {
            requestId = `REQ-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
            await updateDoc(doc(db, "requests", r.id), { requestId });
          }
          return { id: r.id, requestId, ...data };
        })
      );
      setRequests(merged);
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  if (loading)
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-[70vh] text-emerald-600 text-lg">
          <Loader2 className="animate-spin mr-2" /> Se încarcă cererile...
        </div>
      </AdminLayout>
    );

  // ✅ Stats
  const stats = {
    noua: requests.filter((r) => r.status === "noua").length,
    in_interes: requests.filter((r) => r.status === "in_interes").length,
    finalizata: requests.filter((r) => r.status === "finalizata").length,
    anulata: requests.filter((r) => r.status === "anulata").length,
  };

  const total = requests.length || 1;
  const chartData = [
    { name: "Nouă", value: stats.noua, color: "#60A5FA", icon: Inbox },
    { name: "În interes", value: stats.in_interes, color: "#38BDF8", icon: Handshake },
    { name: "Finalizată", value: stats.finalizata, color: "#10B981", icon: CheckCircle2 },
    { name: "Anulată", value: stats.anulata, color: "#F87171", icon: Ban },
  ];

  // ✅ Filter + search
  const filtered = requests.filter((r) => {
    const matchesFilter = filter ? r.status === filter : true;
    const matchesSearch =
      r.customerName?.toLowerCase().includes(search) ||
      r.email?.toLowerCase().includes(search) ||
      r.pickupCity?.toLowerCase().includes(search) ||
      r.deliveryCity?.toLowerCase().includes(search);
    return matchesFilter && (!search || matchesSearch);
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Sigur vrei să ștergi această cerere?")) return;
    setProcessingId(id);
    await deleteDoc(doc(db, "requests", id));
    setRequests((prev) => prev.filter((r) => r.id !== id));
    setProcessingId(null);
    toast.success("🗑️ Cererea a fost ștearsă!");
  };

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto p-8 bg-gradient-to-br from-emerald-50 to-sky-50 rounded-3xl shadow-xl mt-8 mb-20"
        >
          <h1 className="text-3xl font-bold text-center text-emerald-700 mb-10">
            📦 Panou Admin – Cereri Clienți
          </h1>

          {/* === KPI CARDS === */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {chartData.map((c) => {
              const Icon = c.icon;
              return (
                <motion.div
                  key={c.name}
                  whileHover={{ scale: 1.03 }}
                  className="bg-white/90 rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-full"
                      style={{ backgroundColor: `${c.color}22` }}
                    >
                      <Icon size={22} color={c.color} />
                    </div>
                    <h3 className="text-sm text-gray-600 font-medium capitalize">
                      {c.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <h4
                      className="text-3xl font-bold"
                      style={{ color: c.color }}
                    >
                      {c.value}
                    </h4>
                    <PieChart width={55} height={55}>
                      <Pie
                        data={[
                          { value: c.value },
                          { value: total - c.value },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={16}
                        outerRadius={23}
                        startAngle={90}
                        endAngle={450}
                        stroke="none"
                      >
                        <Cell fill={c.color} />
                        <Cell fill="#E5E7EB" />
                      </Pie>
                    </PieChart>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* === FILTER BAR === */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
              <ClipboardList size={20} /> Cereri înregistrate
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <SearchCheck
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Caută client, oraș..."
                  className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-400"
                  onChange={(e) => setSearch(e.target.value.toLowerCase())}
                />
              </div>
              <select
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-400"
              >
                <option value="">Toate</option>
                <option value="noua">Nouă</option>
                <option value="in_interes">În interes</option>
                <option value="finalizata">Finalizată</option>
                <option value="anulata">Anulată</option>
              </select>
            </div>
          </div>

          {/* === TABLE === */}
          <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-md bg-white/90">
            <table className="w-full text-sm">
              <thead className="bg-emerald-50 text-gray-800">
                <tr>
                  <th className="p-3 border-b w-[15%]">ID / Dată / Email</th>
                  <th className="p-3 border-b w-[18%]">Client</th>
                  <th className="p-3 border-b w-[25%]">Detalii mutare</th>
                  <th className="p-3 border-b w-[12%]">Data mutării</th>
                  <th className="p-3 border-b w-[10%] text-center">Status</th>
                  <th className="p-3 border-b w-[15%]">Companie</th>
                  <th className="p-3 border-b w-[10%] text-center">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  // 🔹 Format client name intelligently
                  const fullName = (r.customerName || "").trim();
                  let displayName = fullName;

                  if (fullName.includes(" ")) {
                    const parts = fullName.split(" ");
                    const firstName = parts[0];
                    const lastName = parts[parts.length - 1];

                    // Handle cases like “Maria Magdalena Popescu”
                    if (parts.length > 2 && parts[1][0].toUpperCase() === lastName[0].toUpperCase()) {
                      displayName = `${firstName} ${parts[1][0].toUpperCase()}.`;
                    } 
                    // Handle cases like “Ana-Maria Popescu”
                    else if (firstName.includes("-")) {
                      const prefix = firstName.split("-")[1]?.[0]?.toUpperCase();
                      displayName = `${firstName.split("-")[0]}-${prefix}.`;
                    } 
                    // Standard case “Maria Popescu” → “Maria P.”
                    else {
                      displayName = `${firstName} ${lastName[0].toUpperCase()}.`;
                    }
                  }

                  return (
                    <tr
                      key={r.id}
                      className={`transition ${
                        r.status === "finalizata"
                          ? "bg-green-50 hover:bg-green-100"
                          : r.status === "in_interes"
                          ? "bg-blue-50 hover:bg-blue-100"
                          : r.status === "anulata"
                          ? "bg-red-50 hover:bg-red-100"
                          : "hover:bg-yellow-50"
                      }`}
                    >
                      {/* ID / Date / Email */}
                      <td className="p-3 border-b text-xs text-gray-600">
                        <div className="flex flex-col leading-tight">
                          <span className="font-semibold text-gray-800 flex items-center gap-1">
                            <Hash size={13} className="text-emerald-600" />
                            {r.requestId || r.id}
                          </span>
                          {r.createdAt?.seconds && (
                            <span className="text-[11px] text-gray-400">
                              {new Date(r.createdAt.seconds * 1000).toLocaleDateString("ro-RO")}
                            </span>
                          )}
                          <span className="text-[11px] text-gray-500 truncate">{r.email}</span>
                        </div>
                      </td>

                      {/* Client */}
                      <td className="p-3 border-b text-sm text-gray-800 font-medium">
                        {displayName}
                      </td>

                      {/* Detalii mutare */}
                      <td className="p-3 border-b text-sm">
                        <div className="flex flex-col">
                          <p className="font-medium text-gray-700 flex items-center gap-1">
                            <MapPin size={13} className="text-sky-600" />
                            {r.pickupCity || "-"} → {r.deliveryCity || "-"}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Home size={12} className="text-emerald-600" />
                            {r.propertyType || "Proprietate"} • {r.rooms || "?"} camere
                          </p>
                        </div>
                      </td>

                      {/* Data mutării */}
                      <td className="p-3 border-b text-sm text-gray-700">
                        {r.moveDate || "-"}
                      </td>

                      {/* Status */}
                      <td className="p-3 border-b text-center">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                            r.status === "finalizata"
                              ? "bg-green-100 text-green-700"
                              : r.status === "in_interes"
                              ? "bg-blue-100 text-blue-700"
                              : r.status === "anulata"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {r.status.replace("_", " ")}
                        </span>
                      </td>

                      {/* Companie */}
                      <td className="p-3 border-b text-sm text-gray-700">
                        {r.assignedCompany ? (
                          <span className="font-medium text-gray-800">{r.assignedCompany}</span>
                        ) : (
                          <span className="text-gray-400 italic">— neatribuit —</span>
                        )}
                      </td>

                      {/* Acțiuni */}
                      <td className="p-3 border-b text-center">
                        {processingId === r.id ? (
                          <Loader2 className="animate-spin inline text-emerald-600" size={16} />
                        ) : (
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => setSelected(r)}
                              className="text-sky-600 hover:underline text-sm font-medium"
                            >
                              <Eye size={15} className="inline mr-1" /> Vezi
                            </button>
                            <button
                              onClick={() => handleDelete(r.id)}
                              className="text-gray-500 hover:text-red-500 text-sm font-medium"
                            >
                              <Trash2 size={14} className="inline" /> Șterge
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>


          {/* === MODAL DETALII === */}
          {selected && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-lg relative">
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
                >
                  ✕
                </button>
                <h3 className="text-xl font-semibold text-emerald-700 mb-4">
                  Detalii cerere {selected.requestId}
                </h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Client:</strong> {selected.customerName}</p>
                  <p><strong>Email:</strong> {selected.email}</p>
                  <p><strong>Telefon:</strong> {selected.phone}</p>
                  <p><strong>Colectare:</strong> {selected.pickupCity}</p>
                  <p><strong>Livrare:</strong> {selected.deliveryCity}</p>
                  <p><strong>Status:</strong> {selected.status}</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
