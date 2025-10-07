"use client";
import { useEffect, useState } from "react";
import { db, onAuthChange } from "../../utils/firebase";
import { collection, getDocs, getDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { User, Loader2, Trash2, Eye, Ban, CheckCircle, Search, X } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import AdminLayout from "../../components/AdminLayout";
import AdminProtectedRoute from "../../components/AdminProtectedRoute";

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

      // Load clients + requests
      const [usersSnap, requestsSnap] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "requests")),
      ]);

      setClients(
        usersSnap.docs
          .map((d) => ({ ...(d.data() as UserData), id: d.id })) // ✅ fix overwrite warning
          .filter((u) => u.role === "customer")
      );

      setRequests(
        requestsSnap.docs.map((d) => ({ ...(d.data() as RequestData), id: d.id }))
      );

      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  if (loading)
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-[70vh] text-emerald-600 text-lg">
          Se încarcă lista clienților...
        </div>
      </AdminLayout>
    );

  // 🔍 Filtrare clienți
  const filteredClients = clients.filter((c) =>
    `${c.name || ""} ${c.email || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  // 🧩 Funcții de administrare
  const handleDeleteClient = async (id: string) => {
    if (!confirm("Sigur vrei să ștergi acest client?")) return;
    setProcessingId(id);
    await deleteDoc(doc(db, "users", id));
    setClients((prev) => prev.filter((c) => c.id !== id));
    setProcessingId(null);
    toast.success("🗑️ Clientul a fost șters!");
  };

  const handleSuspendClient = async (client: UserData, suspended: boolean) => {
    setProcessingId(client.id);
    await updateDoc(doc(db, "users", client.id), { suspended });
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

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="max-w-7xl mx-auto p-8 bg-white rounded-3xl shadow-md mt-8 mb-20">
          <h1 className="text-3xl font-bold text-center text-emerald-700 mb-10">
            👥 Gestionare Clienți
          </h1>

          {/* --- Search bar --- */}
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-full max-w-sm">
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
                aria-hidden="true"
              />
              <input
                aria-label="Caută client"
                type="text"
                placeholder="Caută după nume sau email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <p className="text-gray-600 text-sm">
              Total clienți: <strong>{clients.length}</strong>
            </p>
          </div>

          {/* --- Clients Table --- */}
          <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow">
            <table className="w-full text-sm">
              <thead className="bg-emerald-50 text-left">
                <tr>
                  <th className="p-3 border-b">Nume</th>
                  <th className="p-3 border-b">Email</th>
                  <th className="p-3 border-b">Telefon</th>
                  <th className="p-3 border-b text-center">Rol</th>
                  <th className="p-3 border-b text-center">Status cont</th>
                  <th className="p-3 border-b text-center">Cererile făcute</th>
                  <th className="p-3 border-b text-center">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((c) => {
                  const clientRequests = requests.filter((r) => r.userId === c.id);
                  return (
                    <tr key={c.id} className="hover:bg-emerald-50 transition">
                      <td className="p-3 border-b font-medium">{c.name || "-"}</td>
                      <td className="p-3 border-b">{c.email || "-"}</td>
                      <td className="p-3 border-b">{c.phone || "-"}</td>
                      <td className="p-3 border-b text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            c.role === "company"
                              ? "bg-blue-100 text-blue-700"
                              : c.role === "admin"
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {c.role}
                        </span>
                      </td>
                      <td className="p-3 border-b text-center">
                        {c.suspended ? (
                          <span className="text-red-600 font-semibold">Suspendat</span>
                        ) : (
                          <span className="text-green-600 font-semibold">Activ</span>
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
                            aria-hidden="true"
                          />
                        ) : (
                          <>
                            <button
                              title="Vezi detalii client"
                              aria-label="Vezi detalii client"
                              onClick={() => setSelectedClient(c)}
                              className="text-emerald-600 hover:underline font-medium"
                            >
                              <Eye size={14} className="inline" /> Vezi
                            </button>
                            {c.suspended ? (
                              <button
                                title="Reactivează clientul"
                                aria-label="Reactivează clientul"
                                onClick={() => handleSuspendClient(c, false)}
                                className="text-blue-600 hover:underline font-medium"
                              >
                                <CheckCircle size={14} className="inline" /> Reactivează
                              </button>
                            ) : (
                              <button
                                title="Suspendă clientul"
                                aria-label="Suspendă clientul"
                                onClick={() => handleSuspendClient(c, true)}
                                className="text-yellow-600 hover:underline font-medium"
                              >
                                <Ban size={14} className="inline" /> Suspendă
                              </button>
                            )}
                            <button
                              title="Șterge clientul"
                              aria-label="Șterge clientul"
                              onClick={() => handleDeleteClient(c.id)}
                              className="text-red-600 hover:underline font-medium"
                            >
                              <Trash2 size={14} className="inline" /> Șterge
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

          {/* --- Modal Detalii Client --- */}
          {selectedClient && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            >
              <div
                role="dialog"
                aria-modal="true"
                className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 relative border border-emerald-100"
              >
                <button
                  title="Închide detalii client"
                  aria-label="Închide detalii client"
                  className="absolute top-3 right-5 text-gray-500 hover:text-emerald-700"
                  onClick={() => setSelectedClient(null)}
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
                  <p><strong>Rol:</strong> {selectedClient.role}</p>
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
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
