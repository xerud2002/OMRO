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
import {
  Building2,
  Loader2,
  Eye,
  CheckCircle,
  XCircle,
  Trash2,
  Ban,
  RefreshCcw,
  FileText,
  Search,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import AdminLayout from "../../components/AdminLayout";
import AdminProtectedRoute from "../../components/AdminProtectedRoute";

interface CompanyData {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  county?: string;
  address?: string;
  cui?: string;
  contactName?: string;
  verified?: boolean;
  suspended?: boolean;
  submittedForVerification?: boolean;
  services?: string[];
  documents?: string[];
}

export default function AdminCompaniesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
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

      const all = await getDocs(collection(db, "companies"));
      setCompanies(all.docs.map((d) => ({ ...(d.data() as CompanyData), id: d.id }))); // ✅ fixed overwrite warning
      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  if (loading)
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-[70vh] text-emerald-600 text-lg">
          Se încarcă lista companiilor...
        </div>
      </AdminLayout>
    );

  // 🔍 Filtrare + căutare
  const filteredCompanies = companies.filter((c) => {
    const matchesSearch =
      `${c.name || ""} ${c.email || ""}`.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "verified"
        ? c.verified
        : filter === "pending"
        ? c.submittedForVerification && !c.verified
        : filter === "suspended"
        ? c.suspended
        : true;

    return matchesSearch && matchesFilter;
  });

  // 🔧 Handlers
  const handleApprove = async (id: string) => {
    setProcessingId(id);
    await updateDoc(doc(db, "companies", id), {
      verified: true,
      suspended: false,
      submittedForVerification: false,
    });
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, verified: true, suspended: false } : c))
    );
    toast.success("✅ Compania a fost aprobată!");
    setProcessingId(null);
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    await updateDoc(doc(db, "companies", id), {
      verified: false,
      submittedForVerification: false,
    });
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, verified: false } : c))
    );
    toast.error("❌ Verificarea a fost respinsă.");
    setProcessingId(null);
  };

  const handleSuspend = async (id: string, suspended: boolean) => {
    setProcessingId(id);
    await updateDoc(doc(db, "companies", id), { suspended });
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, suspended } : c))
    );
    toast.success(
      suspended ? "⏸️ Compania a fost suspendată." : "🟢 Reactivată cu succes."
    );
    setProcessingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Sigur vrei să ștergi această companie?")) return;
    setProcessingId(id);
    await deleteDoc(doc(db, "companies", id));
    setCompanies((prev) => prev.filter((c) => c.id !== id));
    setProcessingId(null);
    toast.success("🗑️ Compania a fost ștearsă.");
  };

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="max-w-7xl mx-auto p-8 bg-white rounded-3xl shadow-md mt-8 mb-20">
          <h1 className="text-3xl font-bold text-center text-emerald-700 mb-10">
            🏢 Gestionare Companii
          </h1>

          {/* --- Search + Filter --- */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
            <div className="relative w-full md:w-1/3">
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
                aria-hidden="true"
              />
              <input
                aria-label="Caută companie"
                type="text"
                placeholder="Caută după nume sau email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <select
              aria-label="Filtru companii"
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-400"
            >
              <option value="">Toate</option>
              <option value="verified">Verificate</option>
              <option value="pending">În așteptare</option>
              <option value="suspended">Suspendate</option>
            </select>
          </div>

          {/* --- Companies Table --- */}
          <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow">
            <table className="w-full text-sm">
              <thead className="bg-emerald-50 text-left">
                <tr>
                  <th className="p-3 border-b">Nume firmă</th>
                  <th className="p-3 border-b">Email</th>
                  <th className="p-3 border-b">Județ</th>
                  <th className="p-3 border-b text-center">Status</th>
                  <th className="p-3 border-b text-center">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map((c) => (
                  <tr key={c.id} className="hover:bg-emerald-50 transition">
                    <td className="p-3 border-b font-medium">{c.name || "-"}</td>
                    <td className="p-3 border-b">{c.email || "-"}</td>
                    <td className="p-3 border-b">{c.county || "-"}</td>
                    <td className="p-3 border-b text-center">
                      {c.suspended ? (
                        <span className="text-red-600 font-semibold">Suspendată</span>
                      ) : c.verified ? (
                        <span className="text-green-600 font-semibold">Verificată</span>
                      ) : c.submittedForVerification ? (
                        <span className="text-orange-600 font-semibold">În așteptare</span>
                      ) : (
                        <span className="text-gray-500">Neverificată</span>
                      )}
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
                            title="Vezi detalii companie"
                            aria-label="Vezi detalii companie"
                            onClick={() => setSelectedCompany(c)}
                            className="text-emerald-600 hover:underline font-medium"
                          >
                            <Eye size={14} className="inline" /> Vezi
                          </button>

                          {c.submittedForVerification && !c.verified && (
                            <>
                              <button
                                title="Aprobă compania"
                                aria-label="Aprobă compania"
                                onClick={() => handleApprove(c.id)}
                                className="text-green-600 hover:underline font-medium"
                              >
                                <CheckCircle size={14} className="inline" /> Aprobă
                              </button>
                              <button
                                title="Respinge verificarea"
                                aria-label="Respinge verificarea"
                                onClick={() => handleReject(c.id)}
                                className="text-red-600 hover:underline font-medium"
                              >
                                <XCircle size={14} className="inline" /> Respinge
                              </button>
                            </>
                          )}

                          {c.verified && !c.suspended && (
                            <button
                              title="Suspendă compania"
                              aria-label="Suspendă compania"
                              onClick={() => handleSuspend(c.id, true)}
                              className="text-yellow-600 hover:underline font-medium"
                            >
                              <Ban size={14} className="inline" /> Suspendă
                            </button>
                          )}

                          {c.suspended && (
                            <button
                              title="Reactivează compania"
                              aria-label="Reactivează compania"
                              onClick={() => handleSuspend(c.id, false)}
                              className="text-blue-600 hover:underline font-medium"
                            >
                              <RefreshCcw size={14} className="inline" /> Reactivează
                            </button>
                          )}

                          <button
                            title="Șterge compania"
                            aria-label="Șterge compania"
                            onClick={() => handleDelete(c.id)}
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

          {/* --- Modal Detalii --- */}
          {selectedCompany && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            >
              <div
                role="dialog"
                aria-modal="true"
                className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8 relative border border-emerald-100"
              >
                <button
                  title="Închide detalii companie"
                  aria-label="Închide detalii companie"
                  className="absolute top-4 right-5 text-gray-500 hover:text-emerald-700"
                  onClick={() => setSelectedCompany(null)}
                >
                  <X size={22} />
                </button>

                <h2 className="text-2xl font-bold mb-4 text-emerald-700 flex items-center gap-2">
                  <Building2 size={22} /> Detalii Companie
                </h2>

                <div className="text-sm text-gray-700 space-y-2">
                  <p><strong>Nume:</strong> {selectedCompany.name}</p>
                  <p><strong>Email:</strong> {selectedCompany.email}</p>
                  <p><strong>Telefon:</strong> {selectedCompany.phone}</p>
                  <p><strong>Oraș:</strong> {selectedCompany.city}</p>
                  <p><strong>Județ:</strong> {selectedCompany.county}</p>
                  <p><strong>CUI:</strong> {selectedCompany.cui}</p>
                  <p><strong>Adresă:</strong> {selectedCompany.address}</p>
                  <p><strong>Persoană contact:</strong> {selectedCompany.contactName}</p>
                  <p><strong>Servicii:</strong> {selectedCompany.services?.join(", ")}</p>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2 text-emerald-600 flex items-center gap-2">
                    <FileText size={16} /> Documente încărcate
                  </h3>
                  {selectedCompany.documents?.length ? (
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {selectedCompany.documents.map((url, i) => (
                        <li key={i}>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Document {i + 1}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">Niciun document încărcat.</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
