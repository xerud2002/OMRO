"use client";
import { useEffect, useState } from "react";
import { db, onAuthChange } from "../../utils/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import AdminLayout from "../../components/AdminLayout";
import AdminProtectedRoute from "../../components/AdminProtectedRoute";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Building2,
  CheckCircle2,
  XCircle,
  FileText,
  FileCheck,
  Eye,
  Ban,
  Mail,
  Loader2,
  MapPin,
  ShieldCheck,
} from "lucide-react";

export default function AdminCompaniesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<any[]>([]);
  const [tab, setTab] = useState<"verified" | "pending">("pending");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Load all companies
  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (!u) {
        router.push("/company/auth");
        return;
      }

      const userSnap = await getDocs(collection(db, "users"));
      const currentUser = userSnap.docs.find(
        (d) => d.id === u.uid && d.data().role === "admin"
      );
      if (!currentUser) {
        toast.error("⛔ Acces interzis!");
        router.push("/");
        return;
      }

      const snap = await getDocs(collection(db, "companies"));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCompanies(list);
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  // Verification toggle
  const toggleVerification = async (id: string, currentStatus: boolean) => {
    setProcessingId(id);
    try {
      await updateDoc(doc(db, "companies", id), {
        verified: !currentStatus,
      });
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, verified: !currentStatus } : c
        )
      );
      toast.success(
        currentStatus
          ? "Compania a fost trecută ca ne-verificată."
          : "✅ Compania a fost verificată cu succes!"
      );
    } catch (err) {
      toast.error("Eroare la actualizare!");
    } finally {
      setProcessingId(null);
    }
  };

  // Suspend account
  const suspendAccount = async (id: string) => {
    if (!confirm("Sigur vrei să suspendezi această companie?")) return;
    setProcessingId(id);
    try {
      await updateDoc(doc(db, "companies", id), { suspended: true });
      toast.success("🚫 Contul companiei a fost suspendat!");
    } catch {
      toast.error("Eroare la suspendare!");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredCompanies = companies.filter((c) =>
    tab === "verified" ? c.verified : !c.verified
  );

  if (loading)
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-[70vh] text-emerald-600 text-lg">
          <Loader2 className="animate-spin mr-2" /> Se încarcă companiile...
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
            <Building2 size={28} /> Gestionare companii
          </h1>

          {/* Tabs */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              className={`px-5 py-2 rounded-full font-medium text-sm transition-all ${
                tab === "pending"
                  ? "bg-emerald-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setTab("pending")}
            >
              🕒 În așteptare
            </button>
            <button
              className={`px-5 py-2 rounded-full font-medium text-sm transition-all ${
                tab === "verified"
                  ? "bg-sky-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setTab("verified")}
            >
              ✅ Verificate
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow">
            <table className="w-full text-sm">
              <thead className="bg-emerald-50 text-gray-800">
                <tr>
                  <th className="p-3 border-b">Nume companie</th>
                  <th className="p-3 border-b">Email</th>
                  <th className="p-3 border-b">Telefon</th>
                  <th className="p-3 border-b">Zone acoperite</th>
                  <th className="p-3 border-b">Documente</th>
                  <th className="p-3 border-b text-center">Status</th>
                  <th className="p-3 border-b text-center">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-emerald-50 transition"
                  >
                    <td className="p-3 border-b font-medium text-emerald-700">
                      {c.name || "Companie fără nume"}
                    </td>
                    <td className="p-3 border-b">{c.email || "-"}</td>
                    <td className="p-3 border-b">{c.phone || "-"}</td>
                    <td className="p-3 border-b">
                      {Array.isArray(c.counties)
                        ? c.counties.join(", ")
                        : "-"}
                    </td>

                    <td className="p-3 border-b text-sm space-y-1">
                      {c.documents?.insurance && (
                        <a
                          href={c.documents.insurance}
                          target="_blank"
                          className="block text-sky-600 hover:underline"
                        >
                          📄 Asigurare
                        </a>
                      )}
                      {c.documents?.certificate && (
                        <a
                          href={c.documents.certificate}
                          target="_blank"
                          className="block text-sky-600 hover:underline"
                        >
                          🧾 Certificat
                        </a>
                      )}
                      {c.documents?.id && (
                        <a
                          href={c.documents.id}
                          target="_blank"
                          className="block text-sky-600 hover:underline"
                        >
                          🪪 ID
                        </a>
                      )}
                      {!c.documents && <span className="text-gray-400">–</span>}
                    </td>

                    <td className="p-3 border-b text-center">
                      {c.verified ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          <CheckCircle2 size={14} /> Verificată
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                          <XCircle size={14} /> În așteptare
                        </span>
                      )}
                    </td>

                    <td className="p-3 border-b text-center space-x-2">
                      {processingId === c.id ? (
                        <Loader2 className="animate-spin inline text-emerald-600" size={16} />
                      ) : (
                        <>
                          {/* Verify toggle */}
                          <button
                            onClick={() =>
                              toggleVerification(c.id, c.verified)
                            }
                            className={`${
                              c.verified
                                ? "text-yellow-600 hover:text-yellow-700"
                                : "text-emerald-600 hover:text-emerald-700"
                            } font-medium text-sm`}
                          >
                            {c.verified ? (
                              <ShieldCheck size={15} className="inline mr-1" />
                            ) : (
                              <FileCheck size={15} className="inline mr-1" />
                            )}
                            {c.verified ? "Revocă" : "Verifică"}
                          </button>

                          {/* View */}
                          <button
                            onClick={() => router.push(`/admin/companies/${c.id}`)}
                            className="text-sky-600 hover:underline text-sm font-medium"
                          >
                            <Eye size={15} className="inline mr-1" /> Profil
                          </button>

                          {/* Suspend */}
                          <button
                            onClick={() => suspendAccount(c.id)}
                            className="text-red-500 hover:text-red-600 text-sm font-medium"
                          >
                            <Ban size={15} className="inline mr-1" /> Suspendă
                          </button>

                          {/* Message */}
                          <button
                            onClick={() =>
                              toast.success("💬 Reminder trimis companiei!")
                            }
                            className="text-gray-600 hover:text-emerald-600 text-sm font-medium"
                          >
                            <Mail size={14} className="inline mr-1" /> Mesaj
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCompanies.length === 0 && (
            <p className="text-center text-gray-500 mt-6">
              Nu există companii în această categorie.
            </p>
          )}
        </motion.div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
