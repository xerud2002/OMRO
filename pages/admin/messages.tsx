"use client";
import { useEffect, useState } from "react";
import { db, onAuthChange } from "../../utils/firebase";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import AdminLayout from "../../components/AdminLayout";
import AdminProtectedRoute from "../../components/AdminProtectedRoute";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Loader2,
  MessageSquare,
  SearchCheck,
  Mail,
  User,
  Building2,
  Ban,
  FileDown,
  Filter,
} from "lucide-react";

export default function AdminMessagesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedThread, setSelectedThread] = useState<any | null>(null);

  // ✅ Load all conversations
  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (!u) return router.push("/company/auth");

      const userSnap = await getDoc(doc(db, "users", u.uid));
      const role = userSnap.exists() ? userSnap.data().role : null;
      if (role !== "admin") {
        toast.error("⛔ Acces interzis!");
        router.push("/");
        return;
      }

      setLoading(true);
      try {
        // 1️⃣ Get all requests
        const reqSnap = await getDocs(collection(db, "requests"));
        const reqs = reqSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

        // 2️⃣ Parallel fetch all messages
        const threads = await Promise.all(
          reqs.map(async (r) => {
            const msgsSnap = await getDocs(
              query(collection(db, "requests", r.id, "messages"), orderBy("createdAt", "desc"))
            );
            if (msgsSnap.empty) return null;
            const msgs = msgsSnap.docs.map((m) => m.data());
            const last = msgs[0];
            return {
              id: r.id,
              requestId: r.id,
              customerName: r.name || "-",
              companyName: r.companyName || "-",
              lastMessage: last.text || last.fileName || "(fără conținut)",
              lastMessageAt: last.createdAt,
              messages: msgs,
            };
          })
        );

        // 3️⃣ Keep only threads that have messages
        const valid = threads.filter(Boolean);
        valid.sort(
          (a, b) =>
            (b.lastMessageAt?.seconds || 0) - (a.lastMessageAt?.seconds || 0)
        );
        setMessages(valid);
      } catch (err) {
        console.error("❌ Eroare la încărcare conversații:", err);
        toast.error("Eroare la încărcare conversații!");
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [router]);


  if (loading)
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[70vh] text-emerald-600">
          <Loader2 className="animate-spin mr-2" /> Se încarcă conversațiile...
        </div>
      </AdminLayout>
    );

  // 🔍 Filter + search
  const filtered = messages.filter((m) => {
    const matchesFilter = filter ? m.status === filter : true;
    const matchesSearch =
      m.customerName?.toLowerCase().includes(search) ||
      m.companyName?.toLowerCase().includes(search) ||
      m.requestId?.toLowerCase().includes(search);
    return matchesFilter && (!search || matchesSearch);
  });

  // 📤 Export CSV
  const exportCSV = () => {
    const header = "ID,Client,Companie,Status,Ultimul mesaj,Data\n";
    const rows = messages
      .map(
        (m) =>
          `${m.id},"${m.customerName || "-"}","${m.companyName || "-"}",${
            m.status || "-"
          },"${m.lastMessage || ""}",${
            m.lastMessageAt?.seconds
              ? new Date(m.lastMessageAt.seconds * 1000).toLocaleString("ro-RO")
              : "-"
          }`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "messages_export.csv";
    a.click();
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
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-emerald-700 flex items-center gap-2">
              <MessageSquare size={26} /> Mesaje Clienți / Companii
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
              <Filter size={18} /> Filtrează conversațiile
            </div>
            <div className="flex gap-2">
              <select
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-400"
              >
                <option value="">Toate</option>
                <option value="active">Active</option>
                <option value="archived">Arhivate</option>
                <option value="reported">Raportate</option>
              </select>
              <div className="relative">
                <SearchCheck
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Caută client, companie..."
                  className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-400"
                  onChange={(e) => setSearch(e.target.value.toLowerCase())}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow bg-white/90">
            <table className="w-full text-sm">
              <thead className="bg-emerald-50 text-gray-800">
                <tr>
                  <th className="p-3 border-b">Client</th>
                  <th className="p-3 border-b">Companie</th>
                  <th className="p-3 border-b">Cereră</th>
                  <th className="p-3 border-b">Ultimul mesaj</th>
                  <th className="p-3 border-b">Status</th>
                  <th className="p-3 border-b text-center">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-emerald-50 transition">
                    <td className="p-3 border-b font-medium flex items-center gap-2">
                      <User size={14} className="text-emerald-600" />
                      {m.customerName || "-"}
                    </td>
                    <td className="p-3 border-b flex items-center gap-2">
                      <Building2 size={14} className="text-sky-600" />
                      {m.companyName || "-"}
                    </td>
                    <td className="p-3 border-b text-gray-600">{m.requestId || "-"}</td>
                    <td className="p-3 border-b text-gray-500 truncate max-w-[250px]">
                      {m.lastMessage || "-"}
                    </td>
                    <td className="p-3 border-b capitalize text-gray-700">
                      {m.status || "active"}
                    </td>
                    <td className="p-3 border-b text-center">
                      <button
                        onClick={() => setSelectedThread(m)}
                        className="text-emerald-600 hover:underline text-sm"
                      >
                        Vezi
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-gray-500 mt-6">
              Nu există conversații care să corespundă filtrelor.
            </p>
          )}

          {/* Modal */}
          {selectedThread && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-lg relative max-h-[80vh] overflow-y-auto">
                <button
                  onClick={() => setSelectedThread(null)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
                >
                  ✕
                </button>
                <h3 className="text-xl font-semibold text-emerald-700 mb-4 flex items-center gap-2">
                  <MessageSquare size={18} /> Conversație
                </h3>
                <div className="text-sm text-gray-700 space-y-3">
                  <p><strong>Client:</strong> {selectedThread.customerName}</p>
                  <p><strong>Companie:</strong> {selectedThread.companyName}</p>
                  <p><strong>Status:</strong> {selectedThread.status}</p>
                  <p className="mt-2 font-semibold text-emerald-700">Mesaje:</p>
                  <div className="border border-gray-200 rounded-xl p-3 bg-gray-50 max-h-[300px] overflow-y-auto">
                    {selectedThread.messages?.map((msg: any, idx: number) => (
                      <div
                        key={idx}
                        className={`mb-2 ${
                          msg.from === "company"
                            ? "text-right text-sky-700"
                            : "text-left text-gray-700"
                        }`}
                      >
                        <p className="text-xs text-gray-400">
                          {msg.timestamp?.seconds
                            ? new Date(msg.timestamp.seconds * 1000).toLocaleString("ro-RO")
                            : ""}
                        </p>
                        <p className="bg-white shadow-sm inline-block px-3 py-1 rounded-xl">
                          {msg.text}
                        </p>
                      </div>
                    ))}
                  </div>
                  {selectedThread.status === "reported" && (
                    <div className="mt-4">
                      <button className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition">
                        <Ban size={16} /> Suspendă Compania
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
