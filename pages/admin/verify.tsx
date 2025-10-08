"use client";
import { useEffect, useState } from "react";
import { db, onAuthChange } from "../../utils/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  ShieldCheck,
  Loader2,
  Ban,
  CheckCircle2,
  FileText,
  Eye,
} from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import AdminProtectedRoute from "../../components/AdminProtectedRoute";
import { logActivity } from "../../utils/logActivity";

interface CompanyData {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  counties?: string[];
  submittedForVerification?: boolean;
  verified?: boolean;
  rejected?: boolean;
  rejectReason?: string;
  documents?: {
    insurance?: string;
    certificate?: string;
    id?: string;
  };
}

export default function AdminVerifyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // 🔹 Load only pending companies
  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (!u) {
        router.push("/company/auth");
        return;
      }

      const userSnap = await getDoc(doc(db, "users", u.uid));
      if (!userSnap.exists() || userSnap.data().role !== "admin") {
        toast.error("⛔ Acces interzis!");
        router.push("/");
        return;
      }

      const snap = await getDocs(collection(db, "companies"));
      const pending: CompanyData[] = snap.docs
        .map((d) => ({
          id: d.id,
          ...(d.data() as Omit<CompanyData, "id">),
        }))
        .filter((c) => c.submittedForVerification && !c.verified);

      setCompanies(pending);
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  // ✅ Approve verification
  const approveCompany = async (id: string, name?: string) => {
    setProcessingId(id);
    try {
      await updateDoc(doc(db, "companies", id), {
        verified: true,
        submittedForVerification: false,
        verifiedAt: new Date(),
      });
      await logActivity(
        "verify_approve",
        `Compania ${name || "-"} a fost verificată cu succes.`,
        { name },
        id
      );
      setCompanies((prev) => prev.filter((c) => c.id !== id));
      toast.success(`✅ ${name} a fost verificată!`);
    } catch (err) {
      console.error(err);
      toast.error("Eroare la verificare!");
    } finally {
      setProcessingId(null);
    }
  };

  // ❌ Reject company
  const rejectCompany = async (id: string, name?: string) => {
    if (!rejectReason.trim()) return toast.error("Adaugă un motiv de respingere!");
    setProcessingId(id);
    try {
      await updateDoc(doc(db, "companies", id), {
        rejected: true,
        rejectReason,
        submittedForVerification: false,
      });
      await logActivity(
        "verify_reject",
        `Compania ${name || "-"} a fost respinsă: ${rejectReason}`,
        { name, rejectReason },
        id
      );
      setCompanies((prev) => prev.filter((c) => c.id !== id));
      toast.success(`❌ ${name} a fost respinsă.`);
      setRejectingId(null);
      setRejectReason("");
    } catch (err) {
      toast.error("Eroare la respingere!");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading)
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[70vh] text-emerald-600">
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
            <ShieldCheck size={26} /> Verificare companii în așteptare
          </h1>

          {companies.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">
              Nu există companii în așteptare pentru verificare.
            </p>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow">
              <table className="w-full text-sm">
                <thead className="bg-emerald-50 text-gray-800">
                  <tr>
                    <th className="p-3 border-b">Nume companie</th>
                    <th className="p-3 border-b">Email</th>
                    <th className="p-3 border-b">Telefon</th>
                    <th className="p-3 border-b">Zone acoperite</th>
                    <th className="p-3 border-b">Documente</th>
                    <th className="p-3 border-b text-center">Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((c) => (
                    <tr key={c.id} className="hover:bg-emerald-50 transition">
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
                        {!c.documents && (
                          <span className="text-gray-400">–</span>
                        )}
                      </td>
                      <td className="p-3 border-b text-center space-x-2">
                        {processingId === c.id ? (
                          <Loader2
                            className="inline animate-spin text-emerald-600"
                            size={16}
                          />
                        ) : rejectingId === c.id ? (
                          <div className="flex flex-col items-center gap-2">
                            <textarea
                              placeholder="Motiv respingere..."
                              value={rejectReason}
                              onChange={(e) =>
                                setRejectReason(e.target.value)
                              }
                              className="border border-gray-300 rounded-lg px-2 py-1 w-48 text-xs"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  rejectCompany(c.id, c.name)
                                }
                                className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs"
                              >
                                Confirmă
                              </button>
                              <button
                                onClick={() => setRejectingId(null)}
                                className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-xs"
                              >
                                Anulează
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => approveCompany(c.id, c.name)}
                              className="text-green-600 hover:underline text-sm font-medium"
                            >
                              <CheckCircle2 size={14} className="inline mr-1" />
                              Aprobă
                            </button>
                            <button
                              onClick={() => setRejectingId(c.id)}
                              className="text-red-600 hover:underline text-sm font-medium"
                            >
                              <Ban size={14} className="inline mr-1" />
                              Respinge
                            </button>
                            <button
                              onClick={() =>
                                window.open(`/company/${c.id}`, "_blank")
                              }
                              className="text-sky-600 hover:underline text-sm font-medium"
                            >
                              <Eye size={14} className="inline mr-1" />
                              Vizualizează
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
