"use client";
import { useEffect, useState } from "react";
import { db, onAuthChange } from "../../utils/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
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
  Eye,
  Ban,
  Mail,
  Loader2,
  ShieldCheck,
  Users,
  Search,
  RefreshCw,
} from "lucide-react";
import { logActivity } from "../../utils/logActivity";

export default function AdminCompaniesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<any[]>([]);
  const [tab, setTab] = useState<"pending" | "verified" | "suspended">("pending");
  const [search, setSearch] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // ✅ Load all companies
  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (!u) return router.push("/company/auth");

      const usersSnap = await getDocs(collection(db, "users"));
      const currentUser = usersSnap.docs.find(
        (d) => d.id === u.uid && d.data().role === "admin"
      );
      if (!currentUser) {
        toast.error("⛔ Acces interzis!");
        router.push("/");
        return;
      }

      await fetchCompanies();
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  const fetchCompanies = async () => {
    const snap = await getDocs(collection(db, "companies"));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setCompanies(list);
  };

  // ✅ Toggle verification
  const toggleVerification = async (id: string, currentStatus: boolean, company: any) => {
    setProcessingId(id);
    try {
      await updateDoc(doc(db, "companies", id), { verified: !currentStatus });
      await logActivity(
        "verification",
        `${!currentStatus ? "✅ Verificare" : "❌ Revocare"} pentru compania ${company.name}`,
        { email: company.email, name: company.name },
        id
      );

      setCompanies((prev) =>
        prev.map((c) => (c.id === id ? { ...c, verified: !currentStatus } : c))
      );

      toast.success(
        !currentStatus
          ? "✅ Compania a fost verificată cu succes!"
          : "Compania a fost trecută ca ne-verificată."
      );
    } catch (err) {
      toast.error("Eroare la actualizare!");
    } finally {
      setProcessingId(null);
    }
  };

  // ✅ Suspend / Reinstate account
  const toggleSuspension = async (id: string, company: any) => {
    const confirmAction = confirm(
      company.suspended
        ? "Activezi din nou această companie?"
        : "Sigur vrei să suspendezi această companie?"
    );
    if (!confirmAction) return;

    setProcessingId(id);
    try {
      await updateDoc(doc(db, "companies", id), { suspended: !company.suspended });
      await logActivity(
        "suspension",
        `${company.suspended ? "♻️ Reactivare" : "🚫 Suspendare"} pentru ${company.name}`,
        { email: company.email, name: company.name },
        id
      );
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, suspended: !company.suspended } : c
        )
      );
      toast.success(
        company.suspended
          ? "✅ Contul companiei a fost reactivat!"
          : "🚫 Contul companiei a fost suspendat!"
      );
    } catch {
      toast.error("Eroare la suspendare!");
    } finally {
      setProcessingId(null);
    }
  };

  // ✅ Send reminder
  const sendReminder = async (company: any) => {
    toast.success(`💬 Reminder trimis companiei ${company.name}`);
    await logActivity(
      "reminder",
      `Adminul a trimis un reminder companiei ${company.name}`,
      { email: company.email, name: "Admin" },
      company.id
    );
  };

  // ✅ Filter
  const filteredCompanies = companies.filter((c) => {
    const matchesTab =
      tab === "verified"
        ? c.verified && !c.suspended
        : tab === "pending"
        ? !c.verified && !c.suspended
        : c.suspended;
    const matchesSearch =
      c.name?.toLowerCase().includes(search) ||
      c.email?.toLowerCase().includes(search) ||
      c.counties?.join(",")?.toLowerCase().includes(search);
    return matchesTab && (!search || matchesSearch);
  });

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
          {/* Header */}
          <div className="flex justify-between items-center mb-10 flex-wrap gap-3">
            <h1 className="text-3xl font-bold text-emerald-700 flex items-center gap-2">
              <Building2 size={26} /> Gestionare Companii
            </h1>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Caută companie..."
                onChange={(e) => setSearch(e.target.value.toLowerCase())}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-400"
              />
              <button
                onClick={fetchCompanies}
                className="flex items-center gap-2 px-3 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition"
              >
                <RefreshCw size={14} /> Actualizează
              </button>
            </div>
          </div>

          {/* KPI */}
          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            <KPI title="Verificate" value={companies.filter((c) => c.verified).length} color="green" icon={<CheckCircle2 />} />
            <KPI title="În așteptare" value={companies.filter((c) => !c.verified && !c.suspended).length} color="yellow" icon={<XCircle />} />
            <KPI title="Suspendate" value={companies.filter((c) => c.suspended).length} color="red" icon={<Ban />} />
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-3 mb-8 flex-wrap">
            {["pending", "verified", "suspended"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t as any)}
                className={`px-5 py-2 rounded-full font-medium text-sm transition-all ${
                  tab === t
                    ? "bg-gradient-to-r from-emerald-500 to-sky-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t === "pending"
                  ? "🕒 În așteptare"
                  : t === "verified"
                  ? "✅ Verificate"
                  : "🚫 Suspendate"}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow">
            <table className="w-full text-sm">
              <thead className="bg-emerald-50 text-gray-800">
                <tr>
                  <th className="p-3 border-b text-left">Companie</th>
                  <th className="p-3 border-b">Email</th>
                  <th className="p-3 border-b">Telefon</th>
                  <th className="p-3 border-b">Zone</th>
                  <th className="p-3 border-b text-center">Status</th>
                  <th className="p-3 border-b text-center">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map((c) => (
                  <tr key={c.id} className="hover:bg-emerald-50 transition">
                    <td className="p-3 border-b font-medium text-emerald-700">{c.name || "–"}</td>
                    <td className="p-3 border-b">{c.email || "–"}</td>
                    <td className="p-3 border-b">{c.phone || "–"}</td>
                    <td className="p-3 border-b">{c.counties?.join(", ") || "–"}</td>

                    <td className="p-3 border-b text-center">
                      {c.suspended ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                          <Ban size={14} /> Suspendată
                        </span>
                      ) : c.verified ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          <ShieldCheck size={14} /> Verificată
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
                          {!c.suspended && (
                            <button
                              onClick={() => toggleVerification(c.id, c.verified, c)}
                              className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                            >
                              {c.verified ? "Revocă" : "Verifică"}
                            </button>
                          )}
                          <button
                            onClick={() => router.push(`/admin/companies/${c.id}`)}
                            className="text-sky-600 hover:underline text-sm font-medium"
                          >
                            <Eye size={15} className="inline mr-1" /> Profil
                          </button>
                          <button
                            onClick={() => toggleSuspension(c.id, c)}
                            className={`text-sm font-medium ${
                              c.suspended
                                ? "text-gray-600 hover:text-green-600"
                                : "text-red-500 hover:text-red-600"
                            }`}
                          >
                            <Ban size={15} className="inline mr-1" />
                            {c.suspended ? "Activează" : "Suspendă"}
                          </button>
                          {!c.verified && (
                            <button
                              onClick={() => sendReminder(c)}
                              className="text-gray-600 hover:text-emerald-600 text-sm font-medium"
                            >
                              <Mail size={14} className="inline mr-1" /> Reminder
                            </button>
                          )}
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

/* Small KPI badge */
function KPI({ title, value, color, icon }: any) {
  const colorMap: Record<string, string> = {
    green: "text-green-600 bg-green-50",
    yellow: "text-yellow-600 bg-yellow-50",
    red: "text-red-600 bg-red-50",
  };
  return (
    <div
      className={`rounded-2xl border p-4 flex flex-col items-center justify-center ${colorMap[color]} border-gray-100 shadow-sm`}
    >
      <div className="flex items-center gap-2 mb-1">{icon}<h3 className="font-semibold">{title}</h3></div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
