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
// @ts-ignore
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { ClipboardList, Loader2, Trash2, Hash } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import AdminLayout from "../../components/AdminLayout";
import AdminProtectedRoute from "../../components/AdminProtectedRoute";

/* ---------- ✅ Type Definitions ---------- */
interface CompanyData {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
}

interface UserData {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
}

interface RequestData {
  id: string;
  requestId?: string;
  status: "noua" | "in_interes" | "finalizata" | "anulata";
  customerName?: string;
  email?: string;
  phone?: string;
  pickupCity?: string;
  deliveryCity?: string;
  moveDate?: string;
  assignedCompany?: string;
  assignedCompanyId?: string;
  userId?: string;
}

/* ---------- ✅ Component ---------- */
export default function AdminRequestsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<RequestData | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("");

  // --- Load data ---
  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (!u) {
        router.push("/company/auth");
        return;
      }

      const snap = await getDoc(doc(db, "users", u.uid));
      const isAdmin = snap.exists() && snap.data().role === "admin";

      if (!isAdmin) {
        toast.error("⛔ Acces interzis!");
        router.push("/");
        return;
      }

      const [companiesSnap, requestsSnap, usersSnap] = await Promise.all([
        getDocs(collection(db, "companies")),
        getDocs(collection(db, "requests")),
        getDocs(collection(db, "users")),
      ]);

      setCompanies(companiesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as CompanyData)));
      setUsers(usersSnap.docs.map((d) => ({ id: d.id, ...d.data() } as UserData)));

      // 🧠 Normalizează statusurile + adaugă ID scurt dacă lipsește
      const usersMap = new Map(usersSnap.docs.map((d) => [d.id, d.data()]));
      const merged = await Promise.all(
        requestsSnap.docs.map(async (r) => {
          const data = r.data();
          const user = usersMap.get(data.userId);

          // 🔹 Normalize status
          const normalizedStatus: RequestData["status"] =
            ["noua", "in_interes", "finalizata", "anulata"].includes(data.status)
              ? data.status
              : "noua";

          if (data.status !== normalizedStatus) {
            await updateDoc(doc(db, "requests", r.id), { status: normalizedStatus });
          }

          // 🔹 Add requestId if missing
          let requestId = data.requestId;
          if (!requestId) {
            requestId = `REQ-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
            await updateDoc(doc(db, "requests", r.id), { requestId });
          }

          return {
            id: r.id,
            requestId,
            ...data,
            status: normalizedStatus,
            customerName: user?.name || "Client necunoscut",
            email: user?.email || "-",
            phone: user?.phone || "-",
          } as RequestData;
        })
      );

      // 🗓️ Sortează descrescător după data mutării
      const sorted = merged.sort((a, b) =>
        (b.moveDate || "").localeCompare(a.moveDate || "")
      );

      setRequests(sorted);
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

  // 📊 Statistici pentru grafice
  const newRequests = requests.filter((r) => r.status === "noua").length;
  const interestedRequests = requests.filter((r) => r.status === "in_interes").length;
  const completedRequests = requests.filter((r) => r.status === "finalizata").length;
  const canceledRequests = requests.filter((r) => r.status === "anulata").length;

  const pieData = [
    { name: "Nouă", value: newRequests, color: "#facc15" },
    { name: "În interes", value: interestedRequests, color: "#3b82f6" },
    { name: "Finalizată", value: completedRequests, color: "#10b981" },
    { name: "Anulată", value: canceledRequests, color: "#ef4444" },
  ];

  const filtered = requests.filter((r) => (filter ? r.status === filter : true));

  // 🔹 Handlers
  const handleDelete = async (id: string) => {
    if (!confirm("Sigur vrei să ștergi această cerere?")) return;
    setProcessingId(id);
    await deleteDoc(doc(db, "requests", id));
    setRequests((prev) => prev.filter((r) => r.id !== id));
    setProcessingId(null);
    toast.success("🗑️ Cererea a fost ștearsă!");
  };

  const handleStatus = async (id: string, status: RequestData["status"]) => {
    setProcessingId(id);
    await updateDoc(doc(db, "requests", id), { status });
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    setProcessingId(null);
    toast.success(`✅ Status actualizat: ${status}`);
  };

  const handleAssign = async (id: string, companyId: string) => {
    setProcessingId(id);
    const company = companies.find((c) => c.id === companyId);
    if (!company) return;
    await updateDoc(doc(db, "requests", id), {
      assignedCompany: company.name,
      assignedCompanyId: company.id,
      status: "in_interes",
    });
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, assignedCompany: company.name, status: "in_interes" }
          : r
      )
    );
    setProcessingId(null);
    toast.success(`🏢 Cererea este acum "În interes" la ${company.name}`);
  };

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="max-w-7xl mx-auto p-8 bg-white rounded-3xl shadow-md mt-8 mb-20">
          <h1 className="text-3xl font-bold text-center text-emerald-700 mb-10">
            📦 Gestionare Cereri
          </h1>

          {/* --- Chart --- */}
          <div className="bg-white/80 border border-emerald-100 rounded-2xl shadow-lg p-6 mb-10">
            <h2 className="text-lg font-semibold text-emerald-700 mb-4">
              Distribuția cererilor
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* --- Filters --- */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-emerald-700 flex items-center gap-2">
              <ClipboardList size={22} /> Cereri clienți
            </h2>
            <select
              aria-label="Filtrează cererile"
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400"
            >
              <option value="">Toate</option>
              <option value="noua">Nouă</option>
              <option value="in_interes">În interes</option>
              <option value="finalizata">Finalizată</option>
              <option value="anulata">Anulată</option>
            </select>
          </div>

          {/* --- Requests Table --- */}
          <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow">
            <table className="w-full text-sm">
              <thead className="bg-emerald-50 text-left">
                <tr>
                  <th className="p-3 border-b">ID</th>
                  <th className="p-3 border-b">Client</th>
                  <th className="p-3 border-b">Email</th>
                  <th className="p-3 border-b">Telefon</th>
                  <th className="p-3 border-b">Colectare</th>
                  <th className="p-3 border-b">Livrare</th>
                  <th className="p-3 border-b">Data mutării</th>
                  <th className="p-3 border-b">Firmă atribuită</th>
                  <th className="p-3 border-b text-center">Status</th>
                  <th className="p-3 border-b text-center">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-emerald-50 transition">
                    <td className="p-3 border-b text-xs text-gray-600 flex items-center gap-1">
                      <Hash size={12} className="text-emerald-500" />
                      {r.requestId || r.id}
                    </td>
                    <td className="p-3 border-b font-medium">{r.customerName}</td>
                    <td className="p-3 border-b">{r.email}</td>
                    <td className="p-3 border-b">{r.phone}</td>
                    <td className="p-3 border-b">{r.pickupCity}</td>
                    <td className="p-3 border-b">{r.deliveryCity}</td>
                    <td className="p-3 border-b">{r.moveDate || "-"}</td>
                    <td className="p-3 border-b">{r.assignedCompany || "-"}</td>
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
                        {r.status === "noua"
                          ? "Nouă"
                          : r.status === "in_interes"
                          ? "În interes"
                          : r.status === "finalizata"
                          ? "Finalizată"
                          : "Anulată"}
                      </span>
                    </td>
                    <td className="p-3 border-b text-center space-x-2">
                      {processingId === r.id ? (
                        <Loader2 className="inline animate-spin text-emerald-600" size={16} />
                      ) : (
                        <>
                          <button
                            onClick={() => setSelectedRequest(r)}
                            className="text-emerald-600 hover:underline font-medium"
                          >
                            Vezi
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="text-red-600 hover:underline font-medium"
                          >
                            <Trash2 size={14} className="inline" /> Șterge
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
