"use client";
import { useEffect, useState } from "react";
import { db, onAuthChange } from "../../utils/firebase";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import {
  User,
  Loader2,
  Trash2,
  Eye,
  Ban,
  CheckCircle2,
  Search,
  X,
  Mail,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import AdminLayout from "../../components/AdminLayout";
import AdminProtectedRoute from "../../components/AdminProtectedRoute";
import { logActivity } from "../../utils/logActivity";

interface UserData {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  suspended?: boolean;
}
interface RequestData {
  id: string;
  userId?: string;
  pickupCity?: string;
  deliveryCity?: string;
  moveDate?: string;
  status?: string;
}

export default function AdminClientsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<UserData[]>([]);
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [selectedClient, setSelectedClient] = useState<UserData | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "active" | "suspended">("all");

  // 🔹 Load clients + requests
  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (!u) return router.push("/company/auth");

      const snap = await getDoc(doc(db, "users", u.uid));
      const isAdmin = snap.exists() && snap.data().role === "admin";
      if (!isAdmin) {
        toast.error("⛔ Acces interzis!");
        router.push("/");
        return;
      }

      const [usersSnap, requestsSnap] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "requests")),
      ]);

      setClients(
        usersSnap.docs
          .map((d) => ({ id: d.id, ...(d.data() as UserData) }))
          .filter((u) => u.role === "customer")
      );
      setRequests(
        requestsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as RequestData) }))
      );
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  if (loading)
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-[70vh] text-emerald-600 text-lg">
          <Loader2 className="animate-spin mr-2" /> Se încarcă lista clienților...
        </div>
      </AdminLayout>
    );

  // 🔍 Filtering
  const filteredClients = clients.filter((c) => {
    const matchSearch = `${c.name || ""} ${c.email || ""}`
      .toLowerCase()
      .includes(search.toLowerCase());
    if (tab === "active") return !c.suspended && matchSearch;
    if (tab === "suspended") return c.suspended && matchSearch;
    return matchSearch;
  });

  // 🧩 Suspend / Reactivate
  const handleSuspendClient = async (client: UserData, suspended: boolean) => {
    setProcessingId(client.id);
    await updateDoc(doc(db, "users", client.id), { suspended });
    await logActivity(
      "client_status",
      `${suspended ? "⛔ Suspendare" : "✅ Reactivare"} cont client ${client.name}`,
      client,
      client.id
    );
    setClients((prev) =>
      prev.map((c) => (c.id === client.id ? { ...c, suspended } : c))
    );
    toast.success(
      suspended
        ? "⏸️ Clientul a fost suspendat."
        : "🟢 Contul clientului a fost reactivat."
    );
    setProcessingId(null);
  };

  // 🗑️ Delete client
  const handleDeleteClient = async (id: string, name?: string) => {
    if (!confirm(`Ștergi definitiv clientul ${name || "necunoscut"}?`)) return;
    setProcessingId(id);
    await deleteDoc(doc(db, "users", id));
    await logActivity("client_delete", `Clientul ${name} a fost șters.`, { name }, id);
    setClients((prev) => prev.filter((c) => c.id !== id));
    setProcessingId(null);
    toast.success("🗑️ Clientul a fost șters!");
  };

  // ✉️ Send message (placeholder)
  const handleMessage = async (client: UserData) => {
    toast.success(`💬 Mesaj trimis către ${client.name}`);
    await logActivity(
      "client_message",
      `Adminul a trimis un mesaj către clientul ${client.name}`,
      client,
      client.id
    );
  };

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto p-8 bg-white/80 rounded-3xl shadow-md mt-8 mb-20 border border-emerald-100"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-3">
            <h1 className="text-3xl font-bold text-emerald-700 flex items-center gap-2">
              <Users size={26} /> Gestionare Clienți
            </h1>
            <div className="flex items-center gap-2">
              <Search size={18} className="text-gray-400 absolute ml-3" />
              <input
                type="text"
                placeholder="Caută client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-3 mb-6 flex-wrap">
            {["all", "active", "suspended"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t as any)}
                className={`px-5 py-2 rounded-full font-medium text-sm transition-all ${
                  tab === t
                    ? "bg-gradient-to-r from-emerald-500 to-sky-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t === "all"
                  ? "👥 Toți"
                  : t === "active"
                  ? "🟢 Activ"
                  : "⛔ Suspendați"}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow">
            <table className="w-full text-sm">
              <thead className="bg-emerald-50 text-left">
                <tr>
                  <th className="p-3 border-b">Nume</th>
                  <th className="p-3 border-b">Email</th>
                  <th className="p-3 border-b">Telefon</th>
                  <th className="p-3 border-b text-center">Status</th>
                  <th className="p-3 border-b text-center">Cererile</th>
                  <th className="p-3 border-b text-center">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((c) => {
                  const clientRequests = requests.filter((r) => r.userId === c.id);
                  return (
                    <tr
                      key={c.id}
                      className={`transition ${
                        c.suspended ? "bg-red-50" : "hover:bg-emerald-50"
                      }`}
                    >
                      <td className="p-3 border-b font-medium text-emerald-800">
                        {c.name || "-"}
                      </td>
                      <td className="p-3 border-b">{c.email || "-"}</td>
                      <td className="p-3 border-b">{c.phone || "-"}</td>
                      <td className="p-3 border-b text-center">
                        {c.suspended ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                            <Ban size={13} /> Suspendat
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                            <CheckCircle2 size={13} /> Activ
                          </span>
                        )}
                      </td>
                      <td className="p-3 border-b text-center">
                        {clientRequests.length}
                      </td>
                      <td className="p-3 border-b text-center space-x-2">
                        {processingId === c.id ? (
                          <Loader2
                            className="inline animate-spin text-emerald-600"
                            size={16}
                          />
                        ) : (
                          <>
                            <button
                              onClick={() => setSelectedClient(c)}
                              className="text-emerald-600 hover:underline text-sm font-medium"
                            >
                              <Eye size={14} className="inline mr-1" /> Vezi
                            </button>
                            <button
                              onClick={() =>
                                handleSuspendClient(c, !c.suspended)
                              }
                              className={`text-sm font-medium ${
                                c.suspended
                                  ? "text-gray-600 hover:text-green-600"
                                  : "text-yellow-600 hover:text-yellow-700"
                              }`}
                            >
                              <Ban size={14} className="inline mr-1" />
                              {c.suspended ? "Activează" : "Suspendă"}
                            </button>
                            <button
                              onClick={() => handleMessage(c)}
                              className="text-sky-600 hover:underline text-sm font-medium"
                            >
                              <Mail size={13} className="inline mr-1" /> Mesaj
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteClient(c.id, c.name)
                              }
                              className="text-red-600 hover:underline text-sm font-medium"
                            >
                              <Trash2 size={13} className="inline mr-1" /> Șterge
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Modal */}
          {selectedClient && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            >
              <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 relative border border-emerald-100">
                <button
                  onClick={() => setSelectedClient(null)}
                  className="absolute top-3 right-5 text-gray-500 hover:text-emerald-700"
                >
                  <X size={20} />
                </button>

                <h2 className="text-2xl font-bold mb-4 text-emerald-700 flex items-center gap-2">
                  <User size={22} /> Detalii Client
                </h2>

                <div className="text-sm text-gray-700 space-y-2">
                  <p><strong>Nume:</strong> {selectedClient.name}</p>
                  <p><strong>Email:</strong> {selectedClient.email}</p>
                  <p><strong>Telefon:</strong> {selectedClient.phone}</p>
                  <p><strong>Status:</strong> {selectedClient.suspended ? "Suspendat" : "Activ"}</p>
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold text-emerald-700 mb-2">
                    Cererile făcute:
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-1 max-h-40 overflow-auto">
                    {requests
                      .filter((r) => r.userId === selectedClient.id)
                      .map((r) => (
                        <li key={r.id}>
                          📦 {r.pickupCity} → {r.deliveryCity} ({r.status || "nouă"})
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
