"use client";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

import { useEffect, useState } from "react";
import { db, onAuthChange } from "../../utils/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import AdminLayout from "../../components/AdminLayout";
import AdminProtectedRoute from "../../components/AdminProtectedRoute";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Filter,
  Loader2,
  FileDown,
  CheckCircle2,
  XCircle,
  User,
  Building2,
  MessageSquare,
  Coins,
  ClipboardList,
  Star,
  ShieldAlert,
  Activity,
  ShieldCheck,
  Ban,
  Mail,
} from "lucide-react";

export default function AdminLogsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");

  // 🔹 Load all activity logs
  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (!u) {
        router.push("/company/auth");
        return;
      }

      try {
        const q = query(collection(db, "activity"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setLogs(data);
      } catch (err) {
        console.error("Eroare la încărcarea jurnalului:", err);
        toast.error("Eroare la încărcarea jurnalului de activitate!");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [router]);

  // 🔹 Filter & search
  const filtered = logs.filter((log) => {
    const matchesFilter = filter ? log.type === filter : true;
    const searchTerm = search.trim().toLowerCase();

    const matchesSearch =
      !searchTerm ||
      log.message?.toLowerCase().includes(searchTerm) ||
      log.actor?.email?.toLowerCase().includes(searchTerm) ||
      log.actor?.name?.toLowerCase().includes(searchTerm) ||
      log.targetId?.toLowerCase().includes(searchTerm);

    return matchesFilter && matchesSearch;
  });

  // 🔹 Toggle reviewed flag
  const handleMarkReviewed = async (id: string, reviewed: boolean) => {
    try {
      await updateDoc(doc(db, "activity", id), { reviewed });
      setLogs((prev) =>
        prev.map((l) => (l.id === id ? { ...l, reviewed } : l))
      );
      toast.success(reviewed ? "Marcat ca revizuit" : "Marcat ca nerevizuit");
    } catch (err) {
      console.error("Eroare la actualizarea stării:", err);
      toast.error("Eroare la actualizarea stării!");
    }
  };

  // 🔹 Export CSV
  const exportCSV = () => {
    try {
      const header = "Data,Tip,Mesaj,Email,Nume,Entitate,Revizuit\n";
      const rows = logs
        .map((l) =>
          [
            l.createdAt?.seconds
              ? new Date(l.createdAt.seconds * 1000).toLocaleString("ro-RO")
              : "-",
            l.type || "-",
            `"${l.message?.replace(/"/g, '""') || ""}"`,
            l.actor?.email || "-",
            l.actor?.name || "-",
            l.targetId || "-",
            l.reviewed ? "Da" : "Nu",
          ].join(",")
        )
        .join("\n");

      const blob = new Blob([header + rows], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "activity_logs.csv";
      a.click();
    } catch (err) {
      console.error("Eroare la export CSV:", err);
      toast.error("Eroare la export!");
    }
  };

  if (loading)
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-[70vh] text-emerald-600 text-lg">
          <Loader2 className="animate-spin mr-2" /> Se încarcă activitatea...
        </div>
      </AdminLayout>
    );

  // 🔹 Icons per type
  const typeIcons: Record<string, any> = {
    verification: ShieldCheck,
    suspension: Ban,
    reminder: Mail,
    user: User,
    company: Building2,
    request: ClipboardList,
    payment: Coins,
    message: MessageSquare,
    review: Star,
    admin: ShieldAlert,
  };

  // 🔹 Colors per type
  const typeColors: Record<string, string> = {
    verification: "bg-green-100 text-green-700",
    suspension: "bg-red-100 text-red-700",
    reminder: "bg-blue-100 text-blue-700",
    admin: "bg-gray-100 text-gray-700",
    message: "bg-indigo-100 text-indigo-700",
    payment: "bg-emerald-100 text-emerald-700",
    default: "bg-emerald-50 text-emerald-700",
  };

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto bg-white/80 backdrop-blur-md border border-emerald-100 rounded-3xl shadow-xl p-8 mt-6 mb-20"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-3xl font-bold text-emerald-700 flex items-center gap-2">
              <Activity size={26} /> Jurnal Activitate
            </h1>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-white rounded-xl text-sm font-medium shadow-md hover:scale-[1.03] transition"
            >
              <FileDown size={16} /> Export CSV
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
              <Filter size={18} /> Filtrează activitatea
            </div>
            <div className="flex gap-2">
              <select
                title="Filtru activitate"
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-400"
              >
                <option value="">Toate</option>
                <option value="verification">Verificări</option>
                <option value="suspension">Suspendări</option>
                <option value="reminder">Remindere</option>
                <option value="payment">Plăți</option>
                <option value="message">Mesaje</option>
                <option value="admin">Acțiuni admin</option>
              </select>
              <input
                placeholder="Caută text, email, ID..."
                onChange={(e) => setSearch(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow bg-white/90">
            <table className="w-full text-sm">
              <thead className="bg-emerald-50 text-gray-800">
                <tr>
                  <th className="p-3 border-b">Data</th>
                  <th className="p-3 border-b text-left">Tip</th>
                  <th className="p-3 border-b text-left">Mesaj</th>
                  <th className="p-3 border-b text-left">Email</th>
                  <th className="p-3 border-b text-left">Nume</th>
                  <th className="p-3 border-b text-center">Entitate</th>
                  <th className="p-3 border-b text-center">Revizuit</th>
                  <th className="p-3 border-b text-center">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => {
                  const Icon = typeIcons[log.type] || Activity;
                  const color = typeColors[log.type] || typeColors.default;

                  return (
                    <tr
                      key={log.id}
                      className={`transition hover:bg-emerald-50 ${
                        log.reviewed ? "opacity-75" : ""
                      }`}
                    >
                      <td className="p-3 border-b text-xs text-gray-500">
                        {log.createdAt?.seconds
                          ? new Date(log.createdAt.seconds * 1000).toLocaleString("ro-RO")
                          : "-"}
                      </td>
                      <td className="p-3 border-b text-left">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${color}`}
                        >
                          <Icon size={14} />
                          {log.type}
                        </span>
                      </td>
                      <td className="p-3 border-b text-gray-700 truncate max-w-[320px]">
                        {log.message || "-"}
                      </td>
                      <td className="p-3 border-b text-gray-700">{log.actor?.email || "-"}</td>
                      <td className="p-3 border-b text-gray-700">{log.actor?.name || "-"}</td>
                      <td className="p-3 border-b text-center text-gray-500">{log.targetId || "-"}</td>
                      <td className="p-3 border-b text-center">
                        {log.reviewed ? (
                          <CheckCircle2 size={16} className="text-green-600 inline" />
                        ) : (
                          <XCircle size={16} className="text-red-500 inline" />
                        )}
                      </td>
                      <td className="p-3 border-b text-center">
                        <button
                          onClick={() => handleMarkReviewed(log.id, !log.reviewed)}
                          className={`text-sm font-medium ${
                            log.reviewed
                              ? "text-red-500 hover:text-red-700"
                              : "text-emerald-600 hover:text-emerald-700"
                          }`}
                        >
                          {log.reviewed ? "Anulează" : "Marchează"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-gray-500 mt-6">
              Nu există activitate pentru filtrele selectate.
            </p>
          )}
        </motion.div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
