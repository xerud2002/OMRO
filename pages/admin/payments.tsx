"use client";
import { useEffect, useState } from "react";
import { db, onAuthChange } from "../../utils/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useRouter } from "next/navigation";
import AdminLayout from "../../components/AdminLayout";
import AdminProtectedRoute from "../../components/AdminProtectedRoute";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  CreditCard,
  Wallet,
  CalendarDays,
  Building2,
  Barcode,
  Loader2,
  FileDown,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

export default function AdminPaymentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (!u) return router.push("/company/auth");
      const paymentsSnap = await getDocs(
        query(collection(db, "payments"), orderBy("createdAt", "desc"))
      );
      const list = paymentsSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setPayments(list);
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  const filtered = payments.filter((p) =>
    filter === "all" ? true : p.status === filter
  );

  const exportCSV = () => {
    const header = "Company,Job ID,Amount,Method,Status,Date\n";
    const rows = payments
      .map(
        (p) =>
          `${p.companyName || p.companyId},${p.jobId || "-"},${p.amount || 0},${
            p.method || "-"
          },${p.status || "-"},${
            p.createdAt?.seconds
              ? new Date(p.createdAt.seconds * 1000).toLocaleString("ro-RO")
              : "-"
          }`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "payments.csv";
    a.click();
  };

  if (loading)
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-[70vh] text-emerald-600 text-lg">
          <Loader2 className="animate-spin mr-2" /> Se încarcă plățile...
        </div>
      </AdminLayout>
    );

  const totalAmount = payments.reduce(
    (sum, p) => sum + (parseFloat(p.amount) || 0),
    0
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
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-3xl font-bold text-emerald-700 flex items-center gap-2">
              <CreditCard size={28} /> Plăți & Lead-uri
            </h1>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-white rounded-xl text-sm font-medium shadow-md hover:scale-[1.03] transition"
            >
              <FileDown size={16} /> Export CSV
            </button>
          </div>

          {/* Summary */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-r from-emerald-50 to-sky-50 p-4 rounded-2xl border border-emerald-100 text-center">
              <p className="text-gray-600 text-sm">Total plăți</p>
              <h2 className="text-2xl font-bold text-emerald-700">
                {payments.length}
              </h2>
            </div>
            <div className="bg-gradient-to-r from-emerald-50 to-sky-50 p-4 rounded-2xl border border-emerald-100 text-center">
              <p className="text-gray-600 text-sm">Suma totală</p>
              <h2 className="text-2xl font-bold text-emerald-700">
                {totalAmount.toFixed(2)} RON
              </h2>
            </div>
            <div className="bg-gradient-to-r from-emerald-50 to-sky-50 p-4 rounded-2xl border border-emerald-100 text-center">
              <p className="text-gray-600 text-sm">Status curent</p>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-emerald-400"
              >
                <option value="all">Toate</option>
                <option value="paid">Plătite</option>
                <option value="pending">În așteptare</option>
                <option value="failed">Eșuate</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow">
            <table className="w-full text-sm">
              <thead className="bg-emerald-50 text-gray-800">
                <tr>
                  <th className="p-3 border-b">Companie</th>
                  <th className="p-3 border-b">Cerere ID</th>
                  <th className="p-3 border-b text-right">Sumă</th>
                  <th className="p-3 border-b">Metodă</th>
                  <th className="p-3 border-b text-center">Status</th>
                  <th className="p-3 border-b">Dată</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-emerald-50 transition text-gray-700"
                  >
                    <td className="p-3 border-b flex items-center gap-2">
                      <Building2 size={14} className="text-emerald-600" />
                      {p.companyName || p.companyId || "-"}
                    </td>
                    <td className="p-3 border-b flex items-center gap-1 text-xs text-gray-600">
                      <Barcode size={13} className="text-sky-600" />
                      {p.jobId || "-"}
                    </td>
                    <td className="p-3 border-b text-right font-semibold text-emerald-700">
                      {p.amount ? `${p.amount} RON` : "-"}
                    </td>
                    <td className="p-3 border-b">{p.method || "-"}</td>
                    <td className="p-3 border-b text-center">
                      {p.status === "paid" ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          <CheckCircle2 size={12} /> Plătită
                        </span>
                      ) : p.status === "pending" ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                          <Clock size={12} /> În așteptare
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                          <XCircle size={12} /> Eșuată
                        </span>
                      )}
                    </td>
                    <td className="p-3 border-b text-gray-500 text-xs">
                      {p.createdAt?.seconds
                        ? new Date(p.createdAt.seconds * 1000).toLocaleString("ro-RO")
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-gray-500 mt-6">
              Nu există plăți înregistrate pentru acest filtru.
            </p>
          )}
        </motion.div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
