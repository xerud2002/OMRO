"use client";
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
  Clock,
  Filter,
  Loader2,
  FileDown,
  ShieldAlert,
  Eye,
  CheckCircle2,
  XCircle,
  Trash2,
  User,
  Building2,
  MessageSquare,
  Coins,
  ClipboardList,
  Star,
  Activity,
} from "lucide-react";

export default function AdminLogsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (!u) return router.push("/company/auth");
      try {
        // Load all logs
        const snap = await getDocs(
          query(collection(db, "activityLogs"), orderBy("createdAt", "desc"))
        );
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setLogs(data);
      } catch (err) {
        console.error(err);
        toast.error("Eroare la încărcarea jurnalului de activitate!");
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [router]);

  // Filter + search
  const filtered = logs.filter((log) => {
    const matchesFilter = filter ? log.type === filter : true;
    const matchesSearch =
      log.userName?.toLowerCase().includes(search) ||
      log.email?.toLowerCase().includes(search) ||
      log.entityId?.toLowerCase().includes(search) ||
      log.description?.toLowerCase().includes(search);
    return matchesFilter && (!search || matchesSearch);
  });

  const handleMarkReviewed = async (id: string, reviewed: boolean) => {
    await updateDoc(doc(db, "activityLogs", id), { reviewed });
    setLogs((prev) =>
      prev.map((l) => (l.id === id ? { ...l, reviewed } : l))
    );
    toast.success(reviewed ? "Marcat ca revizuit" : "Marcat ca nerevizuit");
  };

  const exportCSV = () => {
    const header = "Date,User,Type,Description,Entity,Reviewed\n";
    const rows = logs
      .map(
        (l) =>
          `${l.createdAt?.seconds
            ? new Date(l.createdAt.seconds * 1000).toLocaleString("ro-RO")
            : "-"
          },${l.userName || "-"},${l.type || "-"},${l.description || ""},${
            l.entityId || "-"
          },${l.reviewed ? "Da" : "Nu"}`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "activity_logs.csv";
    a.click();
  };

  if (loading)
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-[70vh] text-emerald-600 text-lg">
          <Loader2 className="animate-spin mr-2" /> Se încarcă activitatea...
        </div>
      </AdminLayout>
    );

  const typeIcons: any = {
    user: User,
    company: Building2,
    request: ClipboardList,
    review: Star,
    payment: Coins,
    message: MessageSquare,
    admin: ShieldAlert,
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
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-400"
              >
                <option value="">Toate</option>
                <option value="user">User</option>
                <option value="company">Companie</option>
                <option value="request">Cerere</option>
                <option value="payment">Plată</option>
                <option value="message">Mesaj</option>
                <option value="review">Recenzie</option>
                <option value="admin">Admin</option>
              </select>
              <input
                placeholder="Caută nume, email, ID..."
                onChange={(e) => setSearch(e.target.value.toLowerCase())}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow bg-white/90">
            <table className="w-full text-sm">
              <thead className="bg-emerald-50 text-gray-800">
                <tr>
                  <th className="p-3 border-b">Dată</th>
                  <th className="p-3 border-b">Utilizator</th>
                  <th className="p-3 border-b">Tip</th>
                  <th className="p-3 border-b">Descriere</th>
                  <th className="p-3 border-b text-center">Entitate</th>
                  <th className="p-3 border-b text-center">Revizuit</th>
                  <th className="p-3 border-b text-center">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => {
                  const Icon = typeIcons[log.type] || Activity;
                  return (
                    <tr
                      key={log.id}
                      className={`transition hover:bg-emerald-50 ${
                        log.reviewed ? "opacity-80" : ""
                      }`}
                    >
                      <td className="p-3 border-b text-xs text-gray-500">
                        {log.createdAt?.seconds
                          ? new Date(
                              log.createdAt.seconds * 1000
                            ).toLocaleString("ro-RO")
                          : "-"}
                      </td>
                      <td className="p-3 border-b font-medium flex items-center gap-2">
                        <User size={14} className="text-emerald-600" />
                        {log.userName || "-"}
                      </td>
                      <td className="p-3 border-b text-center text-gray-700">
                        <div className="inline-flex items-center gap-1">
                          <Icon size={14} className="text-emerald-600" />
                          {log.type}
                        </div>
                      </td>
                      <td className="p-3 border-b truncate max-w-[300px]">
                        {log.description || "-"}
                      </td>
                      <td className="p-3 border-b text-center text-gray-500">
                        {log.entityId || "-"}
                      </td>
                      <td className="p-3 border-b text-center">
                        {log.reviewed ? (
                          <CheckCircle2
                            size={16}
                            className="text-green-600 inline"
                          />
                        ) : (
                          <XCircle
                            size={16}
                            className="text-red-500 inline"
                          />
                        )}
                      </td>
                      <td className="p-3 border-b text-center">
                        {log.reviewed ? (
                          <button
                            onClick={() => handleMarkReviewed(log.id, false)}
                            className="text-gray-500 hover:text-red-500"
                          >
                            <XCircle size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMarkReviewed(log.id, true)}
                            className="text-emerald-600 hover:text-green-700"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        )}
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
