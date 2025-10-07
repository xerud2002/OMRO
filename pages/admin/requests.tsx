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
  addDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell } from "recharts";
import {
  Inbox,
  Handshake,
  CheckCircle2,
  Ban,
  Hash,
  Trash2,
  SearchCheck,
  Loader2,
  ClipboardList,
  Home,
  MapPin,
  User,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Edit3,
  FileText,
  Clock,
  Building2,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import AdminLayout from "../../components/AdminLayout";
import AdminProtectedRoute from "../../components/AdminProtectedRoute";

export default function AdminRequestsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [selected, setSelected] = useState<any | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [timeline, setTimeline] = useState<any[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Load everything
  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (!u) return router.push("/company/auth");
      const snap = await getDoc(doc(db, "users", u.uid));
      if (!snap.exists() || snap.data().role !== "admin") {
        toast.error("⛔ Acces interzis!");
        return router.push("/");
      }

      const [reqSnap, compSnap] = await Promise.all([
        getDocs(collection(db, "requests")),
        getDocs(query(collection(db, "companies"), where("verified", "==", true))),
      ]);

      const merged = await Promise.all(
        reqSnap.docs.map(async (r) => {
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
      setCompanies(compSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
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

  const total = requests.length || 1;
  const stats = {
    noua: requests.filter((r) => r.status === "noua").length,
    in_interes: requests.filter((r) => r.status === "in_interes").length,
    finalizata: requests.filter((r) => r.status === "finalizata").length,
    anulata: requests.filter((r) => r.status === "anulata").length,
    expirata: requests.filter((r) => r.status === "expirata").length,
  };

  const chartData = [
    { name: "Nouă", value: stats.noua, color: "#facc15", icon: Inbox },
    { name: "În interes", value: stats.in_interes, color: "#38BDF8", icon: Handshake },
    { name: "Finalizată", value: stats.finalizata, color: "#10B981", icon: CheckCircle2 },
    { name: "Anulată", value: stats.anulata, color: "#EF4444", icon: Ban },
    { name: "Expirată", value: stats.expirata, color: "#9CA3AF", icon: Clock },
  ];

  const filtered = requests.filter((r) => {
    const f = filter ? r.status === filter : true;
    const s =
      r.customerName?.toLowerCase().includes(search) ||
      r.email?.toLowerCase().includes(search) ||
      r.pickupCity?.toLowerCase().includes(search) ||
      r.deliveryCity?.toLowerCase().includes(search);
    return f && (!search || s);
  });

  // Pagination
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentRows = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  // 🔹 Quick status update
  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateDoc(doc(db, "requests", id), { status: newStatus });
    await addActivity(id, `Status schimbat la: ${newStatus}`);
    setRequests((p) => p.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
    toast.success(`✅ Status actualizat la "${newStatus}"`);
  };

  // 🔹 Assign company
  const handleAssignCompany = async (id: string, compId: string) => {
    const comp = companies.find((c) => c.id === compId);
    if (!comp) return;
    await updateDoc(doc(db, "requests", id), {
      assignedCompany: comp.name,
      assignedCompanyId: comp.id,
      status: "in_interes",
    });
    await addActivity(id, `Cererea atribuită companiei: ${comp.name}`);
    setRequests((p) =>
      p.map((r) =>
        r.id === id
          ? { ...r, assignedCompany: comp.name, assignedCompanyId: comp.id, status: "in_interes" }
          : r
      )
    );
    toast.success(`🏢 Cererea atribuită: ${comp.name}`);
  };

  // 🔹 Notes modal
  const openNotes = async (req: any) => {
    setSelected(req);
    const q = query(collection(db, "requests", req.id, "history"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setTimeline(snap.docs.map((d) => d.data()));
  };

  const addNote = async () => {
    if (!notes.trim() || !selected) return;
    await addActivity(selected.id, notes);
    setNotes("");
    toast.success("🗒 Notă adăugată");
    openNotes(selected);
  };

  const addActivity = async (reqId: string, text: string) => {
    await addDoc(collection(db, "requests", reqId, "history"), {
      text,
      createdAt: new Date(),
    });
  };

  const deleteRequest = async (id: string) => {
    if (!confirm("Sigur vrei să ștergi această cerere?")) return;
    setProcessingId(id);
    await deleteDoc(doc(db, "requests", id));
    setRequests((p) => p.filter((r) => r.id !== id));
    setProcessingId(null);
    toast.success("🗑️ Cererea ștearsă");
  };

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto p-8 bg-white/80 rounded-3xl shadow-xl mt-6 mb-20 border border-emerald-100"
        >
          <h1 className="text-3xl font-bold text-emerald-700 mb-10 text-center">
            📦 Panou Admin – Cereri Clienți
          </h1>

          {/* KPI */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
            {chartData.map((c) => {
              const Icon = c.icon;
              return (
                <motion.div
                  key={c.name}
                  whileHover={{ scale: 1.03 }}
                  className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm text-center"
                >
                  <Icon className="mx-auto mb-1" color={c.color} />
                  <h3 className="text-sm text-gray-600 font-medium">{c.name}</h3>
                  <h4 className="text-2xl font-bold" style={{ color: c.color }}>
                    {c.value}
                  </h4>
                </motion.div>
              );
            })}
          </div>

          {/* Filter */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-5">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
              <ClipboardList size={20} /> Cereri înregistrate
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <SearchCheck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
                <option value="expirata">Expirată</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full text-sm text-gray-700">
              <thead className="bg-emerald-50 text-gray-800 font-semibold text-center">
                <tr>
                  <th className="py-3 px-4">ID / Dată / Email</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Detalii</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Companie</th>
                  <th className="py-3 px-4">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map((r) => (
                  <tr
                    key={r.id}
                    className={`text-center border-b hover:bg-emerald-50 transition ${
                      r.status === "finalizata"
                        ? "border-l-4 border-l-green-500"
                        : r.status === "in_interes"
                        ? "border-l-4 border-l-blue-400"
                        : r.status === "anulata"
                        ? "border-l-4 border-l-red-400"
                        : r.status === "expirata"
                        ? "border-l-4 border-l-gray-400"
                        : "border-l-4 border-l-yellow-400"
                    }`}
                  >
                    <td className="py-3 px-4 text-left">
                      <div className="text-xs text-gray-600">
                        <Hash size={12} className="inline text-emerald-600" /> {r.requestId}
                      </div>
                      {r.createdAt?.seconds && (
                        <div className="text-[11px] text-gray-400">
                          {new Date(r.createdAt.seconds * 1000).toLocaleDateString("ro-RO")}
                        </div>
                      )}
                      <div className="text-[11px] text-gray-500 truncate">{r.email}</div>
                    </td>
                    <td className="py-3 px-4 font-medium">{r.customerName || "-"}</td>
                    <td className="py-3 px-4 text-left">
                      <div className="text-xs text-gray-700 flex items-center gap-1">
                        <MapPin size={12} /> {r.pickupCity} → {r.deliveryCity}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Home size={12} /> {r.propertyType || "-"} • {r.rooms || "?"} camere
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={r.status}
                        onChange={(e) => handleStatusChange(r.id, e.target.value)}
                        className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:ring-emerald-400"
                      >
                        <option value="noua">Nouă</option>
                        <option value="in_interes">În interes</option>
                        <option value="finalizata">Finalizată</option>
                        <option value="anulata">Anulată</option>
                        <option value="expirata">Expirată</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={r.assignedCompanyId || ""}
                        onChange={(e) => handleAssignCompany(r.id, e.target.value)}
                        className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:ring-emerald-400"
                      >
                        <option value="">— neatribuit —</option>
                        {companies.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 flex justify-center gap-2">
                      <button
                        onClick={() => openNotes(r)}
                        className="text-emerald-600 hover:text-emerald-800"
                        title="Note & Istoric"
                      >
                        <FileText size={16} />
                      </button>
                      <button
                        onClick={() => deleteRequest(r.id)}
                        className="text-gray-500 hover:text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filtered.length > rowsPerPage && (
            <div className="flex justify-between items-center mt-5 text-sm text-gray-600">
              <p>
                Afișează <strong>{indexOfFirst + 1}–{Math.min(indexOfLast, filtered.length)}</strong>{" "}
                din <strong>{filtered.length}</strong>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-lg border ${
                    currentPage === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-emerald-50 border-emerald-200"
                  }`}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-lg border ${
                    currentPage === totalPages
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-emerald-50 border-emerald-200"
                  }`}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Notes Modal */}
          {selected && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-lg relative">
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
                >
                  ✕
                </button>
                <h3 className="text-xl font-semibold text-emerald-700 mb-4 flex items-center gap-2">
                  <Edit3 size={18} /> Note & Istoric
                </h3>
                <div className="max-h-[300px] overflow-y-auto mb-4">
                  {timeline.length === 0 ? (
                    <p className="text-gray-500 text-sm">Nicio activitate înregistrată.</p>
                  ) : (
                    <ul className="text-sm text-gray-700 space-y-2">
                      {timeline.map((t, i) => (
                        <li key={i} className="border-b pb-2">
                          <p>{t.text}</p>
                          <span className="text-[11px] text-gray-400">
                            {t.createdAt?.seconds
                              ? new Date(t.createdAt.seconds * 1000).toLocaleString("ro-RO")
                              : ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Adaugă o notă internă..."
                  className="w-full border rounded-lg p-2 text-sm mb-3 focus:ring-2 focus:ring-emerald-400"
                />
                <button
                  onClick={addNote}
                  className="w-full bg-gradient-to-r from-emerald-500 to-sky-500 text-white py-2 rounded-xl font-medium hover:scale-[1.02] transition-all"
                >
                  Adaugă notă
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
